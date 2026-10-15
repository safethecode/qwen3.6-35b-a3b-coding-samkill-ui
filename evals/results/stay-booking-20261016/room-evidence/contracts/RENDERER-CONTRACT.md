# Actual B2 template renderer contract

Export exactly renderRoomChoices and renderRateChoices. Browser ESmodule, no imports. No network/storage/time/innerHTML/eval/comments. Both consume frozen trusted catalogue/accepted quote data and host-owned templates; textContent for all content, src/alt only for verified photo paths. Never fabricate reviews, availability or policies. Replace only owned container children with clones of supplied templates.

renderRoomChoices({container,template,stay,quotes,selectedRateId,onOpen})
- Iterate stay.rooms in catalogue order. For each room with at least one quote matching room.id, clone template.content.firstElementChild. Set article.dataset.roomId=room.id; [data-open-room].dataset.roomId=room.id and its click calls onOpen(room.id). Title node [data-room-name] gets exactroom.name. Never move title/facts/price outside hosttemplate.
- [data-room-photo] src=room.photo,alt=room.photoAlt. [data-room-bed]=room.bed,[data-room-capacity]='최대 '+room.capacity+'명'.
- Cheapest eligible quote in that room by total owns summary: [data-room-nightly]=money(q.nightly); [data-room-total]=q.nights+'박 총 '+money(q.total)+' · 수수료 포함'. money(integer) = Korean grouped integer+'원'. Keep all quotes for later choices; summary is not automatic selection.
- [data-room-selected] hidden unless a quote in that room has rateId===selectedRateId. If selected, textContent='선택한 요금 · '+the matching catalogue rate.name. Onlyselectedroom exposes selected feedback.
- Every card contains exactly one existing open button; no new controls/icons/markup. Emptyquotes produces emptycontainer, hostowns empty/error states.

renderRateChoices({container,template,room,quotes,selectedRateId,onSelect})
- quotes are already thisroom's accepted candidates. Preserve order; for eachquote clone suppliedlabeltemplate. Nativeinput:radio value=quote.rateId,checked=(rateId===selectedRateId),name stays room-rate, aria-label=room.name+' '+matchingcatalograte.name. Attach change listener calling onSelect(the exactquote) only if input.checked. Do not change selection just from rendering.
- [data-rate-name]=exactrate.name.
- [data-rate-policy]=quote.breakfast?'조식 포함':'조식 미포함'. Cancellation already appears in genuine rate.name when included; do not add invented deadlines or duplicate it.
- [data-rate-nightly]=money(quote.nightly)+' × '+quote.nights+'박'. [data-rate-total]='총 '+money(quote.total).
- Do not appendrateIDs tovisiblecopy or useHTMLstrings. No parent layout/CSS changes. container is a div inside labeledfieldset; legend is outside it and not writable.

Both return undefined; inputs/quotes stay byte-equivalent; callbacks only actual events. Host explicitly supplies DOM/assembly/empty/recovery state, callbacks and boundaries. Qwen supplies these two rendering functions; this is assisted newproduct UI, not autonomous exact reproduction. Positive-anchor appearance requires actual later CSS/renders.
