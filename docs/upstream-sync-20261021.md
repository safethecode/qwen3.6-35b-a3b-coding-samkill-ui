# Upstream synchronization — 2026-10-21

User request: commit the changed samkill-ui order and reconcile its consumers in this repository, samkill-pdp-design and samkill-goodnotes-diary.

The source revision and file hashes are in [the synchronization manifest](../evals/results/upstream-20261021/sync.json). This task uses the local source commit; neither source nor downstream commits are pushed by this task. The earlier [2026-10-15 manifest](../evals/results/upstream-20261015/sync.json) remains historical evidence.

## Applied changes

- Updated the adapted samkill-ui and reference-to-ui guides plus samkill-ui metadata from the committed source. The `SKILL.md` → `guide.md` transformation is unchanged. The previous adapted bytes matched the prior source before replacement.
- Updated the local [entry skill](../skills/qwen-samkill-ui/SKILL.md), AGENTS and README. Reference-driven work now explicitly follows research → decomposition → implementation → review, validating reusable sources at each phase.
- Updated [the shared generation guide](../skills/qwen-samkill-ui/references/decomposed-layout.md), which `scripts/skill-context.mjs` already delivers as full source-bound text to all six direct stages and component styling. This reaches actual prompt consumers rather than changing only provenance metadata. The runner consumes prepared inputs; it does not perform the preceding research automatically.
- Preserved local execution constraints, platform scope, explicit user design decisions, Python sidecar locking and historical failures. No model configuration, quality threshold, application output or Python gate implementation changed.

## Contract checks

Manual comparison covered a new UI without sources, supplied images, valid prior decomposition, search-only work, bounded repairs and unavailable references. New work checks research then decomposition before implementation. Valid inputs are reused at their phase; search-only work does not generate, and failed reads remain unavailable.

The file, guide-delivery and regression results below cover this synchronization. No Ollama generation, UIbowl request, product render or new autonomous design-quality trial is claimed.

Executed checks: skill quick_validate passed; changed Markdown local targets and four local heading anchors resolved; all three committed source hashes, adapted hashes and transformations matched; `git diff --check` passed. `python3 -m unittest discover -s test` passed both gate tests. The first `npm test` run passed 212/213 and failed the installed contract-link test because macOS returned a canonical temporary path different from the symlink spelling. Rerunning the unchanged full suite with `TMPDIR=/private/tmp npm test` passed 213/213, including full guide delivery and installed package links. No test or acceptance threshold was changed. The initial failure and environment-specific result are retained in [validation.json](../evals/results/upstream-20261021/validation.json).

## Future updates

Compare the changed upstream paths against the pinned revision, preserve local adaptations and reconcile the local skill and actual shared prompt consumers. Keep source/adapted hashes, applicable checks and exclusions. Updating the source repository alone does not refresh this snapshot or copies installed in other projects; installer destinations require a separate diff and update within the user's scope.
