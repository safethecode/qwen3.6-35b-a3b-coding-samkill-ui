# Mobile accommodation discovery and booking requests

## Overview

Connected mobile product for comparing stays,choosing a room/rate and tripdetails,reviewing price,saving a local request,and managing changes/cancellation. User explicitly rejected simple timer as the primaryqualitysample. Current snapshot implements B1 discovery and B2 room/rate/trip/filter selection with read-only itemized review. Local request creation/change/cancel and custom calendar remain unfinished. Active scope: ROOMS-CONTRACT.md, STYLE-CONTRACT.md and design/flow.md. Twenty actual native UI Bowl previews were inspected in this round;unreturned gallery screens remain unknown. Canonical receipts and image hashes stay in separate evidence,not production photoassets. Upstream167fc8d matchedHEAD at fresh2026-10-16check.

Fixturecatalog is fictional and local;photographs are separatelylicensedgenericroomimages,not actualinventory/vendor endorsement. No livecharge,externalhotelreservation,vendorconfirmationorrefund is implemented orclaimed. Do not collectpaymentcarddata oradd unnecessarydemo/implementationnotices inproduct UI. Emptyuserrequests are confirmedonlyaftervalidstorage read;no seededrequest,review orfakeurgentinventory.

## Colors

Whitepage#FFFFFF. Darktext#222126,secondary#66616A,quietcontrols#F5F3F4. Chosen executiondarkrose#B51D51withwhiteforeground followsobserved restrainedphoto-led neutralinterface vsstrongexecutionrole;not anofficialsampledAirbnbtoken. Error#B42318distinctfromexecution;selectedneutraldarkstate +label/shape,notcoloralone. Photos retainowncolors. No globalgraycanvas ordecorativebar.

## Typography

ReuseexactlicensedlocalNotoSansKRvariablefont100–900;knownplatformnameNotoSansKRThin mustbeverifiedinactualbrowser. Page/sheettitle22/700/1.5;propertytitle18/600/1.5;price18/700/1.5;body16/500/1.5;controls16/600/1.5;secondary14/500/1.5;errors16/500/1.6. ExactrolesdeclaredbeforeUIgeneration. No400weight,manualbr,texttruncationofconditionsortransformshrink. Test296/320/390/1440,and200%text/textspacing.

## Layout

Mobilemax390ateverybrowserwidth,sameverticalinformationsequence. Resultsouterinset20chosenCSSpx;propertyphotofillsownarticlewidth,1:1 chosen ratio;eacharticleownsphoto/favoriteandverticalidentity/secondaryfacts/pricewithinternal8/12spacing,nextproperty32. Search/date/guests/filterssitintheirsemanticcontrolsabovecontent;noadvertisinghero/categoryfillers/mapplaceholder. Detailhasrealbackwithdirectentryfallback;selectedproperty/room/rateandtripfactsarepreservedtoreview. Price,primaryactionandfavoritearenotcollapsedintoonecrowdedrow. Only3actualbottomdestinations:search,saved,requests. Noinertnavigationor inventeddesktopcolumn.

## Elevation & Depth

Sectionsgroupbytaskandspace;quietfieldorsummarysurfaceswhereobserved/useful,nouniversalnestedcards. Nohorizontaldecorativeseparators/tabunderlines. Modal/sheetbackgrounddimsactualcontext;onlycontentscrollwhenneeded. Inputwrapperownsvisibleinsetfocusring;forcedcolorsfallbackrequired;notdoubleinputoutlines. Functionalfieldedgesareallowed,nothrsubstitutes.

## Shapes

Chosenphoto/fields12/8radii,sheet16topcorners;purpose-specific,notallcapsules. PinnedofficialLucideSVGswithoriginalgeometry/license,normal20pxvisualslotand44pxorlargercontroltargets. Favoriteoverlayhasitsownquietroundsurfaceandexplicitpressedstate/name. Nohanddrawniconsorbrandlogo.

## Components

E-SEARCH/E-STAY/E-NAV/E-FILTER plus native-date editing,E-ROOM and read-only E-REVIEW are connected. E-REQUEST creation/change/cancel and custom calendar remain planned,not verified. Calendarusesdate-onlyUTCvalidation,1–28nightsandexplicittoday;quoteusesintegerKRW/knownrateidentity. Search/filterdraftandpersistedrequestareseparate. Requestoutcomeisprimary;propertyfactsaresecondary. Loading/empty/invalid/pending/changed/cancelled/readfailure/writefailureandexplicitrecoverymustbereachedandrendered. Initialreadfailurecannotclaimemptyoroverwriteoriginaldata;writeretryretainsinput;returnnavigationpreservescontext.

## Do's and Don'ts

Preserveobservedphotodominance,metadatahierarchy,separateprice,selectioncontrols,explicitpolicies/total and truthfulrequeststatus. Readrelevantguidetextbeforeeachphaseandpassactualapplicableguides/typedbindings/nativeimagesforstylingtothemodel. Do notuse allguidefullbodiesorotherhelperimplementationtasksasambiguouswritablecontext. Keep rawfailures,inputversions,hostassistanceandactualsource/harnesshashes. Unitcounts,licensedassetpresenceorstaticcardsarenotcommercialquality. Corefirstsame-widthdirectcomparisonprecedesdependentflowexpansion;all75rules/eightguidesandrepresentativererunsremainrequired.


## Historical B1 first CSS input (superseded for B2)

The actual Airbnb main preview has a nearly square listing photo (visual estimate in image pixels,not recovered CSS). The initial4:3chosen ratio was a generic input and is corrected to1:1before the first localCSS generation. Earlierinput and rawcontroller bindings remain in pre-style-source/. Existing20pxpageinset tokens remain unchanged. Search destination16/600,trip/count metadata14/500,propertytitle18/600,price18/700,cardmetadata14/500,favorite/navlabels14/600,formlabels/buttons16/600. Alllineheights1.5excepterror1.6. Results has an accessible hiddenh1and actualsearchsummary;do not invent a visiblebranded/pageheader to fillspace. At that historical B1 stage the detail was read-only;current B2 replaces it with actual room/rate choice and review. Native datepopup devicebehavior/customcalendar and the nonempty requestconsumer remain unfinished. Hostcore/runtime/eventframes andactualQwenfunctions are separatelyattributed.


## B2 room/rate adaptation

B1 discovery source remains separately frozen/published. Current detail scope follows ROOMS-CONTRACT.md, refined by UI-DECISIONS.md before renderer generation and STYLE-CONTRACT.md before CSS. Native Dailyhotel room-selection reference preserves a wide11/5 room photo, compact identity/facts and subordinate quiet price summary; actual rate comparison is a chosen sheet interaction. Current runtime is host assembly/review; local Qwen owns domain adapters, card/rate renderers and CSS. Local request creation/change/cancel/customcalendar and reference-quality approval remain unfinished. Source design/typography.json declares B2 numeric roles;the active combined design/layout-contract.json registers B1+B2 relationships. The B2-only snapshots are historical inputs. None approves appearance.


## Active contract registration

The normal design/layout-contract.json now registers B1 and B2 relationships together;default quality readers must use this active contract. The root room-layout-contract.json is a retained B2-only input snapshot. design/component-plan.json is explicitly a postimplementation assembly inventory of current semantic source,not an original generation or independent reproduction input. Its previous B1-only assembly is preserved in evidence;do not regenerate obsolete readonly detail from it. The active inventory includes actual room/rate/review scopes and exact current styles. Fullcatalog/eightguide and repeatedreferenceapproval remain unfinished.
