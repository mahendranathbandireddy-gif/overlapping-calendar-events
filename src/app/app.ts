import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

type EventStatus = 'Scheduled' | 'Completed' | 'Cancelled';
type FilterStatus = 'All' | EventStatus;

interface CalendarEventInput {
  id: string;
  title: string;
  start: string; // HH:mm
  end: string;   // HH:mm
  status: EventStatus;
}

interface PositionedEvent extends CalendarEventInput {
  startMin: number;
  endMin: number;
  column: number;
  totalColumns: number;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly dayStart = 8 * 60;
  readonly dayEnd = 21 * 60;
  readonly pxPerMinute = 1.1;
  readonly dayHeightPx = (this.dayEnd - this.dayStart) * this.pxPerMinute;
  readonly hourSlotPx = 60 * this.pxPerMinute;

  readonly filterOptions: FilterStatus[] = ['All', 'Scheduled', 'Completed', 'Cancelled'];
  readonly activeFilter = signal<FilterStatus>('All');
  readonly editingEventId = signal<string | null>(null);
  readonly editDraft = signal<{ title: string; start: string; end: string; status: EventStatus } | null>(null);

  readonly rawEvents = signal<CalendarEventInput[]>([
    { id: 'e1', title: 'Daily Standup', start: '09:00', end: '09:45', status: 'Completed' },
    { id: 'e2', title: 'Design Review', start: '09:15', end: '10:30', status: 'Scheduled' },
    { id: 'e3', title: '1:1 Sync', start: '10:00', end: '11:00', status: 'Scheduled' },
    { id: 'e4', title: 'API Planning', start: '11:10', end: '12:00', status: 'Cancelled' },
    { id: 'e5', title: 'Lunch', start: '12:15', end: '13:00', status: 'Completed' },
    { id: 'e6', title: 'Roadmap', start: '12:20', end: '14:00', status: 'Scheduled' },
    { id: 'e7', title: 'Interview Debrief', start: '12:35', end: '13:15', status: 'Scheduled' },
    { id: 'e8', title: 'Focus Block', start: '15:00', end: '17:00', status: 'Scheduled' },
    { id: 'e9', title: 'Quick Sync', start: '15:45', end: '16:10', status: 'Completed' },
    { id: 'e10', title: 'Wrap-up', start: '17:10', end: '18:00', status: 'Scheduled' }
  ]);

  readonly filteredEvents = computed(() => {
    const f = this.activeFilter();
    if (f === 'All') {
      return this.rawEvents();
    }
    return this.rawEvents().filter((e) => e.status === f);
  });

  readonly positionedEvents = computed(() => this.layoutEvents(this.filteredEvents()));

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
    for (let m = this.dayStart; m <= this.dayEnd; m += 60) {
      arr.push(this.toHHMM(m));
    }
    return arr;
  });

  setFilter(filter: FilterStatus): void {
    this.activeFilter.set(filter);
  }

  startEdit(event: CalendarEventInput): void {
    this.editingEventId.set(event.id);
    this.editDraft.set({
      title: event.title,
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
        ? { ...e, title: draft.title.trim() || e.title, start: draft.start, end: draft.end, status: draft.status }
        : e
    );

    this.rawEvents.set(next);
    this.cancelEdit();
  }

  updateDraft<K extends keyof NonNullable<ReturnType<typeof this.editDraft>>>(key: K, value: NonNullable<ReturnType<typeof this.editDraft>>[K]): void {
    const draft = this.editDraft();
    if (!draft) {
      return;
    }
    this.editDraft.set({ ...draft, [key]: value });
  }

  trackByEventId(_: number, event: PositionedEvent): string {
    return event.id;
  }

  private layoutEvents(events: CalendarEventInput[]): PositionedEvent[] {
    const normalized = events
      .map((e) => ({
        ...e,
        startMin: Math.max(this.dayStart, this.toMinutes(e.start)),
        endMin: Math.min(this.dayEnd, this.toMinutes(e.end))
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
      const col = freeCols.length > 0 ? freeCols.shift()! : nextCol++;

      active.push({ endMin: event.endMin, col });
      groupMaxCols = Math.max(groupMaxCols, nextCol);

      const top = Math.max(0, event.startMin - this.dayStart) * this.pxPerMinute;
      const height = Math.max(24, (event.endMin - event.startMin) * this.pxPerMinute);

      out.push({
        ...event,
        column: col,
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
