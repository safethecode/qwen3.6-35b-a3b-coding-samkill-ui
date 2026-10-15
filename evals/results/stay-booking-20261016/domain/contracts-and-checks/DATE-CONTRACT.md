# Stay date model v1

Only dates.js. PureESmodule with exactlyparseStayDate(value),countNights(start,end),isBookableRange(start,end,today). Noimports,DOM,storage,network,ambientDate.now,comments or sideeffects. Readonlyinput. BuiltinDate.UTC/getUTCFullYear/getUTCMonth/getUTCDate are allowed for exactcalendarvalidation andUTCday arithmetic,not localtime arithmetic.

parseStayDate(value) accepts only primitive strings matching exactYYYY-MM-DD,length10,years2000..2099,validGregorianmonth/day. Return UTCmidnight epochmilliseconds integer or null. Roundtrip the constructedDate to reject rolleddates;2028-02-29 valid,2027-02-29 invalid. Rejectwhitespace/newline,missingpadding,datetime/timezone suffix,objects,numbers,null. Neverthrowforinvalidinput.

countNights(start,end) calls exactdateparsing,returns wholeinteger1..28whenend>start;otherwise null. Day is86400000UTCms;noDST/localtimezone rounding. Inclusive maximum28nights. No dateformat conversion or inputs mutation.

isBookableRange(start,end,today) returnsstrictboolean:trueonlywhen allthreevalid,start>=today,andcountNights(start,end)isnotnull. Today is anexplicitargument;never usecurrentcomputerclock. Equalcheckin/todayisallowed. Datewindow2000..2099isachosenprototypeconstraint,notanobservedvendorpolicy. Unknown/invalidahead datesdonotauthorizebooking.
