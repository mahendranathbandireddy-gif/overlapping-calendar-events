# What Interviewers Focus On in This Question

## 1. Problem Decomposition
- Do you separate normalization, overlap detection, and rendering math?
- Do you explain assumptions (inclusive/exclusive boundaries)?

## 2. Correctness of Overlap Logic
- Same start time events
- Chain overlaps (A overlaps B, B overlaps C)
- Boundary handoff (`end == next start`)
- Nested intervals

## 3. Data Structure Choice
- Why sort by start time?
- How active overlap set is tracked?
- How free columns are reused efficiently?

## 4. Complexity Awareness
- Can you derive `O(n log n)` due to sorting?
- Can you discuss optimizations for high-density schedules?

## 5. Width and Column Math
- Correct `left` and `width` percentages per overlap group
- Stable columns when events start/finish

## 6. Code Quality
- Readable function boundaries
- Deterministic behavior and testability
- Handling invalid or edge input cleanly

## 7. Communication
Interviewers reward candidates who say:
- "I treat overlap using sweep-line with active intervals."
- "I close a group when active events become zero, then assign common width."
- "UI is secondary; correctness of interval logic is primary."
