# What Interviewers Focus On in This Question

## 1. Core Interval Correctness
- Can you detect overlaps reliably?
- Can you handle `end == next start` correctly?
- Can you reason about chain and nested overlaps?

## 2. Decomposition Quality
- Do you split policy (mode/filter) from overlap algorithm?
- Is the solution reusable for day and week views?

## 3. Data Structure and Pattern Rationale
- Why sorted arrays + active set + free column pool?
- Can you explain design-pattern choices beyond naming them?

## 4. Algorithm Clarity
Interviewers expect a crisp story:
1. normalize
2. sort
3. sweep
4. assign columns
5. finalize widths
6. render

## 5. Edge Cases
- events partially outside range
- zero/negative durations
- same start times
- heavy overlap density

## 6. Practical Product Thinking
- multiple timeline modes
- editing and filtering integration
- readable cards under crowded layouts

## 7. Communication Signal
Strong candidates explain tradeoffs and invariants clearly:
- "Active set holds only currently overlapping intervals."
- "Group widths are finalized only when overlap chain closes."
- "View mode changes range policy, not core overlap algorithm."

## 9. Componentization Quality
Interviewers value when candidates move from a monolith to modular UI:
- clear component boundaries
- input/output contracts
- business logic retained in one container
- render components kept dumb and reusable
