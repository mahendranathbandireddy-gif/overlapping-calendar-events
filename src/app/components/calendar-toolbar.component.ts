import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterStatus, ViewMode } from '../models.calendar';

@Component({
  selector: 'app-calendar-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="legend">
      <span>Visible Events: {{ visibleCount }}</span>
      <span>{{ activeView }} Window: {{ dayLabel }}</span>
      <span>Core Focus: overlap + columns + width math</span>
    </section>

    <section class="view-modes" aria-label="Timeline mode">
      @for (mode of viewModes; track mode) {
        <button type="button" [class.active]="activeView === mode" (click)="viewChange.emit(mode)">{{ mode }}</button>
      }
    </section>

    <section class="filters" aria-label="Event filters">
      <button type="button" [class.active]="activeFilter === 'All'" (click)="filterChange.emit('All')">
        All ({{ counts.all }})
      </button>
      <button type="button" [class.active]="activeFilter === 'Scheduled'" (click)="filterChange.emit('Scheduled')">
        Scheduled ({{ counts.scheduled }})
      </button>
      <button type="button" [class.active]="activeFilter === 'Completed'" (click)="filterChange.emit('Completed')">
        Completed ({{ counts.completed }})
      </button>
      <button type="button" [class.active]="activeFilter === 'Cancelled'" (click)="filterChange.emit('Cancelled')">
        Cancelled ({{ counts.cancelled }})
      </button>
    </section>
  `
})
export class CalendarToolbarComponent {
  @Input({ required: true }) visibleCount = 0;
  @Input({ required: true }) activeView!: ViewMode;
  @Input({ required: true }) dayLabel = '';
  @Input({ required: true }) activeFilter!: FilterStatus;
  @Input({ required: true }) viewModes: ViewMode[] = [];
  @Input({ required: true }) counts!: { all: number; scheduled: number; completed: number; cancelled: number };

  @Output() viewChange = new EventEmitter<ViewMode>();
  @Output() filterChange = new EventEmitter<FilterStatus>();
}
