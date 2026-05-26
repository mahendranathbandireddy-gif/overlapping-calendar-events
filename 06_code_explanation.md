# Code Explanation: Google Calendar Day View Logic

This document explains the implementation in:
- `/src/app/app.ts`
- `/src/app/app.html`
- `/src/app/app.scss`

## 1. Objective of the code
The code renders a day-view calendar where overlapping events are placed in separate columns so they appear side-by-side rather than visually overlapping.

## 2. `app.ts` walkthrough

## 2.1 Data models
`CalendarEventInput` stores raw event data:
- `id`, `title`
- `start`, `end` in `HH:mm`

`PositionedEvent` extends each event with layout metadata:
- `startMin`, `endMin` (minutes)
- `column`, `totalColumns`
- `top`, `height`, `leftPct`, `widthPct`

These values are enough for absolute-position rendering in the UI.

## 2.2 Component configuration
Important fields:
- `dayStart = 8 * 60`, `dayEnd = 21 * 60`
- `pxPerMinute = 1.1`
- `rawEvents` signal with mock data
- `positionedEvents` computed signal using `layoutEvents(...)`

`positionedEvents()` is the core derived output used by the template.

## 2.3 Time-axis generation
`hours` computed signal generates labels from 08:00 to 21:00 in 60-minute steps using `toHHMM(...)`.

## 2.4 Core algorithm: `layoutEvents(events)`
This method does all overlap + column logic.

### Step A: Normalize + sort
Each event is converted to:
- `startMin = toMinutes(start)`
- `endMin = toMinutes(end)`

Then events are sorted by:
1. `startMin`
2. `endMin` (tie-break)

This gives deterministic processing order.

### Step B: Sweep with active overlaps
Runtime structures:
- `active`: events currently overlapping current start time
- `freeCols`: released columns that can be reused
- `nextCol`: next unused column index

For each incoming event:
1. Remove ended events from `active` (`endMin <= current.startMin`)
2. Return their columns to `freeCols`
3. Reuse smallest free column, else allocate `nextCol++`
4. Insert current event into `active`

This avoids unnecessary growth in column count.

### Step C: Overlap group finalization
A group ends when `active.length === 0`.

When group closes (`closeGroup(...)`):
- assign `totalColumns` to every event in the group
- compute `leftPct = (column / totalColumns) * 100`
- compute `widthPct = 100 / totalColumns`

This ensures all events in the same overlap cluster share consistent width rules.

### Step D: Vertical placement
For each event:
- `top = (startMin - dayStart) * pxPerMinute`
- `height = (endMin - startMin) * pxPerMinute`
- `height` clamped to min `24`px for readability

## 2.5 Utility methods
- `toMinutes(hhmm)` converts `HH:mm` to absolute minutes.
- `toHHMM(total)` formats minutes back to `HH:mm` for axis labels.

## 3. `app.html` walkthrough

Template structure:
1. Header with round context.
2. Legend for quick metadata.
3. Day view split into:
- `time-axis` (hour ticks)
- `grid` (event card canvas)

Event cards are rendered with absolute styles:
- `[style.top.px]="event.top"`
- `[style.height.px]="event.height"`
- `[style.left.%]="event.leftPct"`
- `[style.width.%]="event.widthPct"`

Result: overlap is visually resolved into side-by-side columns.

## 4. `app.scss` walkthrough

Styling decisions:
- Two-column layout: time axis + event grid.
- Grid uses `position: relative`; event cards use `position: absolute`.
- Subtle background stripes simulate hourly bands.
- Event cards have compact readable typography.
- Responsive breakpoint reduces time-axis width on smaller screens.

## 5. Why this solution works
- Correctness: overlap detection is explicit and deterministic.
- Efficiency: sort once + single forward sweep.
- Maintainability: logic isolated in one method with clear helper utilities.
- Interview-fit: demonstrates algorithmic clarity before UI complexity.

## 6. Edge cases handled
- Same start times
- Chain overlaps (`A-B`, `B-C`)
- Boundary transitions (`end == next start`)
- Dense overlap windows with column reuse

## 7. One-line summary
`Normalize -> sort -> sweep active overlaps -> assign/reuse columns -> finalize group widths -> render absolute positions.`
