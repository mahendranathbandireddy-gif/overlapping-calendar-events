import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PositionedEvent } from '../models.calendar';

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="week-view" [class.working-week]="workingWeek" aria-label="Calendar week view">
      @for (dayBlock of weekEvents; track dayBlock.day) {
        <article class="week-day">
          <header>{{ dayBlock.day }}</header>
          <div class="week-grid" [style.height.px]="dayHeightPx">
            @for (event of dayBlock.events; track event.id) {
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
                <div class="status-row">
                  <span class="badge">{{ event.status }}</span>
                  <button type="button" class="edit-btn" (click)="edit.emit(event)">Edit</button>
                </div>
              </article>
            }
          </div>
        </article>
      }
    </section>
  `
})
export class WeekViewComponent {
  @Input() dayHeightPx = 0;
  @Input() weekEvents: { day: string; events: PositionedEvent[] }[] = [];
  @Input() workingWeek = false;

  @Output() edit = new EventEmitter<PositionedEvent>();
}
