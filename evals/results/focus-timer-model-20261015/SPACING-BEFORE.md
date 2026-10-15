# Before component styling

Full existing shared source: 7 unique selectors,9 spacing declarations,12 classified terms (including unresolved auto). This is a CSS-source inventory,not a complete DOM or rendered-distance audit. No existing spacing is changed by behavior work.

| Selector | Current | Role | Proposed/application |
| --- | --- | --- | --- |
| body | margin: 0 auto | structural | preserve; ALIGNED,UNVERIFIED |
| p,h1,h2 | margin: 0 | internal | preserve; ALIGNED |
| .focus-screen | gap: var(--space-section) | structural | preserve; ALIGNED |
| .focus-screen | padding: var(--space-inset) | structural | preserve; ALIGNED |
| .focus-session | gap: var(--space-section) | structural | preserve; ALIGNED |
| .text-action | padding: 8px | internal | preserve; ALIGNED |
| dialog | margin: auto auto 0 | structural | preserve; ALIGNED,UNVERIFIED |
| dialog | padding: 0 | structural | preserve; ALIGNED |
| .config-sample | margin: 0 auto | structural | preserve; ALIGNED,UNVERIFIED |

All planned component spacing,not a sample:

| Selector | Property | Chosen proposal | Role | Purpose |
| --- | --- | --- | --- | --- |
| .stage-content | gap | 24px | structural | time/settings group |
| .time-readout | gap | 16px | internal | between intact duration pairs |
| .time-pair | gap | 8px | internal | number/unit association |
| #completed | gap | 16px | internal | primary outcome/support |
| .error-region | gap | 8px | internal | message/recovery action |
| .session-actions | gap | 16px | internal | primary/reset |
| #primary-action | padding-block | 16px | internal | actual action hit area |
| #primary-action | padding-inline | 24px | internal | compact action extent |
| #primary-action | gap | 8px | icon-label | official paint and visible label |
| .duration-panel | padding | 24px | structural | sheet content |
| .config-heading | gap | 16px | internal | title/cancel |
| #duration-form | margin-top | 24px | structural | heading/form distinction |
| #duration-form | gap | 24px | structural | field/error/confirmation |
| .duration-field | gap | 8px | internal | label/control/error association |
| #duration-input | padding | 12px | internal | field interior |
| #apply-duration | padding | 16px | internal | sheet confirmation |

No fixed off-grid/review values in this declared source scope. Auto margins and centered flex remainder remain content-dependent unknown;all final distances and native control geometry require actual renders at all11states/fourwidths/three modes. New8/16/24/32 inputs are chosen,not inferred source tokens. Shared outer inset24 stays owned by screen;sheet alone owns its24px inset. Border/radius/minimum sizing are excluded from spacing classification and separately checked. Expected structural8/internal4 rhythm is an intent,not a quality pass.
