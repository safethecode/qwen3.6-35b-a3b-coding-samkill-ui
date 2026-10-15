# Mobile focus session design input

## Overview

PLANNED INPUT; no implementation or visual approval. This is a new product using observed timer/settings relationships, not exact reproduction. The pre-research brief remains unchanged. One user chooses a duration and completes one focus session. No task list, workshop cards, dashboard, social content, advertising, brand header or desktop variant.

## Colors

Chosen white canvas #FFFFFF, strong text/action #202024, secondary text #60606A, quiet configuration surface #F4F4F5 and error #B42318. These are new product choices, not recovered reference colors. R-FOCUS-A is dark with a small bright start accent; retain its dominant timer/quiet surrounding content relationship while deliberately adapting to upstream white-default scope. R-CONFIG-B has a white sheet over a dimmed parent and a strong confirmation action; preserve that separation. Do not invent a saturated brand palette. Contrast/render suitability remains unverified.

## Typography

Chosen supplied Noto Sans KR variable font from the already pinned licensed asset, pending target export and actual glyph/weight probe. Heading22/700/1.5, countdown numerals56/700/1.2 with tabular figures, time units14/500/1.5, primary controls16/600/1.5, secondary controls and field labels14/600/1.5, errors14/500/1.6. Declare exact selector roles before generation. These values are chosen CSS px, not measurements of reference pixels. Duration is limited to1–180 whole minutes. Numeral/unit pairs remain intact; their parent can wrap under real text enlargement without shrinking text. No fixed text heights or manual line breaks.

## Layout

Mobile-only max-width390 at296/320/390/1440 browser widths. One vertical screen with24px owned outer padding and natural vertical scrolling. The primary task is time remaining, followed by its current session action. A functional screen heading identifies the timer; no separate branded header. Readout and its duration configuration belong to the timer stage. Start/pause/resume and reset belong to the session action group. Configuration is a distinct modal/bottom sheet with a real cancel/return-focus path; direct main entry needs no invented previous screen.

Use normal flow with a minimum viewport-height canvas, a flexible timer stage and a later action group. Do not fix controls over content or pin a timer to an absolute screen coordinate. At200% text, allow numeral/unit pairs to wrap as groups and let the page grow. Completed outcome replaces the active readout as the dominant content; configured duration becomes supporting data. Never retain two competing primary headings.

## Elevation & Depth

White main surface; no generic card framing, separators or synthetic progress ring. Configuration alone uses the observed overlay/sheet relationship. Focus remains visible and reduced motion has no decorative animation to suppress. Main and completed states do not inherit planner or workshop surfaces.

## Shapes

Choose16px top sheet corners and8px action/field corners. Official pinned Play/Pause assets may accompany the primary action with8px icon/label gap; text remains visible. Export assets and inspect actual paint before accepting them. Reset and duration configuration may remain text actions. No hand-drawn timer ring or pseudo-icons.

## Components

| E-ID and source | Ownership and content | Chosen contract and unknowns | Required evidence |
|---|---|---|---|
| E-SCREEN; R-FOCUS-A | Main screen owns title, timer stage and action group | Outer24px each side; single mobile column; original CSS/DPR and fixed positioning unknown | Actual bounded canvas, ordering, all content reachable at every width/text mode |
| E-TIME; R-FOCUS-A plus R-CONFIG-A numeric/unit relation | Timer stage owns actual remaining minutes/seconds and a quiet duration-change action in ready/completed state | Dominant56px numeric text; unit pairs wrap naturally; no decorative rules; countdown behavior is newly specified, not observed stopwatch behavior | Ready/running/paused/completed actual values, long180-minute value,200% text and spacing, no orphan units |
| E-ACTION; R-FOCUS-A start action | Session action group owns one primary start/pause/resume/restart control and subordinate reset when applicable | Min52px natural target,16px label, official icon if used; secondary min44px; gap16px within group and32px stage-to-actions | Real touch/keyboard/focus states, no competing equal-weight primary buttons, actual icon paint/label matching |
| E-CONFIG; R-CONFIG-B | Sheet owns duration heading, one labeled minutes control, validation and apply/cancel actions | Main remains visible only as dimmed context; internal24px, group gaps24px; no AM/PM, workout/fasting options or duplicate close controls | Open/cancel/Escape/apply/return focus, select options and preserved input; source image does not demonstrate those behaviors |
| E-FIELD; R-CONFIG-A/B | A native minutes selector or numeric field owns duration input; exact control choice must be frozen before behavior generation |1–180 whole minutes; visible label;16px text; min48px natural height; quiet field surface; native expanded popup is not claimed custom | Invalid/empty/out-of-range input, actual chosen options or number semantics, enlarged text, caret/device limits explicit |
| E-OUTCOME; newly specified completion | Completed state owns one primary outcome and supporting configured duration | No fake elapsed-success claim after clock changes; restart reuses configured duration as a new session | Deadline-derived completion after background/reload, subordinate support and focus stability |
| E-ERROR; newly specified storage recovery | Persistent error region owns truthful read/write failure guidance; configuration keeps current draft | Failed initial read is unknown data; block mutation until explicit successful reload. Ordinary write failure remains retryable | Raw storage unchanged, input preserved, restored-read/reload/mutate and write-retry replays |

## Do's and Don'ts

Maintain five anchors: dominant time data; one session primary action; separate configuration hierarchy; white bounded vertical canvas; completed outcome replacing active task. Native UI Bowl images are references; code is assistant/local model work. Preserve first inputs and failures. No fake ticking demo, sample reservations, seed session, unnecessary implementation copy, decorative rules, fixed-overflow mask, desktop side panel or unsupported visual-completion claim.

State contract: ready → running → paused → running → completed, plus explicit reset. Persist running end timestamp and paused remaining duration; derive display from current clock rather than accumulated intervals. Writes commit before controller state changes. Deadline completion and its storage-failure behavior still need an exact module/interface contract before inference. Wall-clock tampering and physical device/browser background behavior remain unverified until specifically tested.

Next: resolve E-FIELD choice, freeze actual HTML ownership/interfaces, full role-based spacing inventory, typography/asset manifests and source-bound state/layout tests before local generation. All current verification entries are planned, not pass. The independent planner repetition running now must finish before any timer inference.
