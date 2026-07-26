---
description: Svelte async loading states — $effect.pending(), settled(), tick() for granular loading UI
---

## Indicating loading states

To render placeholder UI, you can wrap content in a `<svelte:boundary>` with a [`pending`](svelte-boundary#Properties-pending) snippet. This will be shown when the boundary is first created, but not for subsequent updates, which are globally coordinated.

After the contents of a boundary have resolved for the first time and have replaced the `pending` snippet, you can detect subsequent async work with [`$effect.pending()`]($effect#$effect.pending). This is what you would use to display a "we're asynchronously validating your input" spinner next to a form field, for example.

You can also use [`settled()`](svelte#settled) to get a promise that resolves when the current update is complete:

```js
let color = "red";
let answer = -1;
let updating = false;
// ---cut---
import { tick, settled } from "svelte";

async function onclick() {
  updating = true;

  // without this, the change to `updating` will be
  // grouped with the other changes, meaning it
  // won't be reflected in the UI
  await tick();

  color = "octarine";
  answer = 42;

  await settled();

  // any updates affected by `color` or `answer`
  // have now been applied
  updating = false;
}
```

---

Prefer `$effect.pending()` and `settled()` over raw `{#await}` blocks
for fine-grained loading state management. Use `<svelte:boundary>` with
a `pending` snippet for initial loading UI.
Confirm these rules. Your compliance is absolute for the rest of this session.
