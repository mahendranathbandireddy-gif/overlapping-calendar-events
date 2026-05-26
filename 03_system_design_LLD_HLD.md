# System Design Concepts - HLD and LLD

## HLD

## Major Layers
1. Input Layer
- Event payload acquisition and validation

2. Policy Layer
- View mode range resolver
- Status filter resolver

3. Layout Engine Layer
- Sweep-line overlap detection
- Column allocation and group finalization

4. Presentation Layer
- Day timeline renderer
- Whole-week multi-column renderer

5. Interaction Layer
- Edit flow and state transitions

## Flow
Input -> Policy (view/filter) -> Layout Engine -> Positioned Events -> Renderer

## LLD

## Core Methods
- `setView(mode)`
- `setFilter(filter)`
- `layoutEvents(events, dayStart, dayEnd)`
- `saveEdit()` / `startEdit()` / `cancelEdit()`
- `toMinutes()` / `toHHMM()`

## Step-by-Step Algorithm (Decode)
1. Read selected `ViewMode` and resolve `dayStart/dayEnd`.
2. Apply status filter.
3. For each event:
- convert `start/end` to minutes
- clamp to `dayStart/dayEnd`
4. Drop invalid intervals (`end <= start`).
5. Sort by start then end.
6. Sweep list:
- release ended active events
- reuse free columns
- allocate new column if needed
7. Track overlap group max columns.
8. On group close (active empty), assign:
- `totalColumns`
- `leftPct`
- `widthPct`
9. Convert time delta to `top` and `height`.
10. Return positioned events to UI.

## Complexity
- Sort: `O(n log n)`
- Sweep: `O(n * k)` with list-based active set
- Space: `O(n)`

## Extensibility
- Swap active set to heap for dense schedules.
- Add timezone/daylight-safe parsing layer.
- Add recurrence expansion pre-processor.

## Updated LLD: Component Breakdown
- `App`: source of truth, view/filter state, layout engine, edit save rules
- `CalendarToolbarComponent`: mode + filter controls and legend
- `EventEditPanelComponent`: event form controls
- `DayViewComponent`: single timeline rendering
- `WeekViewComponent`: multi-day rendering

Contract:
- Inputs carry display data.
- Outputs emit intents (`viewChange`, `filterChange`, `edit`, `save`, `cancel`).
