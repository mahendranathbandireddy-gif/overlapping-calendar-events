# UML Diagrams

## Use Case Diagram
```mermaid
flowchart LR
  U[User] --> V[View Day Schedule]
  U --> S[Scroll Timeline]
  U --> R[Read Event Details]

  A[System] --> N[Normalize Times]
  A --> O[Detect Overlaps]
  A --> C[Assign Columns]
  A --> W[Compute Widths]
  A --> P[Render Positioned Events]
```

## Class Diagram
```mermaid
classDiagram
  class CalendarEventInput {
    +string id
    +string title
    +string start
    +string end
  }

  class PositionedEvent {
    +number startMin
    +number endMin
    +number column
    +number totalColumns
    +number top
    +number height
    +number leftPct
    +number widthPct
  }

  class DayViewLayoutEngine {
    +layoutEvents(events)
    -toMinutes(hhmm)
    -closeGroup(endExclusive, cols)
  }

  DayViewLayoutEngine --> CalendarEventInput
  DayViewLayoutEngine --> PositionedEvent
```

## Sequence Diagram
```mermaid
sequenceDiagram
  participant UI as DayView UI
  participant Engine as Layout Engine
  participant Render as Renderer

  UI->>Engine: layoutEvents(rawEvents)
  Engine->>Engine: normalize + sort
  Engine->>Engine: sweep-line overlap detection
  Engine->>Engine: assign columns + totalColumns
  Engine-->>Render: positionedEvents
  Render-->>UI: draw side-by-side cards
```

## State Diagram
```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Normalizing: events loaded
  Normalizing --> Sorting
  Sorting --> OverlapDetection
  OverlapDetection --> ColumnAssignment
  ColumnAssignment --> WidthFinalization
  WidthFinalization --> RenderReady
  RenderReady --> Idle: next update
```

## Additional View Mode Sequence
```mermaid
sequenceDiagram
  participant User
  participant UI as View Mode Controls
  participant Range as Day Range Resolver
  participant Engine as Overlap Layout Engine

  User->>UI: Select DAY / WeekDAY / WorkingWeeks
  UI->>Range: resolve(start, end)
  Range->>Engine: layout(events, start, end)
  Engine-->>UI: positionedEvents
```

## Full Implementation Activity Flow
```mermaid
flowchart TD
  A[Select View Mode] --> B[Resolve dayStart/dayEnd]
  B --> C[Apply Status Filter]
  C --> D[Normalize HH:mm to Minutes]
  D --> E[Clamp to Visible Range]
  E --> F[Discard Invalid Intervals]
  F --> G[Sort by Start then End]
  G --> H[Sweep Active Overlaps]
  H --> I[Assign/Re-use Columns]
  I --> J[Finalize Group Widths]
  J --> K[Compute top/height/left/width]
  K --> L{WholeWeek?}
  L -- No --> M[Render Single Timeline]
  L -- Yes --> N[Run per Day and Render 7 Columns]
```

## Component Interaction Diagram
```mermaid
flowchart LR
  A[App Container] --> B[CalendarToolbarComponent]
  A --> C[EventEditPanelComponent]
  A --> D[DayViewComponent]
  A --> E[WeekViewComponent]

  B -->|viewChange/filterChange| A
  C -->|patch/save/cancel| A
  D -->|edit event| A
  E -->|edit event| A
```
