# Selected room/rate quote dependency

Freeze this before the first quote-generation request. This is one dependency of the complex product,not a replacement for its complete connected UI. Host supplies this contract and fixtures;actual local Qwen supplies behavior.

Export exactly `buildQuote(catalog, selection, today)` from quote.js. Allowed imports are the existing accepted dates.js and query.js. The catalog is the supplied local fixture array;do not mutate it or selection. No DOM,persistence,network,ambient clock,formatting or new dependencies. No comments.

Selection is an object with exactly six keys:stayId,roomId,rateId,start,end,guests. Three IDs must be primitive nonempty strings. Dates are exact YYYY-MM-DD and must satisfy isBookableRange(start,end,today). Today is the explicit supplied argument. Guests must be an integer1–8. Invalid array/null/missing/extra/type/date/range/today inputs return exactly `{ok:false,error:'INVALID_SELECTION'}`. A nonarray catalog is also invalid.

Find the property,its owned room and that room's owned rate by their complete IDs. A well-shaped but missing/mismatched ID,insufficient room capacity or occupied night returns exactly `{ok:false,error:'UNAVAILABLE_SELECTION'}`. Never silently choose a different room or cheaper rate. Checkout is exclusive;accepted selectOffers already implements closure and arithmetic.

Build the accepted query from selection with city:'',type:'all',minPrice:0,maxPrice:1000000,freeCancellation:false,amenities:[],sort:'recommended'. Pass a singleton catalog retaining only the selected room/rate to selectOffers and the same explicit today. Do not change the original catalog while building that singleton. Missing eligible offer is unavailable;an invalid trip is invalid before selection.

Success is exactly `{ok:true,quote:{stayId,roomId,rateId,start,end,guests,nights,nightly,cleaningFee,serviceFee,total,freeCancellation,breakfast,capacity}}`. IDs/dates/guests are the selected values. Nights,nightly,total are the accepted offer. CleaningFee is the selected room's one fee;serviceFee is total−nightly×nights−cleaningFee. The selected rate owns freeCancellation and breakfast;selected room owns capacity. All money values are integer KRW primitives. No invented cancellation deadline,discount,refund,review,confirmation or additional fields.

Quote is a new object,not a mutation or storage write. It preserves room/rate identity and complete price/inclusion facts for the later review and local request. Actual inventory,charge/vendorconfirmation remain unavailable;do not imply them.
