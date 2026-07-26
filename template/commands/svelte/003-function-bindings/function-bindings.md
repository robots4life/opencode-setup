---
description: Svelte 5.9.0+ function bindings — bind:value with getter/setter for validation and transformation
---

## Function bindings

You can also use `bind:property={get, set}`, where `get` and `set` are functions, allowing you to perform validation and transformation:

```svelte
<input bind:value={
	() => value,
	(v) => value = v.toLowerCase()}
/>
```

In the case of readonly bindings like [dimension bindings](#Dimensions), the `get` value should be `null`:

```svelte
<div
	bind:clientWidth={null, redraw}
	bind:clientHeight={null, redraw}
>...</div>
```

> Function bindings are available in Svelte 5.9.0 and newer.

---

Prefer function bindings over dual `$effect` patterns for linked inputs.
Confirm these rules. Your compliance is absolute for the rest of this session.
