# Full declared-scope spacing before ownership change

Week/date and task list scopes only;editor unchanged. 23selector groups,32spacing declarations. CSS audit,not complete rendered-distance approval. All existing token bindings and values preserved. No4px/8px rhythm migration. New functional list management grouping will own its16px internal bottom gap;existing button retains8px padding.

| Selector | Role | Property | Value | Classification |
|---|---|---|---|---|
| .planner-header | structural | padding | 24px var(--screen-inset) 0 | ALIGNED(24), PRESERVED(--screen-inset=20px), ALIGNED(0) |
| .task-groups | structural | padding | var(--space-section) var(--screen-inset) | PRESERVED(--space-section=32px), PRESERVED(--screen-inset=20px) |
| .week-strip | internal | gap | 4px | ALIGNED(4) |
| .week-strip | internal | padding | 4px 0 | ALIGNED(4), ALIGNED(0) |
| .task-category | structural | margin-bottom | var(--space-section) | PRESERVED(--space-section=32px) |
| .category-heading | internal | gap | 8px | ALIGNED(8) |
| .task-list | internal | padding | 0 | ALIGNED(0) |
| .task-row | internal | gap | 8px | ALIGNED(8) |
| [data-ui-unit="week"].planner-header | structural | padding | 24px var(--screen-inset) 0 | ALIGNED(24), PRESERVED(--screen-inset=20px), ALIGNED(0) |
| [data-ui-unit="week"] .planner-heading | internal | gap | 12px | ALIGNED(12) |
| [data-ui-unit="week"] .planner-heading | internal | margin-bottom | 16px | ALIGNED(16) |
| [data-ui-unit="week"] .planner-heading h1 | internal | margin-bottom | 0 | ALIGNED(0) |
| [data-ui-unit="week"] #edit-tasks | internal | padding | 8px | ALIGNED(8) |
| [data-ui-unit="week"] .week-strip | internal | gap | 4px | ALIGNED(4) |
| [data-ui-unit="week"] .week-strip | internal | padding | 4px 0 | ALIGNED(4), ALIGNED(0) |
| [data-ui-unit="week"] .day-button | internal | gap | 4px | ALIGNED(4) |
| [data-ui-unit="week"] .day-button | internal | padding | 4px | ALIGNED(4) |
| [data-ui-unit="tasks"] .task-category .category-heading | internal | padding | 0 12px | ALIGNED(0), ALIGNED(12) |
| [data-ui-unit="tasks"] .task-category .category-heading h2 | internal | margin | 0 | ALIGNED(0) |
| [data-ui-unit="tasks"] .add-task | internal | padding | 0 4px | ALIGNED(0), ALIGNED(4) |
| [data-ui-unit="tasks"] .add-task | icon-label | gap | 4px | ALIGNED(4) |
| [data-ui-unit="tasks"] .task-list | internal | margin-top | 8px | ALIGNED(8) |
| [data-ui-unit="tasks"] .task-list | internal | padding | 0 | ALIGNED(0) |
| [data-ui-unit="tasks"] .task-row | internal | gap | 8px | ALIGNED(8) |
| [data-ui-unit="tasks"] .task-toggle | internal | gap | 12px | ALIGNED(12) |
| [data-ui-unit="tasks"] .task-toggle | internal | padding | 8px 0 | ALIGNED(8), ALIGNED(0) |
| [data-ui-unit="tasks"] .task-check | internal | margin-top | calc(.8em - 10px) | UNVERIFIED(10), UNVERIFIED |
| [data-ui-unit="tasks"] .delete-task | internal | padding | 0 4px | ALIGNED(0), ALIGNED(4) |
| [data-ui-unit="tasks"] .delete-task | icon-label | gap | 4px | ALIGNED(4) |
| [data-ui-unit="tasks"] .delete-task | internal | margin-top | max(0px, calc(0.8em - 14px)) | UNVERIFIED(0), UNVERIFIED(14), UNVERIFIED |
| [data-ui-unit="tasks"] #empty-state | structural | padding-bottom | 24px | ALIGNED(24) |
| [data-ui-unit="tasks"] #page-error | structural | margin-top | 16px | ALIGNED(16) |

Calculated first-line offsets and content-dependent auto distances remain unresolved in this source audit. No font,size,color,content or assets are changed as a spacing fix. The separate semantic move changes ownership by design and must be verified in actual states.
