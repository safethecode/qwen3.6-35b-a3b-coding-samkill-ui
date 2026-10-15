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

Use the actual installed Chrome path on your machine. The runner checks it before creating a browser server. An optional output directory is accepted; otherwise results go to a fresh private `runs` directory. Eleven serial jobs cover parse/resource/inventory integrity, consecutive storage and history recovery, mixed user text and font-loading failures, date grouping, guest routing/editor, discovery, rooms, booking renders, header edge clicks and132 request-state captures across normal/200-percent/text-spacing modes and four widths.

The portable drivers adapt imports and target paths from retained private drivers. The booking driver omits the private native-image comparison while retaining candidate checks. `portable-derivatives.json` records both driver hashes and the changes. A fresh portable run passed all eleven jobs against this exact source. These checks do not establish native visual similarity, screen-reader behavior or real-device quality. An injected missing font remains a raw font failure even when its recovery test passes.

## Source attribution and limits

Actual generation used local Ollama Qwen3.6 35B A3B coding. Domain helpers, room/rate renderers, guest behavior and scoped CSS have separately preserved generation and repair evidence. Host assistance includes markup/templates, shared runtime, routing, storage coordination, consumer integration, focus/recovery changes, font/assets, contracts and typed assembly of bounded model values. This checkpoint is not an unattended all-Qwen result. Later evidence commits preserve rejected attempts and assistance separately.

The active design and component plans describe the assembled implementation; they are postimplementation inventories, not independently frozen reproduction inputs. Request editing, a custom calendar, isolated element samples, full75-rule/eight-guide evidence and repeated representative reference parity remain unfinished. Chosen local request history/detail/cancellation are not observed native screen reproductions. See `source/DESIGN.md` for the actual scope and state contracts.
