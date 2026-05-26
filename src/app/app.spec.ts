import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, app };
  }

  it('should create the app', () => {
    const { app } = setup();
    expect(app).toBeTruthy();
  });

  it('should render the updated title', () => {
    const { fixture } = setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Google Calendar Day / Week View Logic');
  });

  it('should default to WholeWeek view', () => {
    const { app } = setup();
    expect(app.activeView()).toBe('WholeWeek');
  });

  it('should compute full day range for DAY mode', () => {
    const { app } = setup();
    app.setView('DAY');

    expect(app.dayStart()).toBe(0);
    expect(app.dayEnd()).toBe(24 * 60);
    expect(app.dayRange().label).toBe('00:00 - 24:00');
    expect(app.hours().length).toBe(25);
  });

  it('should compute working week time range for WorkingWeeks mode', () => {
    const { app } = setup();
    app.setView('WorkingWeeks');

    expect(app.dayStart()).toBe(9 * 60);
    expect(app.dayEnd()).toBe(18 * 60);
    expect(app.dayRange().label).toBe('09:00 - 18:00');
  });

  it('should return only Mon-Fri columns for WorkingWeeks', () => {
    const { app } = setup();
    app.setView('WorkingWeeks');

    const days = app.weekPositionedEvents().map((d) => d.day);
    expect(days).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  });

  it('should return Mon-Sun columns for WholeWeek', () => {
    const { app } = setup();
    app.setView('WholeWeek');

    const days = app.weekPositionedEvents().map((d) => d.day);
    expect(days).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('should filter events by Completed status', () => {
    const { app } = setup();
    app.setFilter('Completed');

    const events = app.filteredEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.status === 'Completed')).toBe(true);
  });

  it('should compute overlap columns for overlapping Monday events', () => {
    const { app } = setup();
    app.setView('WholeWeek');

    const monday = app.weekPositionedEvents().find((d) => d.day === 'Mon');
    expect(monday).toBeTruthy();

    const e1 = monday!.events.find((e) => e.id === 'e1');
    const e2 = monday!.events.find((e) => e.id === 'e2');

    expect(e1).toBeTruthy();
    expect(e2).toBeTruthy();
    expect(e1!.totalColumns).toBe(2);
    expect(e2!.totalColumns).toBe(2);
    expect(e1!.column).not.toBe(e2!.column);
  });

  it('should clip events outside visible range', () => {
    const { app } = setup();

    app.rawEvents.update((events) => [
      ...events,
      { id: 'late', title: 'Late Work', day: 'Mon', start: '17:30', end: '23:30', status: 'Scheduled' }
    ]);

    app.setView('WorkingWeeks');

    const monday = app.weekPositionedEvents().find((d) => d.day === 'Mon');
    const late = monday?.events.find((e) => e.id === 'late');

    expect(late).toBeTruthy();
    expect(late!.endMin).toBe(18 * 60);
    expect(late!.startMin).toBeLessThan(late!.endMin);
  });

  it('should edit and save event changes', () => {
    const { app } = setup();
    const target = app.rawEvents().find((e) => e.id === 'e3');
    expect(target).toBeTruthy();

    app.startEdit(target!);
    app.onEditPatch({ key: 'title', value: 'Updated Sync' });
    app.onEditPatch({ key: 'day', value: 'Thu' });
    app.onEditPatch({ key: 'start', value: '10:30' });
    app.onEditPatch({ key: 'end', value: '11:30' });
    app.onEditPatch({ key: 'status', value: 'Completed' });
    app.saveEdit();

    const updated = app.rawEvents().find((e) => e.id === 'e3');
    expect(updated).toBeTruthy();
    expect(updated!.title).toBe('Updated Sync');
    expect(updated!.day).toBe('Thu');
    expect(updated!.start).toBe('10:30');
    expect(updated!.end).toBe('11:30');
    expect(updated!.status).toBe('Completed');
    expect(app.editDraft()).toBeNull();
    expect(app.editingEventId()).toBeNull();
  });

  it('should not save invalid edit when end is not after start', () => {
    const { app } = setup();
    const before = app.rawEvents().find((e) => e.id === 'e2');
    expect(before).toBeTruthy();

    app.startEdit(before!);
    app.onEditPatch({ key: 'start', value: '12:00' });
    app.onEditPatch({ key: 'end', value: '11:00' });
    app.saveEdit();

    const after = app.rawEvents().find((e) => e.id === 'e2');
    expect(after!.start).toBe(before!.start);
    expect(after!.end).toBe(before!.end);
    expect(app.editDraft()).not.toBeNull();
  });

  it('should expose stable trackBy id', () => {
    const { app } = setup();
    const event = app.positionedEvents()[0];
    expect(app.trackByEventId(0, event)).toBe(event.id);
  });
});
