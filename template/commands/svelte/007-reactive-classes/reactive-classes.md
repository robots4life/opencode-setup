---
description: Svelte 5 reactive classes — SvelteMap, SvelteSet, SvelteURL, SvelteDate, MediaQuery, createSubscriber, $state.eager, window reactivity
---

## `$state.eager`

When state changes, it may not be reflected in the UI immediately if it is used by an `await` expression, because [updates are synchronized](await-expressions#Synchronized-updates).

In some cases, you may want to update the UI as soon as the state changes. For example, you might want to update a navigation bar when the user clicks on a link, so that they get visual feedback while waiting for the new page to load. To do this, use `$state.eager(value)`:

```svelte
<nav>
	<a href="/" aria-current={$state.eager(pathname) === '/' ? 'page' : null}>home</a>
	<a href="/about" aria-current={$state.eager(pathname) === '/about' ? 'page' : null}>about</a>
</nav>
```

Use this feature sparingly, and only to provide feedback in response to user action — in general, allowing Svelte to coordinate updates will provide a better user experience.

## Destructuring

If you use destructuring with a `$derived` declaration, the resulting variables will all be reactive — this...

```js
function stuff() { return { a: 1, b: 2, c: 3 } }
// ---cut---
let { a, b, c } = $derived(stuff());
```

...is roughly equivalent to this:

```js
function stuff() { return { a: 1, b: 2, c: 3 } }
// ---cut---
let _stuff = $derived(stuff());
let a = $derived(_stuff.a);
let b = $derived(_stuff.b);
let c = $derived(_stuff.c);
```

## Update propagation

Svelte uses something called _push-pull reactivity_ — when state is updated, everything that depends on the state (whether directly or indirectly) is immediately notified of the change (the 'push'), but derived values are not re-evaluated until they are actually read (the 'pull').

If the new value of a derived is referentially identical to its previous value, downstream updates will be skipped. In other words, Svelte will only update the text inside the button when `large` changes, not when `count` changes, even though `large` depends on `count`:

```svelte
<script>
	let count = $state(0);
	let large = $derived(count > 10);
</script>

<button onclick={() => count++}>
	{large}
</button>
```

# class

There are two ways to set classes on elements: the `class` attribute, and the `class:` directive.

## Attributes

Primitive values are treated like any other attribute:

```svelte
<div class={large ? 'large' : 'small'}>...</div>
```

> For historical reasons, falsy values (like `false` and `NaN`) are stringified (`class="false"`), though `class={undefined}` (or `null`) cause the attribute to be omitted altogether. In a future version of Svelte, all falsy values will cause `class` to be omitted.

### Objects and arrays

Since Svelte 5.16, `class` can be an object or array, and is converted to a string using [clsx](https://github.com/lukeed/clsx).

If the value is an object, the truthy keys are added:

```svelte
<script>
	let { cool } = $props();
</script>

<!-- results in `class="cool"` if `cool` is truthy,
     `class="lame"` otherwise -->
<div class={{ cool, lame: !cool }}>...</div>
```

If the value is an array, the truthy values are combined:

```svelte
<!-- if `faded` and `large` are both truthy, results in
     `class="saturate-0 opacity-50 scale-200"` -->
<div class={[faded && 'saturate-0 opacity-50', large && 'scale-200']}>...</div>
```

Note that whether we're using the array or object form, we can set multiple classes simultaneously with a single condition, which is particularly useful if you're using things like Tailwind.

Arrays can contain arrays and objects, and clsx will flatten them. This is useful for combining local classes with props, for example:

```svelte
<!--- file: Button.svelte --->
<script>
	let props = $props();
</script>

<button {...props} class={['cool-button', props.class]}>
	{@render props.children?.()}
</button>
```

The user of this component has the same flexibility to use a mixture of objects, arrays and strings:

```svelte
<!--- file: App.svelte --->
<script>
	import Button from './Button.svelte';
	let useTailwind = $state(false);
</script>

<Button
	onclick={() => useTailwind = true}
	class={{ 'bg-blue-700 sm:w-1/2': useTailwind }}
>
	Accept the inevitability of Tailwind
</Button>
```

Since Svelte 5.19, Svelte also exposes the `ClassValue` type, which is the type of value that the `class` attribute on elements accept. This is useful if you want to use a type-safe class name in component props:

```svelte
<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	const props: { class: ClassValue } = $props();
</script>

<div class={['original', props.class]}>...</div>
```

## The `class:` directive

Prior to Svelte 5.16, the `class:` directive was the most convenient way to set classes on elements conditionally.

```svelte
<!-- These are equivalent -->
<div class={{ cool, lame: !cool }}>...</div>
<div class:cool={cool} class:lame={!cool}>...</div>
```

As with other directives, we can use a shorthand when the name of the class coincides with the value:

```svelte
<div class:cool class:lame={!cool}>...</div>
```

# svelte/reactivity/window

This module exports reactive versions of various `window` values, each of which has a reactive `current` property that you can reference in reactive contexts (templates, [deriveds]($derived) and [effects]($effect)) without using [`<svelte:window>`](svelte-window) bindings or manually creating your own event listeners.

```svelte
<script>
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
</script>

<p>{innerWidth.current}x{innerHeight.current}</p>
```



```js
// @noErrors
import {
	devicePixelRatio,
	innerHeight,
	innerWidth,
	online,
	outerHeight,
	outerWidth,
	screenLeft,
	screenTop,
	scrollX,
	scrollY
} from 'svelte/reactivity/window';
```

## devicePixelRatio

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`devicePixelRatio.current` is a reactive view of `window.devicePixelRatio`. On the server it is `undefined`.
Note that behaviour differs between browsers — on Chrome it will respond to the current zoom level,
on Firefox and Safari it won't.

<div class="ts-block">

```dts
const devicePixelRatio: {
	get current(): number | undefined;
};
```

</div>



## innerHeight

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`innerHeight.current` is a reactive view of `window.innerHeight`. On the server it is `undefined`.

<div class="ts-block">

```dts
const innerHeight: ReactiveValue<number | undefined>;
```

</div>



## innerWidth

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`innerWidth.current` is a reactive view of `window.innerWidth`. On the server it is `undefined`.

<div class="ts-block">

```dts
const innerWidth: ReactiveValue<number | undefined>;
```

</div>



## online

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`online.current` is a reactive view of `navigator.onLine`. On the server it is `undefined`.

<div class="ts-block">

```dts
const online: ReactiveValue<boolean | undefined>;
```

</div>



## outerHeight

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`outerHeight.current` is a reactive view of `window.outerHeight`. On the server it is `undefined`.

<div class="ts-block">

```dts
const outerHeight: ReactiveValue<number | undefined>;
```

</div>



## outerWidth

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`outerWidth.current` is a reactive view of `window.outerWidth`. On the server it is `undefined`.

<div class="ts-block">

```dts
const outerWidth: ReactiveValue<number | undefined>;
```

</div>



## screenLeft

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`screenLeft.current` is a reactive view of `window.screenLeft`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.

<div class="ts-block">

```dts
const screenLeft: ReactiveValue<number | undefined>;
```

</div>



## screenTop

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`screenTop.current` is a reactive view of `window.screenTop`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.

<div class="ts-block">

```dts
const screenTop: ReactiveValue<number | undefined>;
```

</div>



## scrollX

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`scrollX.current` is a reactive view of `window.scrollX`. On the server it is `undefined`.

<div class="ts-block">

```dts
const scrollX: ReactiveValue<number | undefined>;
```

</div>



## scrollY

<blockquote class="since note">

Available since 5.11.0

</blockquote>

`scrollY.current` is a reactive view of `window.scrollY`. On the server it is `undefined`.

<div class="ts-block">

```dts
const scrollY: ReactiveValue<number | undefined>;
```

</div>

## MediaQuery

<blockquote class="since note">

Available since 5.7.0

</blockquote>

Creates a media query and provides a `current` property that reflects whether or not it matches.

Use it carefully — during server-side rendering, there is no way to know what the correct value should be, potentially causing content to change upon hydration.
If you can use the media query in CSS to achieve the same effect, do that.

```svelte
<script>
	import { MediaQuery } from 'svelte/reactivity';

	const large = new MediaQuery('min-width: 800px');
</script>

<h1>{large.current ? 'large screen' : 'small screen'}</h1>
```

<div class="ts-block">

```dts
class MediaQuery extends ReactiveValue<boolean> {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(query: string, fallback?: boolean | undefined);
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `query` A media query string
- `fallback` Fallback value for the server

</div>

</div>
</div></div>



## SvelteDate

A reactive version of the built-in [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object.
Reading the date (whether with methods like `date.getTime()` or `date.toString()`, or via things like [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat))
in an [effect](/docs/svelte/$effect) or [derived](/docs/svelte/$derived)
will cause it to be re-evaluated when the value of the date changes.

```svelte
<script>
	import { SvelteDate } from 'svelte/reactivity';

	const date = new SvelteDate();

	const formatter = new Intl.DateTimeFormat(undefined, {
	  hour: 'numeric',
	  minute: 'numeric',
	  second: 'numeric'
	});

	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<p>The time is {formatter.format(date)}</p>
```

<div class="ts-block">

```dts
class SvelteDate extends Date {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(...params: any[]);
```

<div class="ts-block-property-details"></div>
</div></div>



## SvelteMap

A reactive version of the built-in [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object.
Reading contents of the map (by iterating, or by reading `map.size` or calling `map.get(...)` or `map.has(...)` as in the tic-tac-toe example below) in an [effect](/docs/svelte/$effect) or [derived](/docs/svelte/$derived)
will cause it to be re-evaluated as necessary when the map is updated.

Note that values in a reactive map are _not_ made [deeply reactive](/docs/svelte/$state#Deep-state).

```svelte
<script>
	import { SvelteMap } from 'svelte/reactivity';
	import { result } from './game.js';

	let board = new SvelteMap();
	let player = $state('x');
	let winner = $derived(result(board));

	function reset() {
		player = 'x';
		board.clear();
	}
</script>

<div class="board">
	{#each Array(9), i}
		<button
			disabled={board.has(i) || winner}
			onclick={() => {
				board.set(i, player);
				player = player === 'x' ? 'o' : 'x';
			}}
		>{board.get(i)}</button>
	{/each}
</div>

{#if winner}
	<p>{winner} wins!</p>
	<button onclick={reset}>reset</button>
{:else}
	<p>{player} is next</p>
{/if}
```

<div class="ts-block">

```dts
class SvelteMap<K, V> extends Map<K, V> {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(value?: Iterable<readonly [K, V]> | null | undefined);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
set(key: K, value: V): this;
```

<div class="ts-block-property-details"></div>
</div></div>



## SvelteSet

A reactive version of the built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) object.
Reading contents of the set (by iterating, or by reading `set.size` or calling `set.has(...)` as in the example below) in an [effect](/docs/svelte/$effect) or [derived](/docs/svelte/$derived)
will cause it to be re-evaluated as necessary when the set is updated.

Note that values in a reactive set are _not_ made [deeply reactive](/docs/svelte/$state#Deep-state).

```svelte
<script>
	import { SvelteSet } from 'svelte/reactivity';
	let monkeys = new SvelteSet();

	function toggle(monkey) {
		if (monkeys.has(monkey)) {
			monkeys.delete(monkey);
		} else {
			monkeys.add(monkey);
		}
	}
</script>

{#each ['🙈', '🙉', '🙊'] as monkey}
	<button onclick={() => toggle(monkey)}>{monkey}</button>
{/each}

<button onclick={() => monkeys.clear()}>clear</button>

{#if monkeys.has('🙈')}<p>see no evil</p>{/if}
{#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
{#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
```

<div class="ts-block">

```dts
class SvelteSet<T> extends Set<T> {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(value?: Iterable<T> | null | undefined);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
add(value: T): this;
```

<div class="ts-block-property-details"></div>
</div></div>



## SvelteURL

A reactive version of the built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) object.
Reading properties of the URL (such as `url.href` or `url.pathname`) in an [effect](/docs/svelte/$effect) or [derived](/docs/svelte/$derived)
will cause it to be re-evaluated as necessary when the URL changes.

The `searchParams` property is an instance of [SvelteURLSearchParams](/docs/svelte/svelte-reactivity#SvelteURLSearchParams).

Example:

```svelte
<script>
	import { SvelteURL } from 'svelte/reactivity';

	const url = new SvelteURL('https://example.com/path');
</script>

<!-- changes to these... -->
<input bind:value={url.protocol} />
<input bind:value={url.hostname} />
<input bind:value={url.pathname} />

<hr />

<!-- will update `href` and vice versa -->
<input bind:value={url.href} size="65" />
```

<div class="ts-block">

```dts
class SvelteURL extends URL {/*…*/}
```

<div class="ts-block-property">

```dts
get searchParams(): SvelteURLSearchParams;
```

<div class="ts-block-property-details"></div>
</div></div>



## SvelteURLSearchParams

A reactive version of the built-in [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object.
Reading its contents (by iterating, or by calling `params.get(...)` or `params.getAll(...)` as in the example below) in an [effect](/docs/svelte/$effect) or [derived](/docs/svelte/$derived)
will cause it to be re-evaluated as necessary when the params are updated.

```svelte
<script>
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const params = new SvelteURLSearchParams('message=hello');

	let key = $state('key');
	let value = $state('value');
</script>

<input bind:value={key} />
<input bind:value={value} />
<button onclick={() => params.append(key, value)}>append</button>

<p>?{params.toString()}</p>

{#each params as [key, value]}
	<p>{key}: {value}</p>
{/each}
```

<div class="ts-block">

```dts
class SvelteURLSearchParams extends URLSearchParams {/*…*/}
```

<div class="ts-block-property">

```dts
[REPLACE](params: URLSearchParams): void;
```

<div class="ts-block-property-details"></div>
</div></div>



## createSubscriber

<blockquote class="since note">

Available since 5.7.0

</blockquote>

Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.

If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.

If `start` returns a cleanup function, it will be called when the effect is destroyed.

If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
are active, and the returned teardown function will only be called when all effects are destroyed.

It's best understood with an example. Here's an implementation of [`MediaQuery`](/docs/svelte/svelte-reactivity#MediaQuery):

```js
// @errors: 7031
import { createSubscriber } from 'svelte/reactivity';
import { on } from 'svelte/events';

export class MediaQuery {
	#query;
	#subscribe;

	constructor(query) {
		this.#query = window.matchMedia(`(${query})`);

		this.#subscribe = createSubscriber((update) => {
			// when the `change` event occurs, re-run any effects that read `this.current`
			const off = on(this.#query, 'change', update);

			// stop listening when all the effects are destroyed
			return () => off();
		});
	}

	get current() {
		// This makes the getter reactive, if read in an effect
		this.#subscribe();

		// Return the current state of the query, whether or not we're in an effect
		return this.#query.matches;
	}
}
```

<div class="ts-block">

```dts
function createSubscriber(
	start: (update: () => void) => (() => void) | void
): () => void;
```

</div>

Confirm these patterns. Prefer reactive built-in classes ($state.eager, SvelteMap, SvelteSet, etc.) for all new Svelte 5 code. Your compliance is absolute for the rest of this session.
