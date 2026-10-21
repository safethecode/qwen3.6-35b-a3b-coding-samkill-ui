# Upstream reference snapshot

Source: https://github.com/safethecode/samkill-ui

Commit: `ad3f8110df2522d72150831e99429744861ce8a5`

The eight source skill directories are retained under `skills/qwen-samkill-ui/references/upstream`. Their entry files and links were renamed from `SKILL.md` to `guide.md` to prevent duplicate skill discovery. They are reference material, not eight additional installed skills. The new entry point adds a local-model execution contract without replacing upstream design guidance.

The resume evaluation is a reduced, independently written task contract inspired by Round 09. Passing it does not certify equivalence to the full Round 09 design. No upstream application implementation or screenshots are included.

The copied Python design gate uses a sidecar file lock with Windows `msvcrt` or Unix `fcntl`; its evidence validation rules are retained. Run all writers through this version rather than mixing it with the upstream ledger-lock protocol. Existing malformed ledgers remain errors. Source comments/docstrings were removed from that script for this repository's style requirement.


## Update on 2026-10-15

Synced14changed/new guide files through upstream167fc8d. Adds complete phase-specific skill application records, frozen reproduction inputs, a role-based4/8spacing audit and color-selection guidance. The75active catalog rules and eight guide entry points remain. Source/adapted hashes are in evals/results/upstream-20261015/sync.json. Local sidecar-lock behavior is preserved because upstream Python did not change. Explicit user requirements take precedence: the existing mobile-only workshop retains its requested gray canvas and white sections; the new upstream white-background default does not erase that decision.

## Update on 2026-10-21

Synced the three changed upstream skill/metadata files through local source commit `ad3f8110df2522d72150831e99429744861ce8a5`. Research and decomposition now precede implementation, with phase-specific reuse of sufficient sources. Entry files and links retain the `guide.md` adaptation. The local skill and shared generation guide carry the same preparation order; the bounded runner still consumes prepared contracts rather than performing autonomous research. Source/adapted hashes are in [sync.json](evals/results/upstream-20261021/sync.json); scope and validation are in [the synchronization record](docs/upstream-sync-20261021.md). No Python gate or historical evidence changed. This task does not push the source or downstream commits.
