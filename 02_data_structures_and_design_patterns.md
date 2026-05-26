# Compatible Data Structures and Complete Design Patterns

## Data Structures

## Core Types
```ts
type ViewMode = 'DAY' | 'WeekDAY' | 'WorkingWeeks' | 'WholeWeek';
type EventStatus = 'Scheduled' | 'Completed' | 'Cancelled';
type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
```

```ts
interface CalendarEventInput {
  id: string;
  title: string;
  day: WeekDay;
  start: string;
  end: string;
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
```

## Runtime Structures
- `Array<CalendarEventInput>`: source events
- `Array<PositionedEvent>`: layout output
- `active[]`: active overlap set during sweep
- `freeCols[]`: recycled column indices
- scalar `nextCol`: next available column

## Why These Work
- Arrays keep iteration straightforward and interview-friendly.
- Active/free lists represent real overlap lifecycle.
- Column reuse minimizes width fragmentation.

## Complete Design Pattern Mapping

## 1. Strategy Pattern
Different timeline modes are strategies for choosing range policy:
- `DAY`: 00:00-24:00
- `WeekDAY`: 08:00-21:00
- `WorkingWeeks`: 09:00-18:00
- `WholeWeek`: per-day columns, same range policy

## 2. Template Method Pattern
Fixed processing pipeline:
1. normalize
2. filter invalid
3. sort
4. assign columns
5. finalize widths

Only input policy (range/filter/day split) varies.

## 3. Observer / Reactive Pattern
Signals and computed values act as observers:
- changing filter/view/edit updates positioned output automatically.

## 4. Single Responsibility Principle (SOLID influence)
- Range resolution
- Event filtering
- Layout computation
- Presentation rendering
are separated concerns.

## 5. Facade Pattern (conceptual)
`layoutEvents(...)` behaves like a facade hiding overlap complexity and returning render-ready output.

## 6. State Pattern (lightweight)
UI behavior depends on state:
- active view mode
- active filter
- edit draft state

## 7. Factory Pattern (test-data friendly)
Mock events can be generated with scenario factories for dense overlaps, ties, chains, boundary clipping.

## Component-Level Pattern Application
- Container-Presenter split:
  - Container: `App` (state, computations, algorithm)
  - Presenters: toolbar/edit/day/week components
- Unidirectional data flow:
  - parent -> `@Input`
  - child -> `@Output`

This improves testability and reuse for machine-coding evolution rounds.
