# Complex stay recovery and journey contract

This is a connected local product in progress, not observed Airbnb runtime. Native references show static screens only. Required scope is mobile accommodation search through room/rate choice, review, local request, modification and cancellation. No supplier confirmation, charge, refund or network idempotency is implemented or implied.

| State | Meaning | Data and actions | Current verification |
| --- | --- | --- | --- |
| S1 | Search results | Committed query, sort, confirmed favorites; search/filter drafts are memory-only until valid submit | 15-case B1 browser report covers implemented transitions |
| S2 | Search/filter draft | Preserve invalid field values and show owned alert; cancel/Escape discards draft, returns focus | Executed in B1 |
| S3 | Favorites unreadable | Read readiness false, no empty claim, no mutations/seeding, preserve original raw bytes | Four read-fault cases executed in B1 |
| S4 | Favorite write failed | Existing committed favorites survive; ordinary next write can retry without reload | Executed in B1 |
| S5 | Detail | Real return to query/sort/results, direct entry fallback | Actual browse/saved return and browserback executed;direct-entry fallback works |
| S6 | Request storage unreadable | Unknown rather than empty, preserve raw, explicit reload | Initial consumer exercised; full request schema unfinished |
| S7 | Selected room/rate and review | Valid current dates/guests, explicit eligible rate and complete price/policy | Implemented and exercised in12 connected groups;reference/commercial approval remains separate |
| S8 | Request recorded / management | One primary local request outcome, subordinate property/trip, modify/cancel policy | Planned, unverified |

| Transition | Trigger and guard | Success / failure | Preservation and back/re-entry |
| --- | --- | --- | --- |
| T1 S1→S2→S1 | Open and submit; dates/budget/guests valid | Recompute eligible offers / remain draft with error | Invalid input stays; cancel/Escape returns focus; only committed query is encoded in URL |
| T2 S1→S3 | Provider read/JSON/schema fails | Unknown storage state | Raw storage unchanged; no default [] mutation |
| T3 S3→S1 | Restore provider then explicit reload | Validate existing records before enabling writes / S3 | Attempted mutation while unreadable is inert; existing restored favorite retained |
| T4 S1→S4→S1 | Favorite toggle; persistence before memory | Commit only after successful write / old state+error | Normal retry succeeds; no destructive reset or mandatory reload |
| T5 S1↔S5 | Open real property / return or browser back | Detail / preserved query and sort | Real fallback for direct entry; no invented desktop surface |
| T6 S6→requests | Restore reads then explicit reload | Valid known data / continue unknown | No automatic overwrite or request creation; full nonempty consumer pending |
| T7 S5↔S7 | Explicit eligible room/rate choice,real review/back | Exact selected quote retained through card/footer/review;reload without selection returns to room choice | Implemented;no request is fabricated or stored |
| T9 S5→trip/filter→S5 | Edit/cancel/invalid/valid commit | Invalid draft retained;cancel preserves selection;valid commit clears stale rate and recomputes eligible rooms | Executed in connected cases;filter/capacity empty has actual recovery |
| T10 S7→S8 | Future explicit local request save | Planned atomic request write / retain draft | Duplicate/revision/fault recovery not implemented or verified |
| T8 S8→change/cancel | Explicit management and confirmation | Planned persisted update / retain prior request | Planned back/re-entry and failed-write preservation, not verified |

Do: distinguish read readiness from write errors, preserve raw data and invalid input, use real return navigation. Avoid: fake remote confirmation, implied charges, seeded requests, forced account/tutorial, automatic resubmission after unknown results. Intentional differences: local fixtures and local request lifecycle instead of supplier booking. Unknown: live inventory, device-native calendars, real supplier APIs and their policies. Do not mark all of onboarding-flow inapplicable: its recovery contract applies; signup/consent are out of scope.
