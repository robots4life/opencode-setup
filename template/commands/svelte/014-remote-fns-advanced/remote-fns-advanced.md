---
name: sveltekit-remote-fns-advanced
description: Advanced SvelteKit remote functions — query.batch, query.live, form fields API (.fields, .as(), .issues(), .value()), single-flight mutations, server-driven refreshes, client-requested refreshes, invalid()
---

# Remote functions

## query.batch

`query.batch` works like `query` except that it batches requests that happen within the same macrotask. This solves the so-called n+1 problem: rather than each query resulting in a separate database call (for example), simultaneous queries are grouped together.

On the server, the callback receives an array of the arguments the function was called with. It must return a function of the form `(input: Input, index: number) => Output`. SvelteKit will then call this with each of the input arguments to resolve the individual calls with their results.

```js
/// file: weather.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getWeather = query.batch(v.string(), async (cityIds) => {
	const weather = await db.sql`
		SELECT * FROM weather
		WHERE city_id = ANY(${cityIds})
	`;
	const lookup = new Map(weather.map(w => [w.city_id, w]));

	return (cityId) => lookup.get(cityId);
});
```

```svelte
<!--- file: Weather.svelte --->
<script>
	import CityWeather from './CityWeather.svelte';
	import { getWeather } from './weather.remote';

	let { cities } = $props();
	let limit = $state(5);
</script>

<h2>Weather</h2>

{#each cities.slice(0, limit) as city}
	<h3>{city.name}</h3>
	<CityWeather weather={await getWeather(city.id)} />
{/each}

{#if cities.length > limit}
	<button onclick={() => limit += 5}>
		Load more
	</button>
{/if}
```

## query.live

`query.live` is for accessing real-time data from the server. It behaves similarly to `query`, but the callback — typically an async [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function*) — returns an `AsyncIterable`:

```js
import { query } from '$app/server';

export const getTime = query.live(async function* () {
	while (true) {
		yield new Date();
		await new Promise((f) => setTimeout(f, 1000));
	}
});
```

During server-side rendering, `await getTime()` returns the first yielded value then closes the iterator. This initial value is serialized and reused during hydration.

On the client, the query stays connected while it's actively used in a component. Multiple instances share a connection. When there are no active uses left, the stream disconnects and server-side iteration is stopped.

Live queries expose a `connected` property and `reconnect()` method:

```svelte
<script>
	import { getTime } from './time.remote.js';

	const time = getTime();
</script>

<p>{await time}</p>
<p>connected: {time.connected}</p>
<button onclick={() => time.reconnect()}>Reconnect</button>
```

If the connection drops, `connected` becomes `false`. SvelteKit will attempt to reconnect passively, with exponential backoff, and actively if `navigator.onLine` goes from `false` to `true`.

Unlike `query`, live queries do not have a `refresh()` method, as they are self-updating.

If you need direct, imperative access to the underlying stream of values (rather than the reactive `current` property), live query instances are themselves [async-iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). You can `for await` over the instance directly:

```js
// @filename: time.remote.ts
import { RemoteLiveQueryFunction } from '@sveltejs/kit';
export declare const getTime: RemoteLiveQueryFunction<undefined, Date>;
// @errors: 2304
// @filename: index.js
import { getTime } from './time.remote.js';
// ---cut---
async function logTimes() {
	for await (const value of getTime()) {
		console.log(value);
		if (someCondition) break;
	}
}
```

Multiple consumers of the same live query (whether reactive — via `await` or `current` — or imperative `for await` loops) share a single underlying connection. The first value yielded to a `for await` iterator is the most-recently-received value, if one is already available, mirroring the semantics of awaiting the resource directly. Subsequent yields fire whenever a new value arrives from the server. If values arrive faster than the consumer drains the iterator, only the latest pending value is kept — live streams are not event logs.

On the server, `for await` likewise joins a per-request shared iteration of the underlying generator, so concurrent consumers within the same request don't run the user-defined generator multiple times.


## form

The `form` function makes it easy to write data to the server. It takes a callback that receives `data` constructed from the submitted [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)...

```ts
/// file: src/routes/blog/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}

declare module '$lib/server/auth' {
	interface User {
		name: string;
	}

	/**
	 * Gets a user's info from their cookies, using `getRequestEvent`
	 */
	export function getUser(): Promise<User | null>;
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { query, form } from '$app/server';
import * as db from '$lib/server/database';
import * as auth from '$lib/server/auth';

export const getPosts = query(async () => { /* ... */ });

export const getPost = query(v.string(), async (slug) => { /* ... */ });

export const createPost = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content:v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ title, content }) => {
		// Check the user is logged in
		const user = await auth.getUser();
		if (!user) error(401, 'Unauthorized');

		const slug = title.toLowerCase().replace(/ /g, '-');

		// Insert into the database
		await db.sql`
			INSERT INTO post (slug, title, content)
			VALUES (${slug}, ${title}, ${content})
		`;

		// Redirect to the newly created page
		redirect(303, `/blog/${slug}`);
	}
);
```

...and returns an object that can be spread onto a `<form>` element. The callback is called whenever the form is submitted.

```svelte
<!--- file: src/routes/blog/new/+page.svelte --->
<script>
	import { createPost } from '../data.remote';
</script>

<h1>Create a new post</h1>

<form {...createPost}>
	<!-- form content goes here -->

	<button>Publish!</button>
</form>
```

The form object contains `method` and `action` properties that allow it to work without JavaScript (i.e. it submits data and reloads the page). It also has an [attachment](/docs/svelte/@attach) that progressively enhances the form when JavaScript is available, submitting data *without* reloading the entire page.

As with `query`, if the callback uses the submitted `data`, it should be [validated](#query-Query-arguments) by passing a [Standard Schema](https://standardschema.dev) as the first argument to `form`.

### Fields

A form is composed of a set of _fields_, which are defined by the schema. In the case of `createPost`, we have two fields, `title` and `content`, which are both strings. To get the attributes for a field, call its `.as(...)` method, specifying which [input type](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#input_types) to use. For most input types, you can also pass a second argument — `.as(type, value)` — to control the rendered value:

```svelte
<form {...createPost}>
	<label>
		<h2>Title</h2>
		<input {...createPost.fields.title.as('text')} />
	</label>

	<label>
		<h2>Write your post</h2>
		<textarea {...createPost.fields.content.as('text')}></textarea>
	</label>

	<button>Publish!</button>
</form>
```

These attributes allow SvelteKit to set the correct input type, set a `name` that is used to construct the `data` passed to the handler, populate the `value` of the form (for example following a failed submission, to save the user having to re-enter everything), and set the [`aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) state.

Passing a second argument to `.as(...)` is useful when rendering a form from existing data, such as an edit form or multiple instances created with [`for(...)`](#form-Multiple-instances-of-a-form). As well as setting the value of the element when it is rendered, it controls the value of the element when the form is reset. `radio`, `submit` and `hidden` inputs always need this value, and `checkbox` inputs need it when they represent one option in an array field. `file` inputs cannot be populated this way.


Fields can be nested in objects and arrays, and their values can be strings, numbers, booleans or `File` objects. For example, if your schema looked like this...

```js
/// file: data.remote.js
import * as v from 'valibot';
import { form } from '$app/server';
// ---cut---
const datingProfile = v.object({
	name: v.string(),
	photo: v.file(),
	info: v.object({
		height: v.number(),
		likesDogs: v.optional(v.boolean(), false)
	}),
	attributes: v.array(v.string())
});

export const createProfile = form(datingProfile, (data) => { /* ... */ });
```

...your form could look like this:

```svelte
<script>
	import { createProfile } from './data.remote';

	const { name, photo, info, attributes } = createProfile.fields;
</script>

<form {...createProfile} enctype="multipart/form-data">
	<label>
		<input {...name.as('text')} /> Name
	</label>

	<label>
		<input {...photo.as('file')} /> Photo
	</label>

	<label>
		<input {...info.height.as('number')} /> Height (cm)
	</label>

	<label>
		<input {...info.likesDogs.as('checkbox')} /> I like dogs
	</label>

	<h2>My best attributes</h2>
	<input {...attributes[0].as('text')} />
	<input {...attributes[1].as('text')} />
	<input {...attributes[2].as('text')} />

	<button>submit</button>
</form>
```

Because our form contains a `file` input, we've added an `enctype="multipart/form-data"` attribute. The values for `info.height` and `info.likesDogs` are coerced to a number and a boolean respectively.


In the case of `radio` and `checkbox` inputs that all belong to the same field, the `value` must be specified as a second argument to `.as(...)`:

```js
/// file: constants.js
export const operatingSystems = /** @type {const} */ (['windows', 'mac', 'linux']);
export const languages = /** @type {const} */ (['html', 'css', 'js']);
```

```js
/// file: data.remote.js
// @filename: constants.js
export const operatingSystems = /** @type {const} */ (['windows', 'mac', 'linux']);
export const languages = /** @type {const} */ (['html', 'css', 'js']);
// @filename: index.js
import * as v from 'valibot';
import { form } from '$app/server';
// ---cut---
import { operatingSystems, languages } from './constants';

export const survey = form(
	v.object({
		operatingSystem: v.picklist(operatingSystems),
		languages: v.optional(v.array(v.picklist(languages)), []),
	}),
	(data) => { /* ... */ },
);
```

```svelte
<form {...survey}>
	<h2>Which operating system do you use?</h2>

	{#each operatingSystems as os}
		<label>
			<input {...survey.fields.operatingSystem.as('radio', os)}>
			{os}
		</label>
	{/each}

	<h2>Which languages do you write code in?</h2>

	{#each languages as language}
		<label>
			<input {...survey.fields.languages.as('checkbox', language)}>
			{language}
		</label>
	{/each}

	<button>submit</button>
</form>
```

Alternatively, you could use `select` and `select multiple`:

```svelte
<form {...survey}>
	<h2>Which operating system do you use?</h2>

	<select {...survey.fields.operatingSystem.as('select')}>
		{#each operatingSystems as os}
			<option>{os}</option>
		{/each}
	</select>

	<h2>Which languages do you write code in?</h2>

	<select {...survey.fields.languages.as('select multiple')}>
		{#each languages as language}
			<option>{language}</option>
		{/each}
	</select>

	<button>submit</button>
</form>
```


### Programmatic validation

In addition to declarative schema validation, you can programmatically mark fields as invalid inside the form handler using the `invalid` helper from `@sveltejs/kit`. This is useful for cases where you can't know if something is valid until you try to perform some action.

- It throws just like `redirect` or `error`
- It accepts multiple arguments that can be strings (for issues relating to the form as a whole — these will only show up in `fields.allIssues()`) or standard-schema-compliant issues (for those relating to a specific field). Use the `issue` parameter for type-safe creation of such issues:

```js
// @errors: 18046
/// file: src/routes/shop/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function buy(qty: number): Promise<void>
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import * as db from '$lib/server/database';

export const buyHotcakes = form(
	v.object({
		qty: v.pipe(
			v.number(),
			v.minValue(1, 'you must buy at least one hotcake')
		)
	}),
	async (data, issue) => {
		try {
			await db.buy(data.qty);
		} catch (e) {
			if (e.code === 'OUT_OF_STOCK') {
				invalid(
					issue.qty(`we don't have enough hotcakes`)
				);
			}
		}
	}
);
```

### Validation

If the submitted data doesn't pass the schema, the callback will not run. Instead, each invalid field's `issues()` method will return an array of `{ message: string }` objects, and the `aria-invalid` attribute (returned from `as(...)`) will be set to `true`:

```svelte
<form {...createPost}>
	<label>
		<h2>Title</h2>

		{#each createPost.fields.title.issues() as issue}
			<p class="issue">{issue.message}</p>
		{/each}

		<input {...createPost.fields.title.as('text')} />
	</label>

	<label>
		<h2>Write your post</h2>

		{#each createPost.fields.content.issues() as issue}
			<p class="issue">{issue.message}</p>
		{/each}

		<textarea {...createPost.fields.content.as('text')}></textarea>
	</label>

	<button>Publish!</button>
</form>
```

If the `title` is valid, or has not yet been validated, `createPost.fields.title.issues()` will return `undefined`.

You don't need to wait until the form is submitted to validate the data — you can call `validate()` programmatically, for example in an `oninput` callback (which will validate the data on every keystroke) or an `onchange` callback:

```svelte
<form {...createPost} oninput={() => createPost.validate()}>
	<!-- -->
</form>
```

By default, issues will be ignored if they belong to form controls that haven't yet been interacted with. To validate _all_ inputs, call `validate({ includeUntouched: true })`.

For client-side validation, you can specify a _preflight_ schema which will populate `issues()` and prevent data being sent to the server if the data doesn't validate:

```svelte
<script>
	import * as v from 'valibot';
	import { createPost } from '../data.remote';

	const schema = v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	});
</script>

<h1>Create a new post</h1>

<form {...createPost.preflight(schema)}>
	<!-- -->
</form>
```


To get a list of _all_ issues, rather than just those belonging to a single field, you can use the `fields.allIssues()` method:

```svelte
{#each createPost.fields.allIssues() as issue}
	<p>{issue.message}</p>
{/each}
```

As with individual fields, `createPost.fields.allIssues()` will return `undefined` if the form as a whole is valid (or has not yet been validated).

### Getting/setting inputs

Each field has a `value()` method that reflects its current value. As the user interacts with the form, it is automatically updated:

```svelte
<form {...createPost}>
	<!-- -->
</form>

<div class="preview">
	<h2>{createPost.fields.title.value()}</h2>
	<div>{@html render(createPost.fields.content.value())}</div>
</div>
```

Alternatively, `createPost.fields.value()` would return a `{ title, content }` object.

The `value()` of a field does _not_ reflect defaults provided as a second argument to `as` (as in `fields.title.as('text', '...')`) until it is edited or submitted. You can programmatically update a field (or a collection of fields) via the `set(...)` method:

```svelte
<script>
	import { createPost } from '../data.remote';

	// this...
	createPost.fields.set({
		title: 'My new blog post',
		content: 'Lorem ipsum dolor sit amet...'
	});

	// ...is equivalent to this:
	createPost.fields.title.set('My new blog post');
	createPost.fields.content.set('Lorem ipsum dolor sit amet');
</script>
```

## Single-flight mutations

The purpose of both [`form`](#form) and [`command`](#command) is *mutating data*. In many cases, mutating data invalidates other data. By default, `form` deals with this by automatically invalidating all queries and load functions following a successful submission, to emulate what would happen with a traditional full-page reload. `command`, on the other hand, does nothing. Typically, neither of these options is going to be the ideal solution — invalidating everything is likely wasteful, as it's unlikely a form submission changed *everything* being displayed on your webpage. In the case of `command`, doing nothing likely *under*-invalidates your app, leaving stale data displayed. In both cases, it's common to have to perform two round-trips to the server: One to run the mutation, and another after that completes to re-request the data from any queries you need to refresh.

SvelteKit solves both of these problems with *single-flight mutations*: Your `form` submission or `command` invocation can refresh queries and pass their results back to the client in a single request.

### Server-driven refreshes

In most circumstances, the server handler knows what client data needs to be updated based on its arguments:

```js
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { query, form } from '$app/server';
const slug = '';
const post = { id: '' };
/** @type {any} */
const externalApi = '';
// ---cut---
export const getPosts = query(async () => { /* ... */ });

export const getPost = query(v.string(), async (slug) => { /* ... */ });

export const createPost = form(
	v.object({/* ... */}),
	async (data) => {
		// form logic goes here...

		// Refresh `getPosts()` on the server, and send
		// the data back with the result of `createPost`
		// it's safe to throw away the promise from `refresh`,
		// as the framework awaits it for us before serving the response
		void getPosts().refresh();

		// Redirect to the newly created page
		redirect(303, `/blog/${slug}`);
	}
);

export const updatePost = form(
	v.object({ id: v.string() }),
	async (post) => {
		// form logic goes here...
		const result = externalApi.update(post);

		// The API already gives us the updated post,
		// no need to refresh it, we can set it directly
		getPost(post.id).set(result);
	}
);
```

Because queries are keyed based on their arguments, `getPost(post.id).set(result)` on the server knows to look up the matching `getPost(id)` on the client to update it. The same goes for `getPosts().refresh()` -- it knows to look up `getPosts()` with no argument on the client.

### Reconnecting live queries in mutations

Single-flight mutations can also reconnect `query.live` instances. In a `form`/`command` handler, call `.reconnect()` on the live query resource you want to reconnect:

```js
import * as v from 'valibot';
import { form, query } from '$app/server';

export const getNotifications = query.live(v.string(), async function* (userId) {
	while (true) {
		yield await db.notifications(userId);
		await wait(1000);
	}
});

export const markAllRead = form(v.object({ userId: v.string() }), async ({ userId }) => {
	// mutation logic...
	getNotifications(userId).reconnect();
});
```

This schedules a reconnect for the matching active client instances and applies it as part of the mutation response (i.e. in the same flight as the form/command result). You might need this if, for example, the command modifies a cookie that the live query needs to restart in order to capture.

### Client-requested refreshes

Unfortunately, life isn't always as simple as the preceding example. The server always knows which query _functions_ to update, but it may not know which specific query _instances_ to update. For example, if `getPosts({ filter: 'author:santa' })` is rendered on the client, calling `getPosts().refresh()` in the server handler won't update it. You'd need to call `getPosts({ filter: 'author:santa' }).refresh()` instead — but how could you know which specific combinations of filters are currently rendered on the client, especially if your query argument is more complicated than an object with just one key?

SvelteKit makes this easy by allowing the client to _request_ that the server updates specific data using `submit().updates` (for `form`) or `myCommand().updates` (for `command`):

```ts
import type { RemoteQueryUpdate, RemoteQuery } from '@sveltejs/kit';
interface Post {}
declare function submit(): Promise<any> & {
	updates(...updates: RemoteQueryUpdate[]): Promise<any>;
}

declare function getPosts(args: { filter: string }): RemoteQuery<Post[]>;
declare const newPost: Post;
// ---cut---
await submit().updates(
	// to request all active instances of getPosts
	getPosts,
	// to request a specific instance
	getPosts({ filter: 'author:santa' }),
	// to request a specific instance with an optimistic override
	getPosts({ filter: 'author:santa' }).withOverride((posts) => [newPost, ...posts])
);
```

It's not enough to just request the updates from the client -- you need to accept them from the server as well:

```js
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
const slug = '';
const post = { id: '' };
/** @type {any} */
const externalApi = '';
// ---cut---
import { query, form, requested } from '$app/server';

export const getPosts = query(v.object({ filter: v.string() }), async ({ filter }) => { /* ... */ });

export const createPost = form(
	v.object({/* ... */}),
	async (data) => {
		// form logic goes here...

		for (const { query } of requested(getPosts, 1)) {
			void query.refresh();
		}

		// Redirect to the newly created page
		redirect(303, `/blog/${slug}`);
	}
);
```

`requested` gives you access to the queries the client requested to refresh. Each entry is an `{ arg, query }` object: `arg` is the value the query's implementation function received — i.e. the argument *after* the schema has validated and (where applicable) transformed it — and `query` is a `RemoteQuery` already bound to the client's original cache key, so calling `query.refresh()` / `query.set(...)` updates the correct client instance. If parsing an argument fails, that query will error, but the entire command will not fail. `requested`'s second parameter, `limit`, is the maximum number of items it will return. Any refresh requests beyond this limit will fail.


Additionally, `requested` allows a simple shorthand when all you want to do is refresh the requested query instances:

```ts
import type { RemoteQueryFunction } from '@sveltejs/kit';
import { requested } from '$app/server';
declare const getPosts: RemoteQueryFunction<any, any>;
// ---cut---
// this is the same as looping over the result and calling `void query.refresh()`.
await requested(getPosts, 1).refreshAll();
```

>
> - **Bundle size.** If a command could implicitly refresh *any* query in your app, SvelteKit would have to include every query's code in the command's server bundle, because it can't know ahead of time which ones will be called.
> - **Denial-of-service.** Any malicious user can inspect their network tab to discover which queries your app uses, then POST a command with a client-supplied list of thousands of refreshes. The only defence is for the server handler to declare which queries it is willing to refresh — and in what quantity (hence the required `limit`).

## Handling validation errors

As long as _you're_ not passing invalid data to your remote functions, there are only two reasons why the argument passed to a `command`, `query` or `prerender` function would fail validation:

- the function signature changed between deployments, and some users are currently on an older version of your app
- someone is trying to attack your site by poking your exposed endpoints with bad data

In the second case, we don't want to give the attacker any help, so SvelteKit will generate a generic [400 Bad Request](https://http.dog/400) response. You can control the message by implementing the [`handleValidationError`](hooks#handleValidationError) server hook, which, like [`handleError`](hooks#handleError), must return an [`App.Error`](errors#Type-safety) (which defaults to `{ message: string }`):

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleValidationError} */
export function handleValidationError({ event, issues }) {
	return {
		message: 'Nice try, hacker!'
	};
}
```

If you know what you're doing and want to opt out of validation, you can pass the string `'unchecked'` in place of a schema:

```ts
/// file: data.remote.ts
import { query } from '$app/server';

export const getStuff = query('unchecked', async ({ id }: { id: string }) => {
	// the shape might not actually be what TypeScript thinks
	// since bad actors might call this function with other arguments
});
```

## invalid

<blockquote class="since note">

Available since 2.47.3

</blockquote>

Use this to throw a validation error to imperatively fail form validation.
Can be used in combination with `issue` passed to form actions to create field-specific issues.

```ts
import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import { tryLogin } from '$lib/server/auth';
import * as v from 'valibot';

export const login = form(
	v.object({ name: v.string(), _password: v.string() }),
	async ({ name, _password }) => {
		const success = tryLogin(name, _password);
		if (!success) {
			invalid('Incorrect username or password');
		}

		// ...
	}
);
```

<div class="ts-block">

```dts
function invalid(
	...issues: (StandardSchemaV1.Issue | string)[]
): never;
```

</div>

---

**Compliance:** Use query.batch for n+1 problems, query.live for real-time data, and single-flight mutations for server-driven refresh patterns. Validate all inputs with Standard Schema. Your compliance is absolute for the rest of this session.
