# Selected room/rate quote dependency

Actual local Ollama qwen3.6:35b-a3b-coding, think:false. This is a small dependency for the complex accommodation flow, not an approved UI or complete booking product.

Initial generation passed3of9 semantic groups. One input defect belonged to the host: the prose assigned cleaningFee to a room while the actual catalogue assigns it to the selected rate. The corrected contract and input-correction receipt preserve that attribution. The local model also omitted strict selection validation, mapped invalid dates to unavailable, and passed all rates to a cheapest-offer query instead of preserving the chosen rate.

After the host corrected that contradictory fee-owner input, an actual Qwen request supplied four bounded source patches. The accepted dependency passes9of9 groups: exact property/room/rate ownership, selected flex price, family capacity/inclusions, one cleaning fee, closure boundaries, typed errors and immutable inputs. Do not attribute all improvement to model-only reasoning. No manual behavioral patch was applied to quote.js.

Run from the repository with Node24 or later:


node evals/results/stay-booking-20261016/quote/replay.mjs /path/to/new-report-directory


The complete raw generation/repair responses, source/harness/input hashes, failing checks, v1 contract, corrected contract and accepted source are retained. Original worker source is an evidence snapshot, not a standalone runner; the replay command runs the independent semantic checker on the published accepted dependencies. The newly executed published-source report is in replay/report.json. File-index hashes exclude the index itself.

Source query.js intentionally preserves seven whitespace-only lines from its accepted hash-bound local output; normalization would change evidence. No browser/reference parity, UI choice, request creation/change/cancel, vendor booking, payment or refund is established by these counts.
