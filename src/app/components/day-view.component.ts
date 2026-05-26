import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PositionedEvent } from '../models.calendar';

@Component({
  selector: 'app-day-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="day-view" aria-label="Calendar day view">
      <div class="time-axis" [style.height.px]="dayHeightPx">
        @for (hour of hours; track hour) {
          <div class="tick" [style.height.px]="$last ? 0 : hourSlotPx">{{ hour }}</div>
        }
      </div>

      <div class="grid" [style.height.px]="dayHeightPx">
        @for (event of events; track event.id) {
          <article
            class="event-card"
            [class.completed]="event.status === 'Completed'"
            [class.cancelled]="event.status === 'Cancelled'"
            [style.top.px]="event.top"
            [style.height.px]="event.height"
            [style.left.%]="event.leftPct"
            [style.width.%]="event.widthPct"
          >
            <h3>{{ event.title }}</h3>
            <p>{{ event.start }} - {{ event.end }}</p>
            <small>{{ event.day }} | col {{ event.column + 1 }}/{{ event.totalColumns }}</small>
            <div class="status-row">
              <span class="badge">{{ event.status }}</span>
              <button type="button" class="edit-btn" (click)="edit.emit(event)">Edit</button>
            </div>
          </article>
        }
      </div>
    </section>
  `
})
export class DayViewComponent {
  @Input() dayHeightPx = 0;
  @Input() hourSlotPx = 0;
  @Input() hours: string[] = [];
  @Input() events: PositionedEvent[] = [];

  @Output() edit = new EventEmitter<PositionedEvent>();
}
