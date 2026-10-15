# B2: room and rate choice

This is an assisted new-product adaptation, not exact reproduction. The primary is the actually inspected Dailyhotel reservation-flow preview in references/hotel-rooms-20261016/reference-0.jpg. The earlier Airbnb discovery reference remains authoritative for B1 search; it does not replace the hotel-room task.

## Observed anchors and chosen handoff

| ID | Observed image relationship | Implementation decision | Required comparison |
| --- | --- | --- | --- |
| A1 | Real return arrow above room-selection title; no promotional header | Header owns a working back control and the already supported favorite; title 객실 선택, subordinate selected property identity | Direct entry returns to browse; history returns to saved/browse context; no invented desktop/header |
| A2 | Trip/date/guest control and separate room filter occupy one functional region above cards | Actual trip editing sheet plus room-filter sheet; wrap only when necessary for text stress | Same-width header-to-control-to-first-photo sequence; open/cancel/confirm and retained draft |
| A3 | First wide photo runs flush to card top/left/right, approximately 257 by118 image pixels on296px image | Chosen aspect11/5, full card width;20px existing page inset; real separately licensed room photos | First photo remains wide/compact, not a square discovery hero or inset thumbnail |
| A4 | Room identity precedes small bed/capacity facts; price sits in subordinate quiet region | Card title18/600, facts14/500; room rates live in a quiet surface below facts; each rate has an explicit radio choice and exact money | Photo→title→facts→rate ownership stays vertical; no price/button/favorite crowding |
| A5 | Second full-width room card begins beneath first; white canvas and discreet grouping | Vertical room list;24px inter-room gap,8/12/16px internal roles; no hr/decorative bars; mobile max390 at every browser width | Compare structure/density at displayed390 and296, then enlarged text, not color or counts alone |

Original CSS, DPR, exact font family, image gallery interaction and hidden room-filter/choice behavior are unknown. The static reference does not prove any runtime. Native metadata numbers/reviews/share/gallery counters and unverified views/stock are excluded because the fictional catalogue cannot support them; exclusions cannot excuse losing these five central anchors.

## Pure dependency interface

Implement exactly export function listStayRates(catalog, stayId, trip, today, filters).
trip must be an object with exactly start,end,guests; filters exactly freeCancellation,breakfast, both booleans. start/end strings, valid explicit-today bookable range via isBookableRange; guests integer1..8; stayId nonempty string; catalog array. Invalid shape/date/today => {ok:false,error:'INVALID_ROOM_QUERY'}. Unknown valid stayId => {ok:false,error:'UNKNOWN_STAY'}.

For each room and rate of the known property in catalogue order, call accepted buildQuote(catalog,{stayId,roomId:room.id,rateId:rate.id,start:trip.start,end:trip.end,guests:trip.guests},today). Retain only successful quote results matching the requested boolean filters. Return {ok:true,quotes:[...]} including a true empty array for valid capacity/date/filter no matches. Never choose cheapest silently, mutate inputs, catch all failures as empty, use ambient time, DOM, storage or network. Imports allowed only ./dates.js and ./quote.js. No comments. Quote fields remain exactly the accepted buildQuote fields; do not add display data or copy policies.

## Connected UI scope and state

Host owns semantic markup, assembly, event boundary and fixture/photo delivery, explicitly recorded assistance. Qwen owns the bounded list dependency, quote selection behavior/rendering and scoped CSS. Do not claim fully autonomous generation from assisted output.

The current query supplies trip. Detail-specific filters start with the committed freeCancellation value and breakfast false; changing them does not overwrite discovery filters. Trip cancel/Escape leaves committed trip and selected rate unchanged. Valid trip/filter commit clears the selected rate rather than silently selecting another; validation preserves the invalid draft. Visible rate buttons are native radios in labeled fieldsets. A chosen rate must retain full property/room/rate IDs and price through the review route. Review is a separate actual view with back to room choice and retained selected quote; it shows trip, room/rate, itemized nights/cleaning/service/total and genuine inclusions. No charge/vendor confirmation, invented refund deadlines, fake progress or inert booking CTA. Local request creation remains B3/B4, not approved by this B2 scope.

Only one bottom surface is visible: navigation on B1/requests; selected-price/continue action on room selection; none on read-only review until request creation exists. Reserve actual measured bottom-surface height. Selection action stays disabled until explicit valid choice; no made-up booking button on a read-only review. Back on a fresh detail URL falls back to browse. Reload on a review URL without an in-memory selection returns to its room selection with truthful state, not a fabricated reservation.

Verify all rate identities/prices/closed nights/capacity, filter empty and recovery, trip preservation/cancel/invalid/reset, selected quote and review arithmetic, actual return routes, favorite storage faults, B1 regressions, paint ownership, official fonts/icons,296/320/390/1440,200%text and text spacing. A passed pure module or complete CSS is not reference approval. B2 still requires direct positive-anchor comparison.
