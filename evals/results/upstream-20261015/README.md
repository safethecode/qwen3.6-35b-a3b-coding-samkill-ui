# Updated upstream and local reproduction study

Status: **INCOMPLETE. Reference-level parity is not established.**

The pinned samkill-ui source advances from c4ddc53 to [167fc8d](https://github.com/safethecode/samkill-ui/commit/167fc8d5982e361d86f598c80540d4eff460394d).14guide files changed or were added. [Sync manifest](sync.json) records original/adapted hashes and the preserved local gate adaptation. User-defined mobile-only scope and gray-canvas/white-section composition remain controlling requirements.

A fresh UI Bowl Frip detail preview was retrieved and directly inspected. [Reference image](reference.jpg), [sanitized provenance](reference.json). The current connector did not provide a screen ID, so it remains unknown. CSS, font identity and hidden original states remain unknown. The licensed pottery photo is an adapted asset, not the original terrarium picture.

The initial local Qwen run completed all three components but collapsed the primary booking button using width:0. The previous no-overflow/no-clipping checks reported zero problems while the visible text formed a narrow vertical column. That candidate is a confirmed failure. [Actual source and captures](static-initial/), [new width diagnostic](static-initial/action-audit/report.json). A one-patch local-model repair changed the erroneous width and restored the flexible track to196/220/290px. All four viewports and normal/200%text/spacing modes now satisfy this scoped relation. [Repair request/response](static-repaired/repair/), [measured result](static-repaired/action-audit/report.json).

[Model summary](static-summary.json), [runtime](runtime.json) and [raw generation](static-generation/) distinguish actual local requests from host markup/shared layout. The source auditor preserves role-based review notes and unresolved context; [pre-change audit](spacing-before.json) covers54spacing declarations/37selectors, with one confirmed off-grid declaration,10review entries and15entries needing context. This is CSS declaration coverage, not complete rendered-distance approval.

The regression suite passes157tests. The primary-action allocation gate now catches a failure that overflow tests missed; calculated spacing is retained as unresolved rather than falsely treated as a fixed off-grid term. The full75-rule/eight-guide final review and representative independent-product/transfer runs remain unfinished. Do not infer parity from these counts or from this assisted same-case reproduction.

[Phase-specific guide application](skill-application.md) records read/applied/pending distinctions. The original source and prompt remain frozen. A separate local-model booking-dialog style experiment is in progress; its outputs are not represented as an observed Frip modal or independent full-app creation.
