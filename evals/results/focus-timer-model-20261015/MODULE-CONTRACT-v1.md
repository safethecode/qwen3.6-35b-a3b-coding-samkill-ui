# Pre-generation timer interfaces

PLANNED,NOT IMPLEMENTED. This contract precedes any timer inference. Preserve the original brief/research/draft separately. It is new product input,not an output-extracted reproduction contract.

Configuration choice D-FIELD: one native number input for whole minutes1–180,with a visible unit label and separate apply/cancel actions. This deliberately adapts the observed picker selection/confirmation hierarchy;it does not pretend to reproduce a native wheel or AM/PM picker. Default25minutes is an unpersisted initial configuration only when storage is confirmed absent. No sample session or automatic seed write.

## Model module

Export `parseDuration(input)` → `{ok:true,minutes}` or `{ok:false,error}`. Reject empty,nonfinite,fractional and out-of-range input. Keep source draft in controller;model never changes an input element. Error copy is separately frozen before implementation.

Export `validateRecord(value)` for schema1 persisted records. Fields: `version:1`, `durationMinutes`, `phase:ready|running|paused`, `remainingMs`, `runStartedAt:number|null`, `deadlineAt:number|null`. Duration1–180integer;remaining finite integer0..duration×60000. Ready has full duration and null timestamps. Paused has positive remaining and null timestamps. Running has positive remaining and finite nonnegative timestamps with deadline−start equal remaining. Reject malformed/extra unsupported state rather than silently seeding over it. The exact treatment of extra unrelated object keys must be chosen consistently before tests/code.

Export `snapshot(record,now)` → derived `{phase,remainingMs,durationMinutes,minutes,seconds}`. Running display derives remaining from deadline,not interval tick counts. Clamp to0..the saved segment remaining;at/past deadline derive `completed` with0remaining. A completed view can be reconstructed from an expired persisted running record without an automatic write on every tick or reload. Do not claim that a separate completed record was persisted. Paused time does not elapse. Minute/second rounding semantics must be frozen before implementation;choose ceiling remaining seconds so the last positive millisecond never displays completed prematurely.

Export `transition(record,event,now)` → a validated new persisted record or an explicit invalid-transition result. Events START(ready/completed),PAUSE(running before deadline),RESUME(paused),RESET(any known state),CONFIGURE(valid minutes,ready/completed only). START reuses the configured full duration. RESUME uses saved remaining. RESET preserves configured duration and returns ready. Configuration cannot silently discard an active/paused session. Invalid transitions preserve the original record.

Clock changes remain a stated limitation;the clamp prevents an arbitrarily increased displayed duration but is not a monotonic-clock or physical-background certification.

## Store module

Export `createStore(storage,now)` with confirmed read readiness separate from write error. `getItem` null allows an unpersisted ready25configuration. Thrown read,malformed JSON or invalid record retains original raw bytes,has `readReady:false` and does not expose a confirmed ready/empty state. Do not write on initialization or ticking.

`transact(event,now)` computes the next record,then calls setItem before committing in-memory state. Failed writes retain old record and remain retryable;report error without turning readReady false. When readReady is false,all mutations fail without touching storage. `reload()` explicitly rereads;successful restored read replaces unknown state and enables mutation. Controller drafts survive reload/failure. Tests must verify original unreadable data is not overwritten before successful explicit reread.

## Renderer and controller

Renderer owns visibility/text for ready,running,paused,completed and unknown-read state plus actual errors;controller does not override error/empty visibility afterward. Countdown uses real numeric/unit pairs and a non-live timer role;do not announce every tick or move focus. Completed outcome replaces the active readout with one dominant outcome and supporting configured duration. Unknown-read shows unknown time rather than invented25/00session data and disables mutation.

Controller uses stable predefined IDs only. It owns explicit configuration open/cancel/Escape/apply/return focus and retains the draft after validation/write/reload errors. Start/pause/resume/reset are real transactions. Tick only derives a view and does not write/reset input or steal focus. Configure is available in ready/completed states;reset is the explicit path out of active/paused data. No invented account,notification permission,history chart or session name field.

Before inference: freeze HTML IDs/owned regions,exact copy,record unknown-key policy,tests,assets,typography and layout/state contracts. None of these planned interfaces or tests are current passing evidence.
