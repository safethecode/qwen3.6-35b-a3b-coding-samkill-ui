# Stay dates and eligible offer selection

These bounded local Qwen dependencies support the connected accommodation product described in [the frozen brief](../research/inputs/BRIEF.md). They do not replace room/rate selection,review,request creation,management or the complete visual comparison.

The backend was Ollama with qwen3.6:35b-a3b-coding,35.5B MoE,Q4_K_M,16GPUlayers,16Kcontext,thinking disabled. Exact requests,raw responses,drivers and failures are preserved under [evidence](evidence). The host supplied typed contracts,fictional catalog,checker and diagnosis;the model supplied dependency behavior. No result here establishes unattended generation or reference-quality UI.

Dates: the original Qwen output uses a valid export list. The first host validator only recognized export-function declarations and wrongly rejected it. The unchanged raw module subsequently passed9semantic groups. This is a host validator correction,not an improved model response.

Offers: the first Qwen output passed2/11groups. Qwen then supplied four narrow binding patches: pass the explicit today argument through the helper,and read amenities from their declared property owner. The original checker then reported10/11. Its remaining budget oracle had omitted the valid smallroom-family rate at168000. The published v2corrects that exact expected identity/price/order without changing the original contract or accepted module;the unchanged repaired module passes11/11. [The original checker](contracts-and-checks/check-query-v1.mjs.txt),failed reports and fixture-correction record remain available. This oracle correction is not claimed as model improvement.

The checks exercise invalid calendars,leap/day bounds,night counts,strict input schema,capacity,price limits,free-cancellation rate selection,amenity intersections,exclusive checkout closures,stable sorting,integer totals and nonmutation. They do not verify real inventory,charges,refunds or browser design.

Run from the repository root with Node24or newer:

```powershell
node evals/results/stay-booking-20261016/domain/replay.mjs runs/stay-domain-replay
```

Choose a fresh output directory. Replay validates every indexed published byte before running the exact date and corrected offer checkers against the supplied modules/catalog. It performs no inference and needs no local model. Full historical source bindings include other files from the original private execution snapshot;this focused artifact materializes only the dependency inputs needed by these two checks,not a full original app snapshot.
