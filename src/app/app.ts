import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import {
  CalendarEventInput,
  EventStatus,
  FilterStatus,
  PositionedEvent,
  ViewMode,
  WeekDay
} from './models.calendar';
import { CalendarToolbarComponent } from './components/calendar-toolbar.component';
import { DayViewComponent } from './components/day-view.component';
import { EventEditPanelComponent } from './components/event-edit-panel.component';
import { WeekViewComponent } from './components/week-view.component';

@Component({
  selector: 'app-root',
  imports: [CalendarToolbarComponent, DayViewComponent, EventEditPanelComponent, WeekViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None
})
export class App {
  readonly pxPerMinute = 1.1;
  readonly weekDays: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly workingWeekDays: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  readonly viewModes: ViewMode[] = ['DAY', 'WeekDAY', 'WorkingWeeks', 'WholeWeek'];
  readonly activeView = signal<ViewMode>('WholeWeek');

  readonly activeFilter = signal<FilterStatus>('All');
  readonly editingEventId = signal<string | null>(null);
  readonly editDraft = signal<{ title: string; day: WeekDay; start: string; end: string; status: EventStatus } | null>(
    null
  );

  readonly rawEvents = signal<CalendarEventInput[]>([
    { id: 'e1', title: 'Daily Standup', day: 'Mon', start: '09:00', end: '09:45', status: 'Completed' },
    { id: 'e2', title: 'Design Review', day: 'Mon', start: '09:15', end: '10:30', status: 'Scheduled' },
    { id: 'e3', title: '1:1 Sync', day: 'Tue', start: '10:00', end: '11:00', status: 'Scheduled' },
    { id: 'e4', title: 'API Planning', day: 'Tue', start: '11:10', end: '12:00', status: 'Cancelled' },
    { id: 'e5', title: 'Lunch', day: 'Wed', start: '12:15', end: '13:00', status: 'Completed' },
    { id: 'e6', title: 'Roadmap', day: 'Wed', start: '12:20', end: '14:00', status: 'Scheduled' },
    { id: 'e7', title: 'Interview Debrief', day: 'Thu', start: '12:35', end: '13:15', status: 'Scheduled' },
    { id: 'e8', title: 'Focus Block', day: 'Fri', start: '15:00', end: '17:00', status: 'Scheduled' },
    { id: 'e9', title: 'Quick Sync', day: 'Sat', start: '15:45', end: '16:10', status: 'Completed' },
    { id: 'e10', title: 'Wrap-up', day: 'Sun', start: '17:10', end: '18:00', status: 'Scheduled' },
    { id: 'e11', title: 'Planning', day: 'Mon', start: '14:00', end: '15:30', status: 'Scheduled' },
    { id: 'e12', title: 'Team Retro', day: 'Fri', start: '10:30', end: '11:30', status: 'Scheduled' }
  ]);

  readonly dayRange = computed(() => {
    const mode = this.activeView();
    if (mode === 'DAY') {
      return { start: 0, end: 24 * 60, label: '00:00 - 24:00' };
    }
    if (mode === 'WorkingWeeks') {
      return { start: 9 * 60, end: 18 * 60, label: '09:00 - 18:00' };
    }
    return { start: 8 * 60, end: 21 * 60, label: '08:00 - 21:00' };
  });

  readonly dayStart = computed(() => this.dayRange().start);
  readonly dayEnd = computed(() => this.dayRange().end);
  readonly dayHeightPx = computed(() => (this.dayEnd() - this.dayStart()) * this.pxPerMinute);
  readonly hourSlotPx = computed(() => 60 * this.pxPerMinute);

  readonly filteredEvents = computed(() => {
    const f = this.activeFilter();
    const events = this.rawEvents();
    if (f === 'All') {
      return events;
    }
    return events.filter((e) => e.status === f);
  });

  readonly positionedEvents = computed(() =>
    this.layoutEvents(this.filteredEvents(), this.dayStart(), this.dayEnd())
  );

  readonly weekPositionedEvents = computed(() => {
    const events = this.filteredEvents();
    const start = this.dayStart();
    const end = this.dayEnd();
    const days = this.activeView() === 'WorkingWeeks' ? this.workingWeekDays : this.weekDays;
    return days.map((d) => ({
      day: d,
      events: this.layoutEvents(
        events.filter((e) => e.day === d),
        start,
        end
      )
    }));
  });

  readonly statusCounts = computed(() => {
    const events = this.rawEvents();
    return {
      all: events.length,
      scheduled: events.filter((e) => e.status === 'Scheduled').length,
      completed: events.filter((e) => e.status === 'Completed').length,
      cancelled: events.filter((e) => e.status === 'Cancelled').length
    };
  });

  readonly hours = computed(() => {
    const arr: string[] = [];
    for (let m = this.dayStart(); m <= this.dayEnd(); m += 60) {
      arr.push(this.toHHMM(m));
    }
    return arr;
  });

  readonly isWeekLayout = computed(() => this.activeView() === 'WholeWeek' || this.activeView() === 'WorkingWeeks');

  setView(mode: ViewMode): void {
    this.activeView.set(mode);
  }

  setFilter(filter: FilterStatus): void {
    this.activeFilter.set(filter);
  }

  startEdit(event: CalendarEventInput): void {
    this.editingEventId.set(event.id);
    this.editDraft.set({
      title: event.title,
      day: event.day,
      start: event.start,
      end: event.end,
      status: event.status
    });
  }

  cancelEdit(): void {
    this.editingEventId.set(null);
    this.editDraft.set(null);
  }

  saveEdit(): void {
    const draft = this.editDraft();
    const eventId = this.editingEventId();
    if (!draft || !eventId) {
      return;
    }

    const startMin = this.toMinutes(draft.start);
    const endMin = this.toMinutes(draft.end);
    if (endMin <= startMin) {
      return;
    }

    const next = this.rawEvents().map((e) =>
      e.id === eventId
        ? {
            ...e,
            title: draft.title.trim() || e.title,
            day: draft.day,
            start: draft.start,
            end: draft.end,
            status: draft.status
          }
        : e
    );

    this.rawEvents.set(next);
    this.cancelEdit();
  }

  onEditPatch(payload: { key: 'title' | 'day' | 'start' | 'end' | 'status'; value: string }): void {
    const draft = this.editDraft();
    if (!draft) {
      return;
    }
    this.editDraft.set({ ...draft, [payload.key]: payload.value });
  }

  trackByEventId(_: number, event: PositionedEvent): string {
    return event.id;
  }

  private layoutEvents(events: CalendarEventInput[], dayStart: number, dayEnd: number): PositionedEvent[] {
    const normalized = events
      .map((e) => ({
        ...e,
        startMin: Math.max(dayStart, this.toMinutes(e.start)),
        endMin: Math.min(dayEnd, this.toMinutes(e.end))
      }))
      .filter((e) => e.endMin > e.startMin)
      .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

    type Active = { endMin: number; col: number };
    const active: Active[] = [];
    const freeCols: number[] = [];
    let nextCol = 0;

    const out: PositionedEvent[] = [];
    let groupStart = 0;
    let groupMaxCols = 0;

    const closeGroup = (endExclusive: number, cols: number): void => {
      for (let i = groupStart; i < endExclusive; i++) {
        out[i].totalColumns = cols;
        out[i].leftPct = (out[i].column / cols) * 100;
        out[i].widthPct = 100 / cols;
      }
      groupStart = endExclusive;
      groupMaxCols = 0;
    };

    normalized.forEach((event) => {
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].endMin <= event.startMin) {
          freeCols.push(active[i].col);
          active.splice(i, 1);
        }
      }

      if (active.length === 0 && out.length > groupStart) {
        closeGroup(out.length, groupMaxCols || 1);
        freeCols.length = 0;
        nextCol = 0;
      }

      freeCols.sort((a, b) => a - b);
      const col = freeCols.length > 0 ? freeCols.shift() : nextCol++;

      active.push({ endMin: event.endMin, col: col! });
      groupMaxCols = Math.max(groupMaxCols, nextCol);

      const top = (event.startMin - dayStart) * this.pxPerMinute;
      const height = Math.max(24, (event.endMin - event.startMin) * this.pxPerMinute);

      out.push({
        ...event,
        column: col!,
        totalColumns: 1,
        top,
        height,
        leftPct: 0,
        widthPct: 100
      });
    });

    if (out.length > groupStart) {
      closeGroup(out.length, groupMaxCols || 1);
    }

    return out;
  }

  private toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  private toHHMM(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
