# Mobile accommodation discovery and booking requests

## Overview

Connected mobile product for comparing stays,choosing a room/rate and tripdetails,reviewing price,saving a local request,and managing changes/cancellation. User explicitly rejected simple timer as the primaryqualitysample. Currentstage is dependencyimplementation,not a completeUI. Scope/references/phaseplan:../BRIEF.md,../DECOMPOSITION.md,../PLAN.md. Eighteenactual UI Bowl nativepreviews inspected;canonicalreceipts and per-imagehashes remainoutsideproductionassets. Upstream167fc8d matchedHEAD at fresh2026-10-16check.

Fixturecatalog is fictional and local;photographs are separatelylicensedgenericroomimages,not actualinventory/vendor endorsement. No livecharge,externalhotelreservation,vendorconfirmationorrefund is implemented orclaimed. Do not collectpaymentcarddata oradd unnecessarydemo/implementationnotices inproduct UI. Emptyuserrequests are confirmedonlyaftervalidstorage read;no seededrequest,review orfakeurgentinventory.

## Colors

Whitepage#FFFFFF. Darktext#222126,secondary#66616A,quietcontrols#F5F3F4. Chosen executiondarkrose#B51D51withwhiteforeground followsobserved restrainedphoto-led neutralinterface vsstrongexecutionrole;not anofficialsampledAirbnbtoken. Error#B42318distinctfromexecution;selectedneutraldarkstate +label/shape,notcoloralone. Photos retainowncolors. No globalgraycanvas ordecorativebar.

## Typography

ReuseexactlicensedlocalNotoSansKRvariablefont100–900;knownplatformnameNotoSansKRThin mustbeverifiedinactualbrowser. Page/sheettitle22/700/1.5;propertytitle18/600/1.5;price18/700/1.5;body16/500/1.5;controls16/600/1.5;secondary14/500/1.5;errors16/500/1.6. ExactrolesdeclaredbeforeUIgeneration. No400weight,manualbr,texttruncationofconditionsortransformshrink. Test296/320/390/1440,and200%text/textspacing.

## Layout

Mobilemax390ateverybrowserwidth,sameverticalinformationsequence. Resultsouterinset20chosenCSSpx;propertyphotofillsownarticlewidth,1:1 chosen ratio;eacharticleownsphoto/favoriteandverticalidentity/rating/secondaryfacts/pricewithinternal8/12spacing,nextproperty32. Search/date/guests/filterssitintheirsemanticcontrolsabovecontent;noadvertisinghero/categoryfillers/mapplaceholder. Detailhasrealbackwithdirectentryfallback;selectedproperty/room/rateandtripfactsarepreservedtoreview. Price,primaryactionandfavoritearenotcollapsedintoonecrowdedrow. Only3actualbottomdestinations:search,saved,requests. Noinertnavigationor inventeddesktopcolumn.

## Elevation & Depth

Sectionsgroupbytaskandspace;quietfieldorsummarysurfaceswhereobserved/useful,nouniversalnestedcards. Nohorizontaldecorativeseparators/tabunderlines. Modal/sheetbackgrounddimsactualcontext;onlycontentscrollwhenneeded. Inputwrapperownsvisibleinsetfocusring;forcedcolorsfallbackrequired;notdoubleinputoutlines. Functionalfieldedgesareallowed,nothrsubstitutes.

## Shapes

Chosenphoto/fields12/8radii,sheet16topcorners;purpose-specific,notallcapsules. PinnedofficialLucideSVGswithoriginalgeometry/license,normal20pxvisualslotand44pxorlargercontroltargets. Favoriteoverlayhasitsownquietroundsurfaceandexplicitpressedstate/name. Nohanddrawniconsorbrandlogo.

## Components

E-SEARCH/E-STAY/E-NAVarefirstcore;E-FILTER/E-DATE/E-ROOM/E-REVIEW/E-REQUESTfollowtypedstatecontracts. Calendarusesdate-onlyUTCvalidation,1–28nightsandexplicittoday;quoteusesintegerKRW/knownrateidentity. Search/filterdraftandpersistedrequestareseparate. Requestoutcomeisprimary;propertyfactsaresecondary. Loading/empty/invalid/pending/changed/cancelled/readfailure/writefailureandexplicitrecoverymustbereachedandrendered. Initialreadfailurecannotclaimemptyoroverwriteoriginaldata;writeretryretainsinput;returnnavigationpreservescontext.

## Do's and Don'ts

Preserveobservedphotodominance,metadatahierarchy,separateprice,selectioncontrols,explicitpolicies/total and truthfulrequeststatus. Readrelevantguidetextbeforeeachphaseandpassactualapplicableguides/typedbindings/nativeimagesforstylingtothemodel. Do notuse allguidefullbodiesorotherhelperimplementationtasksasambiguouswritablecontext. Keep rawfailures,inputversions,hostassistanceandactualsource/harnesshashes. Unitcounts,licensedassetpresenceorstaticcardsarenotcommercialquality. Corefirstsame-widthdirectcomparisonprecedesdependentflowexpansion;all75rules/eightguidesandrepresentativererunsremainrequired.


## First core styling input revision

The actual Airbnb main preview has a nearly square listing photo (visual estimate in image pixels,not recovered CSS). The initial4:3chosen ratio was a generic input and is corrected to1:1before the first localCSS generation. Earlierinput and rawcontroller bindings remain in pre-style-source/. Existing20pxpageinset tokens remain unchanged. Search destination16/600,trip/count metadata14/500,propertytitle18/600,price18/700,cardmetadata14/500,favorite/navlabels14/600,formlabels/buttons16/600. Alllineheights1.5excepterror1.6. Results has an accessible hiddenh1and actualsearchsummary;do not invent a visiblebranded/pageheader to fillspace. Native datepopup/customcalendar,readonlydetail/requestconsumer limitations remain unfinished. Hostcore/runtime/eventframes andactualQwenfunctions are separatelyattributed.
