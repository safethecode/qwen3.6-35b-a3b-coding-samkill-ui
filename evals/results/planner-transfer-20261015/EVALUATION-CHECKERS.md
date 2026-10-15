# Checker history

Historical receipts keep their original checker and source hashes. Scores from different check sets are not comparable.

- `check-planner-v1.mjs`: original 60-case workflow.
- `check-planner-v2.mjs`: 61-case intermediate workflow.
- `check-planner-v3.mjs`: 73-case workflow before explicit populated-state layout invocation.
- `check-planner.mjs`: current 73-case workflow; evaluates populated layout as `filled` so state-scoped rules are exercised.
- `state-repair/check-store-v1.mjs`: original 12-case state contract.
- `state-repair/check-store-v2.mjs`: 13-case contract before initial-read mutation cases.
- `check-store.mjs`: current 15 cases, including create after malformed/denied initial read. Unreadable data must remain untouched.
- `check-renderer-v1.mjs`: empty, populated and clear renderer states.
- `check-renderer.mjs`: also rejects a confirmed-empty claim when the initial read failed.
- `check-read-recovery.mjs`: real browser replay of denied initial read, failed create with preserved disk/input, restored read and explicit reload recovery.
- `check-firstline.mjs`: short/long row first-line control placement, official delete asset, target size and category capsule at four widths and normal/enlarged/spacing modes. Empty or unvisited states cannot satisfy a required populated-row relation.
- `check-action-labels-v1.mjs`: initial visible-label check, before the contracted natural-wrapping assertion.
- `check-action-labels.mjs`: visible Korean add/delete text, matching accessible names, typography, targets and natural wrapping in normal/enlarged/spacing modes. Accessible names alone cannot pass ORC-A07. Clipping, alignment, behavior and actual design quality require their separate checks.
- `check-task-handoff.mjs`: canonical owned task markup, including the dynamic row template, must agree across actual assembly, standalone sample and component plan. A correct assembly cannot approve stale downstream sample/plan consumers.

Browser commands require Playwright and a local Chromium/Chrome executable through `CHROME_PATH` when the default browser is unavailable. Checkers exit nonzero on failed assertions. Scoped success does not certify reference parity, independent generation, native popup behavior, real-device zoom or assistive technology.
