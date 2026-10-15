# Runtime MTP control: no demonstrated fix

A fixed-seed store-generation pilot compared draft_num_predict2versus0 while holding model,prompt,format,think=false,sampling,context and output cap unchanged. Each setting ran a cold focal request,an interposed short thinking request,and the identical focal again. Actual native runtime arguments are recorded.

| Runtime | Cold store groups | After interposed request | Content identical within setting |
| --- | --- | --- | --- |
| MTP2 | 1/11 | 1/11 | Yes |
| MTP disabled | 0/11 | 0/11 | Yes |

This pilot did not improve store semantics or demonstrate predecessor-history dependence. It does not establish a universal MTP ranking or explain all earlier failures. The [upstream report](https://github.com/ggml-org/llama.cpp/issues/26425) remains a hypothesis on different builds/backends. No model setting was adopted from these results. The installed weight/projector digests match the current official registry;no reinstall was performed.

[Original plan and raw requests](plan.json),[corrected checks and exact source hashes](revalidated-results.json),[concise findings](summary.json). The original verification fixture mistakenly combined v2DESIGN with declared v3input;its source-hash errors remain in [original results](results.json). Those host errors are not model scores. All four unchanged raw responses were independently replayed against the exact21file input from the earlier public materializer and the original11store-group checker.

Replay one specimen from repository root:

```text
node evals/results/focus-timer-runtime-20261015/materialize.mjs draft-2/focal-1 runs/runtime-control-replay
node evals/results/focus-timer-runtime-20261015/check-store.mjs runs/runtime-control-replay/store.js runs/runtime-control-checks
```

The checker intentionally exits1:these are retained failed control outputs. They do not replace the [accepted assisted storage source](../focus-timer-store-20261015/README.md). Current timer UI,CSS,direct reference comparison and complete catalog remain unfinished.
