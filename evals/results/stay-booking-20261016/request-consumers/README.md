# Connected accommodation requests

This is a frozen, working local UI checkpoint, not a reference-quality approval. It connects accommodation discovery, search/filter/favorites, room/rate selection, price review, guest editing, request creation, request history/detail and cancellation. The historical TodoMate planner remains below reference quality; this more complex product does not turn its failure into a pass.

## Run the UI

From the repository root, with Node22 or newer:

```powershell
node evals/results/stay-booking-20261016/request-consumers/serve.mjs
```

Open the localhost URL printed by the command. No dependency install or inference server is required to inspect this saved source. The port is chosen automatically; an optional numeric argument selects a fixed port.

Start at discovery, open a property, open a room, choose a rate and continue to the guest/price review. Enter guest information and save the request. The requests tab opens locally saved records; detail provides a real return route and cancellation. Reload preserves records. The fictional catalog is not live availability, and saving a request does not contact a hotel, pay, confirm a booking or issue a refund. No request is preseeded by the product. Browser storage is scoped to the origin, including its port.

The benchmark uses a November2026 fictional trip. Browser verification freezes the clock at October16,2026; the standalone UI uses the real browser clock. For later manual inspection choose a valid future trip in search. Native reference pixels are not distributed. Generic room photos, official icons and supplied font files retain their separate provenance and licenses under `source/assets`.

## Reproduce scoped checks

From the repository root:

```powershell
npm ci
$env:CHROME_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
node evals/results/stay-booking-20261016/request-consumers/verify.mjs
```

Use the actual installed Chrome path on your machine. The runner checks it before creating a browser server. An optional output directory is accepted; otherwise results go to a fresh private `runs` directory. Fifteen serial jobs cover parse/resource/inventory integrity, consecutive storage and history recovery, mixed user text and font-loading failures, date grouping, guest routing/editor, discovery, rooms, booking renders, three-header edge clicks, room positive-anchor renders,related-icon/date stress,room-label edge/focus interactions and132 request-state captures across normal/200-percent/text-spacing modes and four widths.

The portable drivers adapt imports and target paths from retained private drivers. The booking driver omits the private native-image comparison while retaining candidate checks. `portable-derivatives.json` records both driver hashes and the changes. The earlier room-header checkpoint passed twelve portable jobs against its bound source revision. These checks do not establish native visual similarity, screen-reader behavior or real-device quality. An injected missing font remains a raw font failure even when its recovery test passes.

## Source attribution and limits

Actual generation used local Ollama Qwen3.6 35B A3B coding. Domain helpers, room/rate renderers, guest behavior and scoped CSS have separately preserved generation and repair evidence. Host assistance includes markup/templates, shared runtime, routing, storage coordination, consumer integration, focus/recovery changes, font/assets, contracts and typed assembly of bounded model values. This checkpoint is not an unattended all-Qwen result. Later evidence commits preserve rejected attempts and assistance separately.

The active design and component plans describe the assembled implementation; they are postimplementation inventories, not independently frozen reproduction inputs. Request editing, a custom calendar, isolated element samples, full75-rule/eight-guide evidence and repeated representative reference parity remain unfinished. Chosen local request history/detail/cancellation are not observed native screen reproductions. See `source/DESIGN.md` for the actual scope and state contracts.

The subsequent room-header repair corrects the old host-prescribed22/700 task role to18/600, matching the observed task/card relationship, and cancels the duplicated main inset around its44px back target. All previous69 relations remain and two prospective checks were added. The original checkpoint and11-job evidence remain in Git history and the adjacent request-verification artifact. That room-header revision completed twelve jobs, including24 three-header checks and132 request-state captures. See the adjacent room-header-repair evidence; the historical11-job record remains unchanged.

The current associated room-label/chevron correction changes only one CSS alignment value and adds declared label/icon and relative-type relationships. Actual/wrapped labels across four widths and three text modes have24/24 captures without alignment/stress failures;16 label/icon/edge interactions and12 room workflows pass. The scoped icon evidence remains in the adjacent room-label-alignment artifact.

The subsequent checkout-date correction chooses 14px values and moves all 12px insets to the single parent surface,removing narrow child overrides. That fourteen-job replay passed against the earlier date/inset source revision,including 36 combined related-feedback captures and 16 room-label control interactions. Previous twelve-job records describe their own earlier bound revision and remain historical. See the adjacent checkout-date-insets artifact for actual local response,guide delivery,source diff,failed before captures and the full new replay. These results do not approve whole-product visual quality.

The current room-card price hierarchy correction passed a fresh fifteen-job replay against this exact revised source. It retains selected/footer totals while making card prices subordinate to room identity; both list and selected states have 24 font/relative/stress captures. See the adjacent room-price-hierarchy artifact for actual local output, failed before evidence and all fifteen reports. Earlier fourteen-job evidence remains bound to its own revision. The selected navigation icon/text color mismatch found in the separate catalog review remains a known failure; these checks do not approve overall visual quality.
