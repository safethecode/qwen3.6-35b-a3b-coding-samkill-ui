# Measurement handoff and comparison — 2026-10-22

The user reported recurring failures despite existing prose rules and identified yoch.cc. Its initial reference notes had no measured column width, used a chosen640px and still marked RUI-16/17 pass. A newly observed source DOM at1440px has a464CSS-px column. These observations diagnose the saved initial implementation, not the actively changing correction branch.

The adapted decomposition/implementation/review guides now require source-bound measurements with units and methods. The bundled design gate has a prepare command and validates reference_handoff/reference_comparison for applicable RUI-16/17. It rejects vague dimensions, mixed coordinates, missing or stale comparisons and values outside declared tolerances. Overall visual findings remain required even when numbers match. No catalog rule or quality threshold was removed.

The local entry skill, AGENTS and shared generation guide carry the same requirement; scripts/skill-context.mjs already delivers the shared guide as complete source-bound text. The actual catalog runner invokes the updated Python checker. Generation itself still requires the supervising agent to run prepare; this change does not claim that every model will obey instructions automatically.

The source/adapted hashes and uncommitted source state are in [sync.json](../evals/results/reference-evidence-20261022/sync.json). Python gate judge/prepare changes were ported while preserving the local sidecar lock and Windows support. Source comments/docstrings remain omitted in the adapted helper.

Validation:38source gate tests passed against this copied checker,213existing Node tests passed with canonical macOS TMPDIR, and2Python ledger tests passed. No new inference or application visual evaluation ran. Existing installed packages in other projects were not silently refreshed. This working update is not committed or pushed.

Subsequent user approval: commit and push this update. The source implementation is now committed as `3b7ed67a994572b226601157a0114e78f924840d`; sync.json records this exact revision and the unchanged source/adapted hashes. The working-state statements above describe the earlier state. Only this update is included; unrelated DS_Store files and historical evaluation outputs remain excluded. Verify the remote main tip after pushing.
