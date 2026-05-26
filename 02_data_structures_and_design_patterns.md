# Compatible Data Structure and Suitable Design Patterns

## Data Structures

## Event Types
```ts
interface CalendarEventInput {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface PositionedEvent {
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
- `Array<PositionedEvent>`: sorted timeline traversal.
- `active[]`: currently overlapping events.
- `freeCols[]`: reusable column indexes.
- scalar `nextCol`: next new column index.

## Why these fit
- Array sorting gives deterministic order.
- Active list mirrors sweep-line state.
- Free column pool minimizes column count.
- Simple primitives keep debugging and whiteboard explanation easy.

## Design Patterns

## 1. Strategy Pattern
Support alternate layout policies:
- strict no-overlap columns
- compact packed layout
- priority-weighted layout

## 2. Template Method (optional)
Shared pipeline:
- normalize -> sort -> assign columns -> finalize widths
Different rules can override assignment/finalization steps.

## 3. Observer/Reactive Pattern
UI listens to computed positioned events and rerenders automatically.

## 4. Factory (optional)
Factory for generating test scenarios (dense overlap, chain overlap, same-start cases).
