export type EventStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type FilterStatus = 'All' | EventStatus;
export type ViewMode = 'DAY' | 'WeekDAY' | 'WorkingWeeks' | 'WholeWeek';
export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface CalendarEventInput {
  id: string;
  title: string;
  day: WeekDay;
  start: string;
  end: string;
  status: EventStatus;
}

export interface PositionedEvent extends CalendarEventInput {
  startMin: number;
  endMin: number;
  column: number;
  totalColumns: number;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
}
