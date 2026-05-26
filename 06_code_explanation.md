# Code Explanation: Step-by-Step Decode with Approach

This explains how the implementation works in:
- `/src/app/app.ts`
- `/src/app/app.html`
- `/src/app/app.scss`

## Approach Summary
Use one reusable overlap engine and feed it different timeline policies (`DAY`, `WeekDAY`, `WorkingWeeks`, `WholeWeek`).

## Step 1: Capture state
`app.ts` stores:
- view mode
- status filter
- editable draft state
- raw event list

These are all signals so downstream computed values update automatically.

## Step 2: Resolve timeline policy
`dayRange` computed maps view mode to boundaries:
- `DAY`: 0 to 1440
- `WeekDAY`: 480 to 1260
- `WorkingWeeks`: 540 to 1080

`WholeWeek` still uses same daily range but renders 7 day columns.

## Step 3: Filter events
`filteredEvents` computed applies status filter before layout.

## Step 4: Normalize and clip
In `layoutEvents(events, dayStart, dayEnd)`:
- convert each `start/end` to minutes
- clamp to selected range
- remove invalid intervals (`end <= start`)

This prevents boundary overflow in rendering.

## Step 5: Sort intervals
Sort by `startMin`, then `endMin` for deterministic traversal.

## Step 6: Sweep-line overlap detection
Maintain:
- `active[]`: currently overlapping intervals
- `freeCols[]`: released columns
- `nextCol`: next new column number

For each event:
1. release ended events from `active`
2. reclaim their columns to `freeCols`
3. assign smallest free column, or new one
4. push current event into `active`

## Step 7: Group close and width finalization
When active set becomes empty, the overlap chain is complete:
- assign `totalColumns` for that group
- set `leftPct = column / totalColumns`
- set `widthPct = 1 / totalColumns`

This guarantees side-by-side non-overlapping card lanes.

## Step 8: Convert to geometry
For each event:
- `top = (startMin - dayStart) * pxPerMinute`
- `height = max(24, (endMin - startMin) * pxPerMinute)`

## Step 9: Day vs WholeWeek render
- Non-week mode: single time-axis + one grid
- `WholeWeek`: 7 columns (`Mon..Sun`), each day runs same `layoutEvents` independently

## Step 10: Edit and reflow
When user edits title/day/time/status:
- `saveEdit()` updates source event
- computed pipeline re-runs
- UI re-renders with updated overlap layout

## Why this implementation is clean
- One algorithm, many views
- Clear separation of policy and layout logic
- Deterministic and interview-explainable
- Easy to extend for recurrence/timezone handling

## 11. Multi-Component Implementation (How it is implemented)
Step-by-step:
1. Created shared model types in `models.calendar.ts`.
2. Extracted toolbar UI into `CalendarToolbarComponent`.
3. Extracted edit form into `EventEditPanelComponent`.
4. Extracted day renderer into `DayViewComponent`.
5. Extracted week renderer into `WeekViewComponent`.
6. Kept overlap algorithm and state in `App` container.
7. Connected child outputs to parent handlers.
8. Passed computed render data as inputs to children.

Result:
- lower coupling
- easier independent testing
- cleaner interview narrative of architecture evolution
