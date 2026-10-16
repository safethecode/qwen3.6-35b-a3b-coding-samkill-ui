# Calendar semantic unit v1

This is a mobile-only component adaptation inside the existing accommodation product. Current checkout date cells remain read-only. Start with an isolated complete calendar, compare it, then connect it to the existing search/trip drafts without changing historical stored quotes or submitting a request.

## Observations

R-CAL is the freshly retrieved Airbnb search gallery. The first date-selection pattern query returned zero and the single retry used the returned search/date-picker vocabulary. All five returned native images were inspected. Screen2,cmpt6zdib8ehkvsr19trusm0,1125x2436,sha2566e5a119bb023fef2cb2e4a3281054e7cceb546656c1317266d23cdd62c6c48d1 contains the relevant calendar. Native images and signed receipt stay private; publish sanitized IDs/hashes/links only.

O1: A dominant white rounded calendar panel sits on the search background,with a prominent leading question,weekday row and left-aligned month labels. Date numbers form seven aligned columns; no individual default pills surround them. Consecutive months continue vertically. O2: Past dates are quiet/struck through. O3: Flexible-date controls and skip/next occupy separate lower groups. O4: Existing search sections and guest selection are other gallery states,not calendar-selected evidence. Measurements here are visual relationships,not original CSS or DPR.

Unknown: Native selected-range appearance,focus/keyboard behavior,precise fonts/CSS/tokens,touch targets,month navigation/persistence,scroll fixation and a completed range are not observed. Do not infer them from tags or add fake native observations.

## Chosen adaptation

Preserve one vertical month stack,seven date columns,quiet disabled dates,stronger month labels and distinct primary apply action. Use existing Noto Sans KR and official icons with existing mobile width cap390,white surface,text/muted/action tokens. No experience tabs,destination cards,flexible-date modes,skip,decorative dividers or filler copy. These are unrelated or unsupported in this product. Web navigation/focus/range semantics are chosen behavior,not a recreation of hidden native behavior. Do not invent desktop columns at1440.

Keep draft separate from the caller's applied start/end. Cancel/Escape/route exit discard only the calendar draft; Apply requires1–28nights and commits the two ISO strings atomically to the caller's draft,not storage or a quote. Reopening starts from that caller's applied draft. Today comes from the existing Asia/Seoul product date. Dates remain2000–2099; no new artificial booking horizon. Keep actual IDs,room/rate selection,guest values,return targets and read-failure protections.

## C1 pure model API

Only import parseStayDate,countNights,isBookableRange from ./dates.js. Return a complete JavaScript ES module as JSON js; exactly three named exports,no comments,DOM,network,storage,markdown or invented helpers.

makeCalendarMonth(month,today): month is exactly YYYY-MM in2000–2099,01–12; today must be a valid supported ISO date. Invalid arguments throw TypeError. Return {month,label,leading,days}. label is YYYY년 M월,leading is UTC weekday0–6 of day1. days includes every real day once in order,with {date,day,disabled}; date is padded ISO,day integer,disabled only when date<today. Leap years must be real. Never skip dates or pad the days array with blanks.

shiftCalendarMonth(month,delta): validate same month shape and integer delta within-1200..1200,otherwise throw TypeError. Return padded next month or null outside2000–2099. Handle year rollover with calendar arithmetic.

chooseCalendarDate(draft,date,today): draft has string start/end; both blank is valid,only start may be selected,or a complete valid bookable range. Invalid draft/today throws TypeError. Do not mutate any argument. Always return a new {start,end,error}. Invalid/impossible/past clicked dates preserve start/end and return error 선택할 수 없는 날짜예요. If no start or range already complete,start the new range at clicked date with empty end/error. If awaiting end and clicked<=start,replace start and keep empty end/error. If later clicked date exceeds28nights,preserve start/end and return error 최대 28박까지 선택할 수 있어요. Otherwise complete the range and clear error. An existing error field may be ignored; no other keys are copied.

## Subsequent UI units

C2 renders two consecutive month tables from C1 with stable date attributes,accessible full ISO date names,real disabled buttons,endpoint/range state and no unsafe HTML. C3 owns dialog draft/events,month browsing,keyboard/focus,Cancel/Apply and re-entry. C4 styles the actual static/dynamic markup with explicit roles and natural enlarged heights. Compare the isolated full component before product integration. Host scaffolding,contracts,tests and integration must be disclosed separately from actual Qwen logic/renderer/CSS. No visual approval follows from C1 tests.
