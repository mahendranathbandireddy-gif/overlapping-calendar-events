# System Design Concepts - LLD / HLD

## HLD (High-Level Design)

## Components
1. Input Adapter
- Reads API/local event payload
- Validates and normalizes timestamps

2. Layout Engine
- Overlap detection
- Column assignment
- Group-level width calculation

3. Presentation Mapper
- Converts minutes to pixel geometry
- Adds style-ready properties

4. Rendering Layer
- Day grid, time axis, event cards

## Data Flow
Input events -> normalization -> sort -> layout engine -> positioned events -> render

## LLD (Low-Level Design)

## Core Functions
- `toMinutes(hhmm)`
- `layoutEvents(events)`
- `closeGroup(endExclusive, cols)`
- `toHHMM(min)` (for axis labels)

## Core Algorithm (Sweep-Line)
1. Sort events by start, then end.
2. Remove finished events from active set.
3. Reuse smallest free column or allocate new.
4. Add current event to active set.
5. Update group max columns.
6. If active set empties, finalize group widths.

## Complexity
- Sorting: `O(n log n)`
- Sweep pass: `O(n * k)` worst-case with simple active list (`k` overlap density)
- Space: `O(n)` for output + active tracking

## Scalability Notes
- For very large `n`, use min-heap for active end-times to optimize release operations.
- Keep engine stateless for easy server-side execution and unit tests.
