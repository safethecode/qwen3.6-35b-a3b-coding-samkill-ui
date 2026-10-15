# Local booking request dependencies

Self-contained, source-bound dependency snapshot for the unfinished mobile accommodation study. These modules do not book a supplier, charge money or certify UI quality.

With Node22 or later, run from this directory:

```sh
npm test
```

No npm packages or model server are needed for these deterministic checks. Results go to the ignored check-results directory. To choose another output directory, use node checks/run.mjs PATH.

| Dependency | Scope | Actual groups |
| --- | --- | --- |
| stored-quote | Complete historical quote,strict identity/date/amount relationships,no current-catalogue repricing |10/10|
| request-store | Exact records,canonical times,revisions,unique identities and operation history |12/12|
| request-reducer | Immutable create/update/cancel,strict commands,idempotent retry and capacity limits |15/15|
| request-storage | Read-before-write,explicit unknown-read recovery,acknowledgement verification and revision conflict |7/7|

The validators/reducer are actual local Qwen outputs with preserved bounded repairs. The host supplies frozen contracts,tests,typed-key/controlflow assembly and the storage coordinator. Dates are an unchanged accepted earlier local module. Source files match the accepted dependency-byte receipt. These are supervised results,not independent skill compliance or an all-Qwen product.

Original failures remain preserved: the quote validator initially passed9/10, the request-store validator11/12 and the first reducer9/13. Bounded local repairs corrected the observed failures. The reducer validates payloads before recognizing a repeated operation and preserves other record identities. The host coordinator requires a confirmed initial read, reads again under the supplied lock and preserves denied or malformed storage. Callers provide a storage/lock adapter; the connected browser UI is a separate unfinished stage.

Connected browser scenarios, visual styles, request editing, the calendar, full catalog/guide coverage and representative reference comparisons require separate evidence. Passing44dependency groups does not approve those areas. Source files contain no comments or personal PC paths.
