# Decomposed layout for local models

Read the upstream decomposition guide and its element contract. Record observed reference relationships separately from chosen implementation values and unknowns. Do not infer a font, asset origin or interaction from an uninspected screenshot.

## Before generation

Match the reference and candidate screen purpose and visible state before comparing them. A checkout screenshot does not specify a catalogue hero. For a photo-led reference, obtain and inspect suitable real media with provenance before implementation; abstract decorative shapes are not a substitute for missing product imagery. Record substitutions explicitly. For illustration-led references, preserve that medium instead of imposing photography. Freeze the initial render before changing the contract.

Define shared typography, colors, spacing, surfaces and responsive behavior. Divide the screen into semantic elements with explicit owned text, assets, actions and states. Give each element its available width, parent padding, adjacent read-only structure and forbidden duplicate content. Assign inter-element spacing to the assembly so two elements cannot both add it.

Preserve the reference's grouping. Identity, description, price and actions need a deliberate reading order. A favorite that belongs to identity must stay there; price and consultation can share a quiet footer only where the reference and available space support it. Avoid adding separators, large buttons or explanatory paragraphs absent from the contract. At narrow widths, wrap the intended groups rather than shrinking type or forcing every control onto one row. These are reference-specific relationships, not a universal card template.

Use real font files and verify actual rendered families, glyph fallback and weights through the typography checks. Use verified official icon assets and the required selected/unselected states. Asset presence alone does not prove matching size, paint, placement or behavior.

## Bounded implementation

The repository's explicit static pilot is `node scripts/generate-components.mjs TARGET EVIDENCE`, with `design/component-plan.json` and typography prepared first. See the repository's `docs/COMPONENT-GENERATION.md` for its schema. It generates one element at a time and assembles accepted fragments without a model rewrite. Fixed semantic HTML may request CSS only. Record host-supplied markup, shared CSS, fonts and selector scoping as assistance. This CLI is not an automatic OpenCode route and does not implement a complete product workflow by itself.

Render each element in a sample with the same available width and horizontal inset as its assembled slot. Review samples and the full page at desktop and mobile widths. Repair one owned region while retaining correct neighbors; rerun affected checks and the assembled view. The pilot's resume requires unchanged inputs; do not claim changed-plan checkpoints remain valid. Complete all requested interactions separately, including empty, error and recovery states.

When independent generations repeatedly break an already agreed structural relationship, move that relationship into the shared assembly scaffold and supply immutable semantic HTML before requesting local CSS. Keep stable IDs for measured roles rather than assuming a model-chosen class survives the next run. Record which markup and layout declarations the host supplied. This reduces the model's writable responsibility; it does not demonstrate independent design competence. Do not turn a screen-specific action row into a universal preset. Verify enlarged text again: a correct row can still hide its label with nowrap, ellipsis or a fixed height. Use wrapping and content-driven control height where the label must remain complete.

Each CSS unit needs the actual rendered element structure, including JavaScript-created children, exact attribute values, attribute owners and available custom properties. Supply complete CSS statements with nearby inheritance context. A tag-only shell omits dynamically rendered cards; a declaration cut midway omits valid existing source. Keep the writable unit explicit and its dependencies read-only.

For decorative illustrations, implement the frame's dimensions and positioning context first, then each shape variant using the exact rendered attribute value. Review the painted result as well as its box: a positive-size empty background is not a completed illustration, and absolute pseudo-elements can escape a zero-height owner. Test every variant in the assembled page. For forms, verify the actual font and weight of inputs, selects and placeholders separately from body text. A supplied font file alone does not establish control inheritance.

## Behavior units and semantic acceptance

For an interactive application, separate validation/date utilities, state persistence, DOM rendering and event wiring by their actual dependencies. Give a state-only request its API and record schema; unrelated page HTML and CSS make that responsibility harder to identify. Preserve stable IDs when rendering and wiring are separate. This is a decomposition option for work that does not complete reliably, not a requirement to split every small script.

Syntax and export checks cannot approve behavior. Exercise a valid create/change/remove/reload sequence as well as malformed records and failed writes before accepting a state module. For synchronous local storage, derive the next array, persist that candidate and update in-memory records only after the write succeeds. Saving the old array or mutating memory before persistence breaks recovery. Validate actual calendar dates, identifiers and required text rather than accepting strings that only match a regular expression.

When HTML interpolation is forbidden, specify the permitted operations concretely: replaceChildren to clear, createElement/append to construct controls, clone an existing template and assign user text through textContent. An HTML-escaping helper does not satisfy a no-innerHTML contract. Test the resulting interaction rather than accepting an absence-of-keyword check as proof.

If a diagnosed repair repeats the same defect, reduce the writable unit to one function or explicit statement slots. Preserve the raw rejected outputs and accepted neighbors. Verify semantic behavior again: a validation patch can accidentally insert an unconditional return and disable valid creation. Record host-selected boundaries, export/assembly glue and model-generated logic separately. Keep thinking settings, token limits, elapsed time and completed output as experimental evidence; a single successful narrow repair does not establish a better default or general reliability.

At a module boundary, declare parameter types, exact imported names and existing selectors. Probe a generated renderer with real typed state in the browser before passing it to the event-wiring stage. Treating an ISO date string as a Date object or inventing an external helper can propagate a bad interface into every later stage even when each file parses. A change in the accepted interface requires a new caller contract and replay, not a syntax-only checkpoint.

## Executable layout contract

Create `design/layout-contract.json` with a nonempty `rules` array. Each rule needs a unique `id` and `kind`. Selectors must identify exactly one visible element except `absent`, which requires no matching element. Optional `widths` and `states` restrict applicability and must not hide required coverage.

| Kind | Fields | Measured relationship |
| --- | --- | --- |
| firstLineControls | subject, rows, text, controls, tolerance | For explicitly declared variable-height rows, each owned control stays near the first text line center and inside its row. Relative selectors must resolve once per row; zero visible rows cannot pass. Use numeric line-height and visited filled/long states. |
| contained | subject, container | DOM ownership and rendered containment |
| absent | subject | No duplicated or forbidden content in a region |
| below | subject, reference, minGap | Ordered regions with a minimum vertical gap |
| disjoint | subject, reference | Independent regions do not overlap |
| sameRow | subject, reference, tolerance | Horizontally separated regions have aligned vertical centers; tolerance defaults to 2px, maximum 8px |
| rowLimit | groups, maximum | Maximum semantic groups sharing a horizontal row |
| sampleWidth | subject, sample | Sample HTML and assembly have equal width and inset |

For example, a card contract can contain favorite ownership in identity, absence of body paragraphs in identity, body below identity, nonoverlapping price/action, and a row limit across price/action/favorite. Use the actual selectors and observed relationships of the target, not copied selectors from another service. The sample filename must be a local HTML file.

Both browser evaluation routes emit layout-contract evidence. Missing contracts and uncovered viewport/state scopes remain UNVERIFIED; a failed relation is FAIL. Test 1440, 390 and 320 pixel widths alongside existing long-text, 200% text and spacing checks. Preserve source and harness hashes. A contract added after generation is a diagnostic audit, not evidence of predeclared compliance.

Geometry cannot establish reference-level quality. Inspect font appearance, icon states, density, rhythm, copy and complete responsive composition against the reference directly. Assess every active rule in the 75-rule catalog and all eight guides with evidence. Missing visual, interaction or asset evidence remains unknown even when every layout relation passes.

## Resolve text sizing conflicts before generation

A reference measurement describes a default-size state. For buttons, headings and other text-bearing regions, translate the observed height into a minimum height with natural growth unless the product explicitly requires a bounded scroll region. Keep exact dimensions for genuinely fixed visual assets or icon-only targets when appropriate. Do not pass a fixed text height to the local model while also requiring enlarged text to remain visible. Resolve that contradiction in the component plan before generation and record the plan change; do not silently weaken the text-stress requirement.

Use unitless line-height for wrapping text so200% font enlargement does not leave the original pixel line-height behind. A text action needs normal wrapping, sufficient padding and automatic height. Preserve complete labels, type size and the ownership of adjacent actions. Inspect actual button text bounds as well as ancestor clipping: native controls can lose label content even with overflow:visible. Missing reused-component samples must be rebuilt from the unchanged assembled content and checked alongside newly split units.
For Korean purpose headings and short labels, inspect200% wrapping at the actual available width. Keep a word such as 목요일 or 추가 together when it fits on a new line; appropriate keep-all plus emergency wrapping can preserve words without shrinking text or adding nowrap. This is a language/content decision, not a blanket ban on wrapping URLs, code identifiers or long unspaced user content. Verify the heading and its neighboring action after the change.

# Preserve screen purpose before splitting components

Check allocated width as well as wrapping. For a declared icon-plus-primary-action row, the primary control must occupy its remaining track; min-width:0 permits shrinkage but width:0 can collapse a grid item into one-character lines. Declare a fillRemainder relation for this two-control pattern and compare actual widths at normal and enlarged text. No clipping and a shared row do not prove readable control geometry. This applies to a flexible primary track, not intentionally compact icon-only controls.

Lock platform scope first. For a mobile-only task, preserve a bounded mobile preview and the observed vertical stack even inside a desktop browser window. Record the chosen preview width separately from measured reference pixels. Do not introduce desktop columns, enlarged desktop headings or alternate navigation without user authorization or an actual reference for that platform. This restriction applies to host-written shared CSS and assembly, not just model-generated components. Remove contradictory desktop instructions from every component prompt. Add maxWidth and below rules without mobile-only width filters so a 1440px test rejects an invented desktop layout. Wide-viewport testing checks the same mobile screen; it does not authorize a new desktop design.

Before a local model styles individual elements, inspect the reference with the upstream reference-decompose guide and record these relationships in DESIGN.md and design/layout-contract.json. Splitting into image, title and button is insufficient.

1. Identify the screen purpose and entry/exit route. A detail screen needs an accessible working return path, including direct entry. Do not invent a branded header to fill the top edge. Describe the observed navigation position and assign its implementation owner. Test the destination, not only the arrow's existence.
2. Describe the canvas and semantic surfaces: which content shares a background, which groups are separated by empty space, and which controls have their own bounded surface. Record observation separately from chosen CSS values. For a reference using white sections on a gray canvas, preserve that grouping without substituting hr elements or thin border dividers. This is reference-specific; do not force cards onto references that use open whitespace.
3. Assign one primary message per state. In a success dialog, completion is primary; product and reservation data are supporting summary content. Hide the previous form's duplicate product summary and title when switching states. A typography difference alone does not prove semantic hierarchy: inspect the complete state screenshot and content ownership.
4. Separate supporting actions from primary actions. When observed or requested, favorite is a quiet bounded control surface, while booking remains the dominant action. Never pack price, favorite and primary action into a single undifferentiated row.
5. Write one compact relation brief per component: parent, siblings, screen purpose, owned content, surface, navigation/state dependencies, observed evidence, chosen values, unknowns and verification. Shared assembly owns relationships crossing component boundaries. Include this brief in each component prompt and pass the machine-readable layout contract during generation.

Use declared `returnNavigation`, `surface`, `typeHierarchy`, `contained`, `below`, `rowLimit` and `absent` rules for measurable relations. Scope rules by states and widths. Run state-specific rules in the actual form/success state; skipped states are unverified, never approved. A static destination attribute does not prove navigation; click it and verify the real destination loads. Surface checks do not establish reference fidelity, and unknown reference CSS must remain unknown. Retain same-width reference/output captures and manually review hierarchy, spacing, icons and typography.

When user feedback contradicts a decomposition, preserve the previous output and add a correction record: missing observed relationship, affected element/assembly owner, revised input, measurable check and before/after screenshot. Clearly distinguish host-authored correction from independent local model improvement.
