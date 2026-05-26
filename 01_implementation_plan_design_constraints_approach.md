# Implementation, Plan, Design Constraints, Design Approach

## Problem Statement
Implement Google Calendar-like scheduling logic where overlapping events are rendered side-by-side without visual collision, now supporting:
- `DAY`
- `WeekDAY`
- `WorkingWeeks`
- `WholeWeek`

## Implementation Scope
- Time normalization (`HH:mm` -> minutes)
- Per-range clipping (`dayStart/dayEnd`)
- Overlap grouping
- Dynamic column assignment
- Width and left calculations
- Filters by status
- Edit event fields (title, day, time, status)
- Day and whole-week rendering modes

## Step-by-Step Plan
1. Define core models (`CalendarEventInput`, `PositionedEvent`, enums).
2. Implement range resolver from active view mode.
3. Filter events by status.
4. Normalize events with clipped start/end boundaries.
5. Sort by `startMin`, tie-break by `endMin`.
6. Run sweep-line overlap algorithm.
7. Reuse free columns and finalize group widths.
8. Map time to pixels (`top`, `height`) and percentages (`leftPct`, `widthPct`).
9. Render day or week layout based on selected mode.
10. Integrate edit/update actions and reactivity.

## Constraints
- Deterministic behavior for ties and boundary handoff.
- No event should render outside selected timeline range.
- Logic should be reusable across day and week views.
- Algorithm must remain understandable for interview discussion.

## Approach Used
- Separate **policy** (view range, filters) from **algorithm** (overlap layout).
- Reuse same layout engine for:
  - single timeline (`DAY`, `WeekDAY`, `WorkingWeeks`)
  - each day column in `WholeWeek`
- Keep logic signal-driven so UI updates are automatic and predictable.

## Multi-Component Refactor
Implementation is now split into reusable standalone components:
- `CalendarToolbarComponent`
- `EventEditPanelComponent`
- `DayViewComponent`
- `WeekViewComponent`

`App` is now the orchestration layer (state + algorithm), while child components focus on rendering and user interactions.
