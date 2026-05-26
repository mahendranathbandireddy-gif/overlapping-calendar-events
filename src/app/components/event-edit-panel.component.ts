import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventStatus, WeekDay } from '../models.calendar';

@Component({
  selector: 'app-event-edit-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (draft) {
      <section class="edit-panel" aria-label="Edit event">
        <h2>Edit Event</h2>
        <label>
          Title
          <input [value]="draft.title" (input)="patch.emit({ key: 'title', value: $any($event.target).value })" />
        </label>
        <label>
          Day
          <select [value]="draft.day" (change)="patch.emit({ key: 'day', value: $any($event.target).value })">
            @for (d of weekDays; track d) {
              <option [value]="d">{{ d }}</option>
            }
          </select>
        </label>
        <label>
          Start
          <input type="time" [value]="draft.start" (input)="patch.emit({ key: 'start', value: $any($event.target).value })" />
        </label>
        <label>
          End
          <input type="time" [value]="draft.end" (input)="patch.emit({ key: 'end', value: $any($event.target).value })" />
        </label>
        <label>
          Status
          <select [value]="draft.status" (change)="patch.emit({ key: 'status', value: $any($event.target).value })">
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>
        <div class="edit-actions">
          <button type="button" class="save" (click)="save.emit()">Save</button>
          <button type="button" class="cancel" (click)="cancel.emit()">Cancel</button>
        </div>
      </section>
    }
  `
})
export class EventEditPanelComponent {
  @Input() draft: { title: string; day: WeekDay; start: string; end: string; status: EventStatus } | null = null;
  @Input() weekDays: WeekDay[] = [];

  @Output() patch = new EventEmitter<{ key: 'title' | 'day' | 'start' | 'end' | 'status'; value: string }>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
