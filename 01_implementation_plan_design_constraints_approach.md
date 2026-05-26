# Implementation, Plan, Design Constraints, Design Approach

## Problem
Build core logic for Google Calendar day view where overlapping events appear side-by-side instead of stacking over each other.

## Implementation Summary
- Convert event times (`HH:mm`) to minutes from midnight.
- Sort events by `startMin`, tie-break by `endMin`.
- Sweep through events to detect overlap groups.
- Assign smallest available column index to each event.
- Track maximum columns per overlap group.
- Apply `left` and `width` using `column` and `totalColumns`.

## Plan
1. Define event input and positioned event models.
2. Build `toMinutes` utility.
3. Sort normalized events.
4. Implement sweep-line overlap processing.
5. Reuse freed columns when events end.
6. Finalize each overlap group with shared `totalColumns`.
7. Compute geometry (`top`, `height`, `leftPct`, `widthPct`).
8. Validate tricky overlap cases.

## Design Constraints
- Large event lists should be handled efficiently.
- Same-start and near-boundary times must remain deterministic.
- Layout must avoid visual collision.
- Width math must be consistent within an overlap group.
- Minimum height should keep short events clickable/readable.

## Design Approach
- Use sweep-line with active-event tracking.
- Maintain a reusable pool of free columns.
- Group events by connectivity in overlap timeline.
- Freeze `totalColumns` when a group closes (active set becomes empty).
- Keep this logic UI-framework agnostic so it can power web/mobile clients.
