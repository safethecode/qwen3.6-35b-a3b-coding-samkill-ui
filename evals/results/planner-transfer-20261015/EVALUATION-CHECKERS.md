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

- `check-edit-mode-v4.mjs`: frozen14check explicit-mode contract before requiring management to belong to the list.
- `check-edit-mode-v5.mjs`: frozen15check ownership/tab-order contract with earlier generic visible labels.
- `check-edit-mode.mjs`: current15check ownership plus explicit 목록 편집/편집 마치기 labels;actual reading/editing state×width×text captures remain required. The earlier source fails ownership;the pre-copy source fails the declared copy checks.
- `check-heading-roles.v1.mjs`: frozen first exact-role diagnostic before explicit spacing metric context.
- `check-heading-roles.mjs`: current actual24cell heading/control role audit using predeclared intent when available. A reviewer-derived post-generation role file remains a diagnostic,not original-input evidence. Real200%text/spacing modes are activated and recorded;unknown fonts/metrics cannot pass.
- `list-ownership/materialize-snapshot.mjs`: restores exact bound historical source from shared current files and changed-file snapshots. Rejects existing destinations,linked trees,path recursion and hash mismatch;four actual22file snapshots and3filesystem fixtures verified. Not a UI-quality gate.
