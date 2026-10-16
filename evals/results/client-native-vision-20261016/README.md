# Native Qwen client delivery — scoped evidence

**Overall UI quality remains INCOMPLETE.** This work corrects the actual client/model/image path. It generates no new application screen and approves no reference parity, full catalog, font or layout match. The current product checkpoint remains the calendar gutter correction.

The direct benchmark used the custom Qwen3.6 35.5B Q4_K_M model, while both loaded OpenCode defaults still selected the older30.5B Coder alias. The 35B coding tag also had no server context parameter: an explicit native request used16K, but a compatible API request loaded4K. The installed image bridge unconditionally replaced image attachments with secondary-model summaries.

The active and global configurations now select `ollama/qwen-ui-35b`, including the previously pinned visual agent. Existing model entries, agents, permissions and MCP configuration were preserved. Both files and the old plugin entry were backed up privately before replacement. The alias reuses the measured GGUF blob without downloading weights and sets the local server context to32768; a real client request confirmed32768 and about8.35GB model VRAM. The portable profile leaves hardware offload choices to the operator.

The bridge now checks the latest user message's selected model against OpenCode's resolved image-input capability on each request. Native image attachments are preserved without secondary inference. Unknown/text models retain the existing summary fallback. URL-only native references still require actual image retrieval; this change does not make a URL visible to the model. [Bridge implementation and regression tests](https://github.com/safethecode/opencode-auto-vision/commit/0c98578).

## Actual client outcomes

| Attempt | Result | Evidence and limit |
| --- | --- | --- |
| First capture harness | FAIL | CLI waited for stdin EOF; stopped only the verified fixture process before any model request. |
| EOF-corrected capture harness | FAIL | The capture proxy incorrectly treated the buffered inference helper as a streaming response. Retries were retained; no tool-completion claim. |
| Correct streaming proxy, isolated plugin | Scoped PASS | OpenCode1.18.33 sent real PNG input and structured read/write calls; wrote the file marker,9payment methods and `10,057원 결제하기`, then returned `PROBE_COMPLETE`. |
| Installed default plugin | FAIL | Qwen read a project filename relative to the reference-image directory. Access was denied; it still printed the completion marker. Exit0 and that marker did not satisfy the artifact check. |
| Same installed session, exact path contract | Scoped assisted PASS | Host supplied exact owned input/output paths without relaxing access. Actual read/write completed, saved observations matched and the final text was the marker. This is a bounded repair, not a fresh unattended pass. |

Every real request used `qwen-ui-35b` and `reasoning_effort: none`. The probe deliberately capped output at1024 tokens; the supplied profile permits8192. OpenCode converted the native1125×2436 PNG into924×2000 PNG input. The actual transmitted image hashes are retained: image pixels reached the model, but the payload was not byte-identical to the native reference. The repair session reattached the same reference, producing two copies per request; its timing is not a clean cache or latency experiment.

The screenshot was freshly retrieved from UI Bowl during this round and directly inspected before inference. [Native reference screen](https://uibowl.io/name/%EC%97%AC%EA%B8%B0%EC%96%B4%EB%95%8C?patterns=%EC%98%88%EC%95%BD%C2%B7%EA%B2%B0%EC%A0%9C&imgId=cm7ec3e36005kl70cvvg601te). Native pixels, signed URLs, local paths and raw client requests remain private. Public receipts contain the source image ID/hash, transmitted image dimensions/hash, exact model identity, code/input hashes, tool statuses, token events and hashes of the retained raw files. MCP connections were disabled for the fixture; this is not a successful live UI Bowl MCP agent run.

## Checks and unresolved decomposition

The full repository suite passed196 tests with the installed Chrome explicitly selected. An earlier shell omitted that browser setting and produced failures; every observed failed entry and its raw-log hash remain in [checks.json](checks.json). The bridge passed11 tests and syntax checks; an independent read-only review found no material issue. Four relevant skill/profile checks passed after the path-contract guide update. Installed managed skill files were compared against the repository after backing up the two known prior versions.

The initial direct native-image decomposition completed and identified concrete payment content, but returned0–1000 corner coordinates against a normalized xywh0–1 contract. It remains **FAILED**. [The original response and rejection](initial-perception.json) are retained; no guessed conversion promotes it to accepted geometry. Facts-only and geometry phases must be evaluated separately before feeding an implementation contract. Exact OCR, complete element ownership, actual fonts/assets, interactions, full rendered reference fidelity and repeated complex-product quality remain unfinished.

Read [client-probes.json](client-probes.json), [model-profile.json](model-profile.json), [config-application.json](config-application.json) and [skill-sync.json](skill-sync.json). These receipts record executed scoped checks and host assistance; protected image inputs and private raw transport records are not distributed as a public replay fixture.
