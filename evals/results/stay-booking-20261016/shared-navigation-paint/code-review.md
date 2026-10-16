# Shared helper review

Read-only independent reviews inspected the code and API contract. The reviewer ran no browser jobs, tests or inference. Root reproduced the findings with real browser fixtures before changing the helper.

| Finding | Observed baseline | Resolution | Evidence |
| --- | --- | --- | --- |
| An expected-color sibling image supplies a transparent icon's pixels | False PASS | Same-coordinate owner-hidden background probe; nonwhite foreign paint stays unknown; exact style restoration | tests/review-red-v2.log, tests/full-unit.log |
| Yellow text strokes retain enough black cores | False PASS at48px/900 with1pxstroke; the smaller preliminary fixture was already unknown | Guard ordinary and pseudo text strokes | tests/review-red.log, tests/review-red-v2.log, tests/full-unit.log |
| Correct light foreground below the ink threshold | False suppressed FAIL | Low-evidence colors stay unknown | tests/review-red-v2.log, tests/full-unit.log |
| Oversized SVG hides wrong-colored paint beyond the screenshot viewport | False PASS | Require the entire owner inside the viewport after scrolling | tests/viewport-animation-red.log, tests/full-unit.log |
| Active WAAPI stroke animation escapes CSS animation declarations | False PASS | Inspect pending/active animations on owner, ancestors and descendants | tests/viewport-animation-red.log, tests/full-unit.log |

The final read-only review confirmed both the viewport and WAAPI fixes and found no remaining issue in those two fixes. That scoped inspection is not a claim that every possible measurement defect has been eliminated.

The actual selected label has its own translucent pink surface. All36such observations stay unknown under this white-background primitive. No product CSS or expected color was changed to clear those counts. Prior case-specific per-channel/core checks remain separate evidence with their original limitations.

All195unit and17relevant integration/browser tests pass against the final implementation. The published portable matrix independently reproduces the final scoped counts. These tests do not approve fonts, geometry, complete shapes, all catalog rules, product completeness or reference quality.
