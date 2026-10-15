# Strict layout capture coverage

VERIFIED COVERAGE UTILITY, NOT UI OR REFERENCE-QUALITY COMPLETION.

An individual inspection still leaves unvisited layout states UNVERIFIED. The new aggregator requires the entire explicit viewport/state/text-mode matrix and each rule's declared width/state scope. Receipts include the contract digest and capture identity. Missing cells, stale digests, duplicate/missing rule results and malformed scopes cannot pass. Reported failures survive later passing captures, out-of-scope receipts and early validation errors. Only structured pending-state notices can be resolved by the matching complete capture set.

Real Chromium regression: a default reading capture alone stays unverified; a vertically centered deletion control in a tall editing row fails; corrected first-line placement passes with both states captured; retaining the failed observation still fails the batch. A missing viewport remains unverified. Text padding/border are included in the first-line content center. Present null,false,zero,empty-string/empty-array scopes are rejected instead of treated as omitted.

The initial independent review found three important holes: requested cells outside narrow rule scopes were not enumerated; early validation could discard a reported failure; falsy malformed scopes bypassed validation. New red/green regressions reproduce each, and the revised read-only review found no remaining material issue within this geometry/coverage scope. Null receipt elements and null scope no longer throw.

Executed checks:123 repository tests,44 browser-suite tests, and18 final focused layout/coverage/guide-routing tests passed. The final focused run follows newline-only normalization of the changed source files; the four code/test files were verified byte-exact against the staged index. Historical red logs remain private because native stack traces contain machine paths. Their failures and fixes are described here rather than publishing private paths.

The aggregator does not authenticate a receipt, activate a DOM state, enlarge text, compare visual quality or certify source identity. The calling browser workflow must actually perform each transition, assert the state, apply each text mode, retain screenshots and bind unchanged source/harness files. Existing runners are not silently upgraded to full state coverage merely by importing the utility. The next bounded planner experiment must use it with real reading/editing captures; its UI changes and reference quality remain unfinished.
