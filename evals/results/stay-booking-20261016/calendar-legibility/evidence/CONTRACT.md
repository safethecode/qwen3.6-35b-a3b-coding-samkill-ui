# Date-grid legibility repair input

This prospective correction follows independent visual review of the exact frozen a4dd23c runtime. Its previous bounds/font tests passed their scopes but did not test sibling date glyph separation. The 296px200% date rows visibly concatenate,so reference/commercial quality remains failed. Preserve those screenshots and results;do not relabel them as a glyph-legibility pass.

O-L1: Actual296px200% Noto32px two-digit date ranges nearly touch adjacent glyphs. O-L2: Calendar normal seven-column ordering and chosen16px date role must remain. Native enlarged behavior is unknown. The existing R-CAL image is reused within this bounded repair;this is not a fresh native observation or new original-reproduction test.

D-L1: Add one bounded common calendar-viewport containing calendar-content,visible weekday labels and full month stack. Header,month controls and footer remain outside. This viewport owns both scroll axes so headings and dates share exactly the same horizontal tracks. The page/body never acquires horizontal overflow. Calendar remains mobile-only capped390.

D-L2: calendar-content minimum inline size calc(14ch + 7 * var(--control-gap)),using the same inherited Noto family and16px date role;the chosen16px inter-slot allowance reserves at least8px glyph separation under the declared stress settings. It grows with font size through ch. Default at296px still fits without horizontal scrolling. Enlarged views may need bounded horizontal panning. This is a documented accessibility adaptation of a fixed seven-column data grid,not permission to invent a desktop pane or hide dates.

D-L3: Date buttons keep all glyphs and natural height,min-height:max(44px,calc(1.5em + var(--control-gap))). Normal16px remains44px;200%32px becomes64px with readable vertical separation. No font reduction,clipping,nowrap,forced date wrapping or replacement with image text. Keep actual32px dates under enlargement.

D-L4: Host assembly adds the shared scroll wrappers and moves existing weekday/month containers inside. It preserves all IDs,semantic tables,full dates,private draft,caller behavior,official icons and asset geometry. The scroll region has a meaningful accessible name and tabstop. Actual Qwen supplies only scoped CSS overrides for the new layout responsibility. Host assembly is not Qwen output.

Q-L1: Across296/320/390/1440,normal/text200/spacing and blank/range/error states,measure every adjacent same-row date glyph gap and same-column consecutive-week vertical glyph gap against chosen8px. Check normal no-horizontal-scroll,common weekday/date x-centers and unchanged selected slot sizes. Reveal first/last month/date/column through actual focus and viewport scroll,then click actual edge targets. Header/footer and whole dates stay reachable. Preserve actual font evidence. Directly inspect fresh enlarged and normal captures after repairs. Full75-rule/device/AT/native-parity remain separate and unfinished.


## Prospective correction after first scroll replay

The active actual scroll owner receives the one region tabstop and accessible name;the inactive wrapper does not add a redundant region. Native regionEnd must reveal the complete Apply control. Sticky weekday padding paints its gap rather than exposing moving digits. A horizontal sticky span preserves the full month label during necessary date-grid panning. Pending over28night clicks preserve start/error by the existing C1 contract;the initial edge test expected the wrong transition and is corrected with its original failures retained.
