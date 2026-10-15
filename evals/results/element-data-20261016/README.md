# Actual element data and installed skill synchronization

The component runner can now pass selected actual JSON records to each bounded local prompt, retain whole-file/delivered-value hashes, reject invalid data before inference and reject changes before assembly. Catalogue rate.id and quote.rateId remain their actual distinct owned fields. Unknown shape is not reconstructed from labels. The interface and its limits are in docs/COMPONENT-GENERATION.md.

Initial missing-feature checks failed5/5; the initial focused component/data/guide run passed13/13. Independent review then found that array.length was erroneously accepted as JSON Pointer data. The added regression failed as expected before restricting array tokens to canonical indices. Final full npm test passed151/151 with Chrome explicitly configured,0skipped/cancelled. The earlier missing-Chrome invocation was not a clean test run and is not substituted for this final log. Logs preserve failed assertions; only absolute local stack paths are redacted, with original/published hashes in receipts.json.

Installed OpenCode skill inspection found15changed tracked files matching known older repository blobs and3missing files. The changed managed files were backed up privately and only repository-managed files were synchronized. All50tracked skill files now match the verified checkout by SHA256. Extra installed files and model/MCP/application configuration were outside mutation scope. This does not reload an already running conversation or prove model compliance.

The added skill paragraph is a tested API reference. No independent skill-pressure test, all-rule UI approval, visual parity or commercial-quality claim follows from these counts. The complex accommodation work remains incomplete.
