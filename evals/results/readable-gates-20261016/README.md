# Readable token and mode coverage gates

Status: verified mechanical gate changes; **not reference/commercial UI approval**. Code commits:5ccbb6c(readable tokens),2ad0237(mode scope).

The original overflow-only inspection could miss fragmented dates and currency units. The new rule measures actual uniform text ranges and intrinsic text against a declared semantic owner. Whole tokens that fit that owner must remain on one line. Intrinsically wider tokens remain UNVERIFIED. Actual clipping/transparent paint fail;unsupported painted/pseudo states remain UNVERIFIED. This does not certify contrast,semantic date/price correctness,devicezoom or fullvisualquality.

Independent read-only Chrome review found real false-PASS counterexamples before publication:painted clips/invisibility,numeric extraction narrowed to trailing digits,and stale/missing actual typography metrics. Those3classes produced3failed groups out of9 in readable-token-review-red.log. A further ancestor-pseudo omission produced9/10passes in readable-token-ancestor-red.log. Their regression groups now pass. Original failures are retained;private host paths in stack traces were redacted with hash receipts. Generated log whitespace is preserved and excluded from source whitespace lint through this artifact's local attributes;source files are not exempted.

Mode scope keeps native normal-layout relations mandatory without pretending enlarged/spacing text has identical geometry. Missing captures,invalid scopes and failed prior observations remain failed/unknown. The initial mode implementation test was2/4;the accepted mode tests are4/4.

Fresh full suites:161/161after reviewed token changes;165/165after mode changes,zero skipped/cancelled. The latter log is layout-mode-full-tests.log. Ten readable-token groups and4mode groups are part of that suite. These counts prove only their declared mechanical behavior. B3candidate visual/connected workflow evidence remains separate and unfinished.

The installed managed skill reference was updated from its verified7a9d2c0version,with a private backup and all50managed file hashes checked. See installed-skill.json. Existing sessions need new context to receive the new documentation;no automatic model compliance is claimed.
