# Panned month-label gutter correction

V-C5-05: at296px/500px/200% the whole month label reaches dialog left0 after actual focus pans the flow owner. Fixed mode uses viewport with20px external margin;flow mode changes owner to calendar-body at dialog edge. left0 therefore has different meaning. Preserve the existing --page-inset20px definition and all fonts,dates,scroll owners,keyboard/click/Cancel andfooter behavior.

D-G1: Inflow only,the month-label sticky left offset uses var(--page-inset),not a new literal or additional padding. Fixed-mode left0 and its existing viewport margin stay. This is a one-selector,one-property bounded local repair. No new component,header,separator,copy or desktop layout.

Q-G1: Across296/320/390/1440,width500/600/900heights,normal/text200/spacing andrange/error,focus the actual lastdate to pan. Measure actual label left against dialog left + existingpageinset20px,keep the whole label anddate visible andheaderCancel intact. Record actual scrollmode;the normal state must not be forced into flow to pass. Re-run retained controller,caller,state,font,textgap,scroll andresize assertions on finalsource. Thesechecks do not approve deviceAT or native parity.

Beforechange scoped offset audit: one month-label andits two possible scrollowners;left0 unchanged in fixed mode → existing --page-inset20px in flow mode. No padding/margin/gap/token value changes. Calendarviewport20px margins,footer20px padding,grid control-gap16px andlabel-gap8px stay;flow body itself has no extra padding. This is a chosen geometry correction of previously observed user-scope gutter,not recovered nativeCSS.
