# Calendar legibility correction

This is the source-bound C5 checkpoint at e69356f. The [C7 gutter follow-up](../calendar-gutter/README.md) addresses its retained V-C5-05 in the current runnable source. Original receipts and failure classifications below remain unchanged.

The earlier calendar passed cell bounds while enlarged date labels visibly ran together. This correction preserves 32px dates at 200% text, reserves space between neighboring labels and gives the bounded mobile grid one actual scroll owner per axis. It also keeps Cancel outside short-height scrolling, makes the footer reachable and retains weekday/month context during focus and horizontal panning. It is an assisted product correction, not reference/commercial parity.

[Current runnable source](../request-consumers/source) connects search and trip calendar drafts to their callers. From the repository root:

```powershell
npm ci
$env:CHROME_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
node evals/results/stay-booking-20261016/calendar-legibility/checks/replay.mjs
node evals/results/stay-booking-20261016/request-consumers/serve.mjs
```

Use your installed Chrome location. The replay accepts optional target and fresh output directories and performs no inference. The server prints its local address. Saved UI inspection needs no Ollama instance; fresh Qwen generation does.

The bound C5 browser evidence covers 60 calendar state/width/text-mode/font captures, 36 date-gap cases, 36 scroll/focus/real-click cases at 500/600/900px heights and four 500→900→500 resize cases. Retained behavioral assertions cover date arithmetic,renderer,controller,search/trip draft isolation and existing discovery,room and request recovery. These counts establish only their recorded mechanical scopes. The seven calendar layout relations do not approve the previous 79 relations or all 75 catalog rules.

The [visual review](visual-review.md) and [independent review](evidence/independent-review.md) separate observed corrections and unresolved work. The [reference receipt](evidence/reference.json) reuses the native image inspected in this same bounded round. Native pixels and signed URLs are not distributed. Native enlarged/selected behavior,original font/CSS/DPR,real devices,soft keyboards and assistive technology remain unknown.

The broad C5 local Qwen CSS request completed normally but returned invalid CSS and changed unowned selectors. Its [raw sanitized record](failures/local-css.json) remains a failure. C5 wrappers,scroll/controller correction and final CSS are host assistance. Earlier accepted Qwen model/renderer attribution remains in the [calendar study](../calendar/README.md); the renderer now also includes a host sticky label wrapper. A later three-rule generation experiment is separate evidence and does not make this an unattended all-Qwen product.

The old pointer-focus attempt moved targets before click dispatch and was rejected. Its failures are preserved. The first strict month-caption-top test also overreached when both months fit; the final checker tests actual painted prior captions against their readable owned dates. Original pending-over28night test expectations were corrected to the existing preserve-start/error contract. No failure is relabelled as a successful original run.

Request editing,shared navigation/favorite paint,complete product catalog/guide validation and repeated independent complex-product reference quality remain unfinished. Postimplementation assembly inventories are not original generation prompts. Current DESIGN.md retains the prospective repair scope under which these receipts were collected; the results here are limited to the exact tested source hashes.

A subsequent direct capture review also found a20px gutter inconsistency in the short-height,panned month label. V-C5-05 remains a confirmed follow-up in the visual review. This checkpoint preserves that failure instead of presenting the scoped mechanical results as calendar completion.

The [portable replay](evidence/portable-replay.json) completed all 15 stages against these exact published bytes. The [decomposed local-unit record](evidence/decomposed-unit.json) contains the separate actual Qwen request/response:112 output tokens,normal stop, 111301ms. It passed 36 glyph and 36 scroll cases on the disclosed host-corrected base. This is one constrained compliance trial,not improved latency,repeatability or reference-level generation proof.
