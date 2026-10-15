# Stable message contexts

`renderExclusiveMessage(contexts, selected, message, setters)` is a host-authored DOM primitive. It accepts unique context keys, existing region/content nodes, one selected key and a string message. Inject stable `setBool` and `setText` functions that write only when values differ.

Inactive regions hide before an active region appears. Inactive text is cleared, an empty message hides every region, and repeating an unchanged message produces no DOM writes. Invalid inputs throw before changing existing state.

```js
renderExclusiveMessage([
  { key: 'main', region: mainRegion, content: mainError },
  { key: 'config', region: configRegion, content: configError }
], selectedContext, message, { setBool, setText });
```

Product-specific state and copy projection belong outside this primitive. Record the copied runtime's hash when binding generated source. Unit tests and this primitive do not establish correct product behavior, native assistive-technology output or reference-level visual quality; actual consumer/state and visual checks remain required.
