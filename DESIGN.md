# Qwen UI tooling design context

## Overview

This repository supplies local-model generation and review tooling. Its own root has no single product UI, palette or type scale. Generated applications keep their own DESIGN.md, source references and tokens. Existing evaluations and rejected outputs are historical evidence, not shared product defaults.

This context is based on [AGENTS](AGENTS.md), [the entry skill](skills/qwen-samkill-ui/SKILL.md), [operating rules](skills/qwen-samkill-ui/references/operating-rules.md), the source-bound stage/component guide delivery in scripts/skill-context.mjs and the bundled catalog checker. Colors, Typography, Shapes and product tokens are omitted here because they belong to each target application.

## Layout

Preserve explicit platform scope and source relationships. A mobile-only screen remains a bounded vertical composition in a wide viewport. New default backgrounds follow upstream white guidance; existing explicit product requirements remain scoped decisions.

Reference work uses research → decomposition JSON plus complete raw analysis → receiver interpretation → generation → first core-screen comparison → full review. Coordinate spaces, HEX/alpha roles, uncertain observations, relationships and extensions travel with the actual generation inputs. A JSON pointer or file name alone is not delivery. Use the bundled export payload in the host-prepared REFERENCE.md/shared component context; retain its hashes and provide the original images/assets.

## Do's and Don'ts

Apply the [decomposition format](skills/qwen-samkill-ui/references/upstream/reference-decompose/references/decomposition-json.md) and [reference gate](skills/qwen-samkill-ui/references/upstream/reference-review/references/reference-evidence.md). Do not silently discard raw or extension fields, infer CSS units from image pixels, or use structural validation as visual approval. Core-screen and final review still require actual comparisons. The existing sidecar ledger lock, Windows support and catalog scope remain authoritative.
