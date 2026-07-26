---
name: svelte-motion-transitions
description: Svelte motion (Spring, Tween, prefersReducedMotion) and transitions (fade, fly, slide, blur, draw, scale, crossfade), custom transitions, in:/out:, animate:, easing
---

# svelte/motion

```js
// @noErrors
import {
	Spring,
	Tween,
	prefersReducedMotion,
	spring,
	tweened
} from 'svelte/motion';
```

## Spring

<blockquote class="since note">

Available since 5.8.0

</blockquote>

A wrapper for a value that behaves in a spring-like fashion. Changes to `spring.target` will cause `spring.current` to
move towards it over time, taking account of the `spring.stiffness` and `spring.damping` parameters.

```svelte
<script>
	import { Spring } from 'svelte/motion';

	const spring = new Spring(0);
</script>

<input type="range" bind:value={spring.target} />
<input type="range" bind:value={spring.current} disabled />
```

<div class="ts-block">

```dts
class Spring<T> {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(value: T, options?: SpringOptions);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
static of<U>(fn: () => U, options?: SpringOptions): Spring<U>;
```

<div class="ts-block-property-details">

Create a spring whose value is bound to the return value of `fn`. This must be called
inside an effect root (for example, during component initialisation).

```svelte
<script>
	import { Spring } from 'svelte/motion';

	let { number } = $props();

	const spring = Spring.of(() => number);
</script>
```

</div>
</div>

<div class="ts-block-property">

```dts
set(value: T, options?: SpringUpdateOptions): Promise<void>;
```

<div class="ts-block-property-details">

Sets `spring.target` to `value` and returns a `Promise` that resolves if and when `spring.current` catches up to it.

If `options.instant` is `true`, `spring.current` immediately matches `spring.target`.

If `options.preserveMomentum` is provided, the spring will continue on its current trajectory for
the specified number of milliseconds. This is useful for things like 'fling' gestures.

</div>
</div>

<div class="ts-block-property">

```dts
damping: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
precision: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
stiffness: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
target: T;
```

<div class="ts-block-property-details">

The end value of the spring.
This property only exists on the `Spring` class, not the legacy `spring` store.

</div>
</div>

<div class="ts-block-property">

```dts
get current(): T;
```

<div class="ts-block-property-details">

The current value of the spring.
This property only exists on the `Spring` class, not the legacy `spring` store.

</div>
</div></div>



## Tween

<blockquote class="since note">

Available since 5.8.0

</blockquote>

A wrapper for a value that tweens smoothly to its target value. Changes to `tween.target` will cause `tween.current` to
move towards it over time, taking account of the `delay`, `duration` and `easing` options.

```svelte
<script>
	import { Tween } from 'svelte/motion';

	const tween = new Tween(0);
</script>

<input type="range" bind:value={tween.target} />
<input type="range" bind:value={tween.current} disabled />
```

<div class="ts-block">

```dts
class Tween<T> {/*…*/}
```

<div class="ts-block-property">

```dts
static of<U>(fn: () => U, options?: TweenOptions<U> | undefined): Tween<U>;
```

<div class="ts-block-property-details">

Create a tween whose value is bound to the return value of `fn`. This must be called
inside an effect root (for example, during component initialisation).

```svelte
<script>
	import { Tween } from 'svelte/motion';

	let { number } = $props();

	const tween = Tween.of(() => number);
</script>
```

</div>
</div>

<div class="ts-block-property">

```dts
constructor(value: T, options?: TweenOptions<T>);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
set(value: T, options?: TweenOptions<T> | undefined): Promise<void>;
```

<div class="ts-block-property-details">

Sets `tween.target` to `value` and returns a `Promise` that resolves if and when `tween.current` catches up to it.

If `options` are provided, they will override the tween's defaults.

</div>
</div>

<div class="ts-block-property">

```dts
get current(): T;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
set target(v: T);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
get target(): T;
```

<div class="ts-block-property-details"></div>
</div></div>



## prefersReducedMotion

<blockquote class="since note">

Available since 5.7.0

</blockquote>

A [media query](/docs/svelte/svelte-reactivity#MediaQuery) that matches if the user [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

```svelte
<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';

	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>
	toggle
</button>

{#if visible}
	<p transition:fly={{ y: prefersReducedMotion.current ? 0 : 200 }}>
		flies in, unless the user prefers reduced motion
	</p>
{/if}
```

<div class="ts-block">

```dts
const prefersReducedMotion: MediaQuery;
```

</div>



## spring

<blockquote class="tag deprecated note">

Use [`Spring`](/docs/svelte/svelte-motion#Spring) instead

</blockquote>

The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.

<div class="ts-block">

```dts
function spring<T = any>(
	value?: T | undefined,
	opts?: SpringOptions | undefined
): Spring<T>;
```

</div>



## tweened

<blockquote class="tag deprecated note">

Use [`Tween`](/docs/svelte/svelte-motion#Tween) instead

</blockquote>

A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.

<div class="ts-block">

```dts
function tweened<T>(
	value?: T | undefined,
	defaults?: TweenOptions<T> | undefined
): Tweened<T>;
```

</div>



## Spring

<div class="ts-block">

```dts
interface Spring<T> extends Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
set(new_value: T, opts?: SpringUpdateOptions): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
update: (fn: Updater<T>, opts?: SpringUpdateOptions) => Promise<void>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Only exists on the legacy `spring` store, not the `Spring` class

</div>

</div>
</div>

<div class="ts-block-property">

```dts
subscribe(fn: (value: T) => void): Unsubscriber;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Only exists on the legacy `spring` store, not the `Spring` class

</div>

</div>
</div>

<div class="ts-block-property">

```dts
precision: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
damping: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
stiffness: number;
```

<div class="ts-block-property-details"></div>
</div></div>

## SpringOptions

<div class="ts-block">

```dts
interface SpringOptions {/*…*/}
```

<div class="ts-block-property">

```dts
stiffness?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
damping?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
precision?: number;
```

<div class="ts-block-property-details"></div>
</div></div>

## SpringUpdateOptions

<div class="ts-block">

```dts
interface SpringUpdateOptions {/*…*/}
```

<div class="ts-block-property">

```dts
hard?: any;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Only use this for the spring store; does nothing when set on the Spring class

</div>

</div>
</div>

<div class="ts-block-property">

```dts
soft?: string | number | boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Only use this for the spring store; does nothing when set on the Spring class

</div>

</div>
</div>

<div class="ts-block-property">

```dts
instant?: boolean;
```

<div class="ts-block-property-details">

Only use this for the Spring class; does nothing when set on the spring store

</div>
</div>

<div class="ts-block-property">

```dts
preserveMomentum?: number;
```

<div class="ts-block-property-details">

Only use this for the Spring class; does nothing when set on the spring store

</div>
</div></div>

## TweenOptions

<div class="ts-block">

```dts
interface TweenOptions<T> {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number | ((from: T, to: T) => number);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: (t: number) => number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
interpolate?: (a: T, b: T) => (t: number) => T;
```

<div class="ts-block-property-details"></div>
</div></div>

## Tweened

<div class="ts-block">

```dts
interface Tweened<T> extends Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
set(value: T, opts?: TweenOptions<T>): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
update(updater: Updater<T>, opts?: TweenOptions<T>): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div></div>

## Updater

<div class="ts-block">

```dts
type Updater<T> = (target_value: T, value: T) => T;
```

</div>

# svelte/easing

```js
// @noErrors
import {
	backIn,
	backInOut,
	backOut,
	bounceIn,
	bounceInOut,
	bounceOut,
	circIn,
	circInOut,
	circOut,
	cubicIn,
	cubicInOut,
	cubicOut,
	elasticIn,
	elasticInOut,
	elasticOut,
	expoIn,
	expoInOut,
	expoOut,
	linear,
	quadIn,
	quadInOut,
	quadOut,
	quartIn,
	quartInOut,
	quartOut,
	quintIn,
	quintInOut,
	quintOut,
	sineIn,
	sineInOut,
	sineOut
} from 'svelte/easing';
```

## backIn

<div class="ts-block">

```dts
function backIn(t: number): number;
```

</div>



## backInOut

<div class="ts-block">

```dts
function backInOut(t: number): number;
```

</div>



## backOut

<div class="ts-block">

```dts
function backOut(t: number): number;
```

</div>



## bounceIn

<div class="ts-block">

```dts
function bounceIn(t: number): number;
```

</div>



## bounceInOut

<div class="ts-block">

```dts
function bounceInOut(t: number): number;
```

</div>



## bounceOut

<div class="ts-block">

```dts
function bounceOut(t: number): number;
```

</div>



## circIn

<div class="ts-block">

```dts
function circIn(t: number): number;
```

</div>



## circInOut

<div class="ts-block">

```dts
function circInOut(t: number): number;
```

</div>



## circOut

<div class="ts-block">

```dts
function circOut(t: number): number;
```

</div>



## cubicIn

<div class="ts-block">

```dts
function cubicIn(t: number): number;
```

</div>



## cubicInOut

<div class="ts-block">

```dts
function cubicInOut(t: number): number;
```

</div>



## cubicOut

<div class="ts-block">

```dts
function cubicOut(t: number): number;
```

</div>



## elasticIn

<div class="ts-block">

```dts
function elasticIn(t: number): number;
```

</div>



## elasticInOut

<div class="ts-block">

```dts
function elasticInOut(t: number): number;
```

</div>



## elasticOut

<div class="ts-block">

```dts
function elasticOut(t: number): number;
```

</div>



## expoIn

<div class="ts-block">

```dts
function expoIn(t: number): number;
```

</div>



## expoInOut

<div class="ts-block">

```dts
function expoInOut(t: number): number;
```

</div>



## expoOut

<div class="ts-block">

```dts
function expoOut(t: number): number;
```

</div>



## linear

<div class="ts-block">

```dts
function linear(t: number): number;
```

</div>



## quadIn

<div class="ts-block">

```dts
function quadIn(t: number): number;
```

</div>



## quadInOut

<div class="ts-block">

```dts
function quadInOut(t: number): number;
```

</div>



## quadOut

<div class="ts-block">

```dts
function quadOut(t: number): number;
```

</div>



## quartIn

<div class="ts-block">

```dts
function quartIn(t: number): number;
```

</div>



## quartInOut

<div class="ts-block">

```dts
function quartInOut(t: number): number;
```

</div>



## quartOut

<div class="ts-block">

```dts
function quartOut(t: number): number;
```

</div>



## quintIn

<div class="ts-block">

```dts
function quintIn(t: number): number;
```

</div>



## quintInOut

<div class="ts-block">

```dts
function quintInOut(t: number): number;
```

</div>



## quintOut

<div class="ts-block">

```dts
function quintOut(t: number): number;
```

</div>



## sineIn

<div class="ts-block">

```dts
function sineIn(t: number): number;
```

</div>



## sineInOut

<div class="ts-block">

```dts
function sineInOut(t: number): number;
```

</div>



## sineOut

<div class="ts-block">

```dts
function sineOut(t: number): number;
```

</div>

# transition:

A _transition_ is triggered by an element entering or leaving the DOM as a result of a state change.

When a block (such as an `{#if ...}` block) is transitioning out, all elements inside it, including those that do not have their own transitions, are kept in the DOM until every transition in the block has been completed.

The `transition:` directive indicates a _bidirectional_ transition, which means it can be smoothly reversed while the transition is in progress.

```svelte
<script>
	import { fade } from 'svelte/transition';

	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>toggle</button>

{#if visible}
	<div transition:fade>fades in and out</div>
{/if}
```

## Local vs global

Transitions are local by default. Local transitions only play when the block they belong to is created or destroyed, _not_ when parent blocks are created or destroyed.

```svelte
{#if x}
	{#if y}
		<p transition:fade>fades in and out only when y changes</p>

		<p transition:fade|global>fades in and out when x or y change</p>
	{/if}
{/if}
```

## Built-in transitions

A selection of built-in transitions can be imported from the [`svelte/transition`](svelte-transition) module.

## Transition parameters

Transitions can have parameters.

(The double `{{curlies}}` aren't a special syntax; this is an object literal inside an expression tag.)

```svelte
{#if visible}
	<div transition:fade={{ duration: 2000 }}>fades in and out over two seconds</div>
{/if}
```

## Custom transition functions

```js
/// copy: false
// @noErrors
transition = (node: HTMLElement, params: any, options: { direction: 'in' | 'out' | 'both' }) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

Transitions can use custom functions. If the returned object has a `css` function, Svelte will generate keyframes for a [web animation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).

The `t` argument passed to `css` is a value between `0` and `1` after the `easing` function has been applied. _In_ transitions run from `0` to `1`, _out_ transitions run from `1` to `0` — in other words, `1` is the element's natural state, as though no transition had been applied. The `u` argument is equal to `1 - t`.

The function is called repeatedly _before_ the transition begins, with different `t` and `u` arguments.

```svelte
<!--- file: App.svelte --->
<script>
	import { elasticOut } from 'svelte/easing';

	/** @type {boolean} */
	export let visible;

	/**
	 * @param {HTMLElement} node
	 * @param {{ delay?: number, duration?: number, easing?: (t: number) => number }} params
	 */
	function whoosh(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`
		};
	}
</script>

{#if visible}
	<div in:whoosh>whooshes in</div>
{/if}
```

A custom transition function can also return a `tick` function, which is called _during_ the transition with the same `t` and `u` arguments.


```svelte
<!--- file: App.svelte --->
<script>
	export let visible = false;

	/**
	 * @param {HTMLElement} node
	 * @param {{ speed?: number }} params
	 */
	function typewriter(node, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#if visible}
	<p in:typewriter={{ speed: 1 }}>The quick brown fox jumps over the lazy dog</p>
{/if}
```

If a transition returns a function instead of a transition object, the function will be called in the next microtask. This allows multiple transitions to coordinate, making [crossfade effects](/tutorial/deferred-transitions) possible.

Transition functions also receive a third argument, `options`, which contains information about the transition.

Available values in the `options` object are:

- `direction` - one of `in`, `out`, or `both` depending on the type of transition

## Transition events

An element with transitions will dispatch the following events in addition to any standard DOM events:

- `introstart`
- `introend`
- `outrostart`
- `outroend`

```svelte
{#if visible}
	<p
		transition:fly={{ y: 200, duration: 2000 }}
		onintrostart={() => (status = 'intro started')}
		onoutrostart={() => (status = 'outro started')}
		onintroend={() => (status = 'intro ended')}
		onoutroend={() => (status = 'outro ended')}
	>
		Flies in and out
	</p>
{/if}
```

# in: and out:

The `in:` and `out:` directives are identical to [`transition:`](transition), except that the resulting transitions are not bidirectional — an `in` transition will continue to 'play' alongside the `out` transition, rather than reversing, if the block is outroed while the transition is in progress. If an out transition is aborted, transitions will restart from scratch.

```svelte
<script>
  import { fade, fly } from 'svelte/transition';

  let visible = $state(false);
</script>

<label>
  <input type="checkbox" bind:checked={visible}>
  visible
</label>

{#if visible}
	<div in:fly={{ y: 200 }} out:fade>flies in, fades out</div>
{/if}
```

# animate:

An animation is triggered when the contents of a [keyed each block](each#Keyed-each-blocks) are re-ordered. Animations do not run when an element is added or removed, only when the index of an existing data item within the each block changes. Animate directives must be on an element that is an _immediate_ child of a keyed each block.

Animations can be used with Svelte's [built-in animation functions](svelte-animate) or [custom animation functions](#Custom-animation-functions).

```svelte
<!-- When `list` is reordered the animation will run -->
{#each list as item, index (item)}
	<li animate:flip>{item}</li>
{/each}
```

## Animation Parameters

As with actions and transitions, animations can have parameters.

(The double `{{curlies}}` aren't a special syntax; this is an object literal inside an expression tag.)

```svelte
{#each list as item, index (item)}
	<li animate:flip={{ delay: 500 }}>{item}</li>
{/each}
```

## Custom animation functions

```js
/// copy: false
// @noErrors
animation = (node: HTMLElement, { from: DOMRect, to: DOMRect } , params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

Animations can use custom functions that provide the `node`, an `animation` object and any `parameters` as arguments. The `animation` parameter is an object containing `from` and `to` properties each containing a [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect#Properties) describing the geometry of the element in its `start` and `end` positions. The `from` property is the DOMRect of the element in its starting position, and the `to` property is the DOMRect of the element in its final position after the list has been reordered and the DOM updated.

If the returned object has a `css` method, Svelte will create a [web animation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) that plays on the element.

The `t` argument passed to `css` is a value that goes from `0` and `1` after the `easing` function has been applied. The `u` argument is equal to `1 - t`.

The function is called repeatedly _before_ the animation begins, with different `t` and `u` arguments.

<!-- TODO: Types -->

```svelte
<!--- file: App.svelte --->
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			css: (t, u) => `transform: translate(${u * dx}px, ${u * dy}px) rotate(${t * 360}deg);`
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

A custom animation function can also return a `tick` function, which is called _during_ the animation with the same `t` and `u` arguments.


```svelte
<!--- file: App.svelte --->
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			tick: (t, u) => Object.assign(node.style, { color: t > 0.5 ? 'Pink' : 'Blue' })
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

# svelte/transition

```js
// @noErrors
import {
	blur,
	crossfade,
	draw,
	fade,
	fly,
	scale,
	slide
} from 'svelte/transition';
```

## blur

Animates a `blur` filter alongside an element's opacity.

<div class="ts-block">

```dts
function blur(
	node: Element,
	{
		delay,
		duration,
		easing,
		amount,
		opacity
	}?: BlurParams | undefined
): TransitionConfig;
```

</div>



## crossfade

The `crossfade` function creates a pair of [transitions](/docs/svelte/transition) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.

<div class="ts-block">

```dts
function crossfade({
	fallback,
	...defaults
}: CrossfadeParams & {
	fallback?: (
		node: Element,
		params: CrossfadeParams,
		intro: boolean
	) => TransitionConfig;
}): [
	(
		node: any,
		params: CrossfadeParams & {
			key: any;
		}
	) => () => TransitionConfig,
	(
		node: any,
		params: CrossfadeParams & {
			key: any;
		}
	) => () => TransitionConfig
];
```

</div>



## draw

Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.

<div class="ts-block">

```dts
function draw(
	node: SVGElement & {
		getTotalLength(): number;
	},
	{
		delay,
		speed,
		duration,
		easing
	}?: DrawParams | undefined
): TransitionConfig;
```

</div>



## fade

Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.

<div class="ts-block">

```dts
function fade(
	node: Element,
	{ delay, duration, easing }?: FadeParams | undefined
): TransitionConfig;
```

</div>



## fly

Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.

<div class="ts-block">

```dts
function fly(
	node: Element,
	{
		delay,
		duration,
		easing,
		x,
		y,
		opacity
	}?: FlyParams | undefined
): TransitionConfig;
```

</div>



## scale

Animates the opacity and scale of an element. `in` transitions animate from the provided values, passed as parameters, to an element's current (default) values. `out` transitions animate from an element's default values to the provided values.

<div class="ts-block">

```dts
function scale(
	node: Element,
	{
		delay,
		duration,
		easing,
		start,
		opacity
	}?: ScaleParams | undefined
): TransitionConfig;
```

</div>



## slide

Slides an element in and out.

<div class="ts-block">

```dts
function slide(
	node: Element,
	{
		delay,
		duration,
		easing,
		axis
	}?: SlideParams | undefined
): TransitionConfig;
```

</div>



## BlurParams

<div class="ts-block">

```dts
interface BlurParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
amount?: number | string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
opacity?: number;
```

<div class="ts-block-property-details"></div>
</div></div>

## CrossfadeParams

<div class="ts-block">

```dts
interface CrossfadeParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number | ((len: number) => number);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div></div>

## DrawParams

<div class="ts-block">

```dts
interface DrawParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
speed?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number | ((len: number) => number);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div></div>

## EasingFunction

<div class="ts-block">

```dts
type EasingFunction = (t: number) => number;
```

</div>

## FadeParams

<div class="ts-block">

```dts
interface FadeParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div></div>

## FlyParams

<div class="ts-block">

```dts
interface FlyParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
x?: number | string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
y?: number | string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
opacity?: number;
```

<div class="ts-block-property-details"></div>
</div></div>

## ScaleParams

<div class="ts-block">

```dts
interface ScaleParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
start?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
opacity?: number;
```

<div class="ts-block-property-details"></div>
</div></div>

## SlideParams

<div class="ts-block">

```dts
interface SlideParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
axis?: 'x' | 'y';
```

<div class="ts-block-property-details"></div>
</div></div>

## TransitionConfig

<div class="ts-block">

```dts
interface TransitionConfig {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
css?: (t: number, u: number) => string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
tick?: (t: number, u: number) => void;
```

<div class="ts-block-property-details"></div>
</div></div>

---

**Compliance:** Prefer Spring/Tween classes over legacy spring()/tweened() stores. Use prefersReducedMotion for accessibility. Use @attach instead of use:action for element behaviors. Your compliance is absolute for the rest of this session.
