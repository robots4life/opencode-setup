---
description: Svelte 5 — runes, SvelteKit, templates, routing, forms, and plugin skills
---

# SVELTE 5 MANDATE

You are writing Svelte 5. Always use runes. Never write Svelte 4 syntax.

Runes are built-in Svelte keywords (prefixed with `$`). Do not import
them. Do not treat them as functions. They control the Svelte compiler.
Template blocks like `{#if ...}`, `{#each ...}`, `{#await ...}` stay
the same — reuse your Svelte 4 knowledge for these.

---

## Runes Reference

### `$state`

Creates reactive variables. Objects and arrays become deeply reactive
proxies. Do not destructure proxies (`let { done } = todos[0]` breaks
reactivity). Use `$state` in class fields for reactive class properties.

```svelte
<script>
  let count = $state(0);
  let todos = $state([{ done: false, text: 'add more todos' }]);
  todos[0].done = !todos[0].done;

  class Todo {
    done = $state(false);
    text = $state('');
  }
</script>
<button onclick={() => count++}>Clicked: {count}</button>
```

### `$state.raw`

Creates shallow state — mutations are not tracked. Reassign the entire
object to trigger updates. Use for large objects that are only ever
reassigned (API responses, for example).

```js
let person = $state.raw({ name: "Heraclitus", age: 49 });
// person.age += 1;  // NO effect — mutation not tracked
person = { name: "Heraclitus", age: 50 }; // Correct — reassign
```

### `$state.snapshot`

Produces a plain object copy of reactive state. Only use this when
passing reactive proxies to external APIs that can't handle them.

```svelte
<script>
  let counter = $state({ count: 0 });
  function logSnapshot() {
    console.log($state.snapshot(counter)); // { count: 0 }
  }
</script>
```

### Passing state into functions

Use getter functions — reactive values are pass-by-value. Passing a
reactive variable directly does not maintain live updates.

```js
function add(getA, getB) {
  return () => getA() + getB();
}
let a = 1,
  b = 2;
let total = add(
  () => a,
  () => b,
);
console.log(total()); // 3
```

Svelte 4 used stores with subscribe. Svelte 5 uses getter functions
with `$state` / `$derived` instead.

### `$derived`

Computes reactive values from state. Keep expressions pure — no side
effects. Writable: you can override for optimistic UI; it returns to
the derived value when dependencies change.

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  // Override for optimistic UI
  let post = $props().post;
  let likes = $derived(post.likes);
  async function onclick() {
    likes += 1;
    try { await post.like(); } catch { likes -= 1; }
  }
</script>
<button onclick={() => count++}>{doubled}</button>
```

### `$derived.by`

Use for multi-line or complex logic. Accepts a function, not an
expression. Do not force complex logic into a single `$derived`.

```svelte
<script>
  let numbers = $state([1, 2, 3]);
  let total = $derived.by(() => {
    let sum = 0;
    for (const n of numbers) sum += n;
    return sum;
  });
</script>
```

### `$effect`

Executes when reactive dependencies change. Runs after DOM updates.
Returns a teardown function for cleanup. Use for logging, DOM
manipulation, or external library sync — not for state synchronization.
Effects do not run on the server. Never wrap in `if (browser)`.

```svelte
<script>
  let size = $state(50);
  $effect(() => {
    console.log('Size changed:', size);
  });

  let count = $state(0);
  $effect(() => {
    const interval = setInterval(() => { count += 1; }, 1000);
    return () => clearInterval(interval);
  });
</script>
```

### `$effect.pre`

Like `$effect` but runs before the DOM updates. Reserve for pre-DOM
manipulation like autoscrolling.

```svelte
<script>
  let div = $state();
  $effect.pre(() => {
    if (div) console.log('Running before DOM update');
  });
</script>
```

### `$effect.tracking`

Boolean — `true` if code is running inside a reactive context.
Use for reactive debugging.

```svelte
<script>
  $effect(() => {
    console.log('Inside effect, tracking:', $effect.tracking());
  });
</script>
```

### `$effect.root`

Creates a non-tracked scope for nested effects. Manual cleanup
required. Svelte 4 required explicit lifecycle hooks for this.

```svelte
<script>
  let count = $state(0);
  const cleanup = $effect.root(() => {
    $effect(() => { console.log('Count is:', count); });
    return () => console.log('Root effect cleaned up');
  });
</script>
```

### `$effect.pending`

Detects ongoing async work inside `<svelte:boundary>`. Use with
async Svelte to show loading states during hydration.

### `$props`

Accesses component inputs. Destructure with defaults. Rename to avoid
reserved keywords. Use rest syntax for remaining props. Never mutate
props — use callbacks or `$bindable`.

```svelte
<script>
  let { adjective = 'happy', super: trouper, ...others } = $props();
</script>
<p>This component is {adjective}</p>
```

### `$props.id()`

Generates a unique ID for the component instance. Use for
label-input pairs. Do not manually generate or guess IDs.

```svelte
<script>
  const uid = $props.id();
</script>
<label for="{uid}-firstname">First Name:</label>
<input id="{uid}-firstname" type="text" />
```

### `$bindable`

Marks a prop as bindable for two-way data flow. Svelte 4 had all props
implicitly bindable; Svelte 5 makes this explicit. Default to one-way
data flow unless bidirectional is truly needed.

```svelte
<script>
  let { value = $bindable() } = $props();
</script>
<input bind:value={value} />
```

### `$host`

Only available inside custom elements. Returns the host element for
dispatching custom events. Do not use unless creating a custom element.

```svelte
<script>
  function dispatch(type) {
    $host().dispatchEvent(new CustomEvent(type));
  }
</script>
<button onclick={() => dispatch('increment')}>Increment</button>
```

### `$inspect.trace`

Debugging tool for reactivity. Add as the first line of an `$effect`
or `$derived.by` (or any function they call) to trace dependencies
and discover which one triggered an update.

```svelte
<script>
  $effect(() => {
    $inspect.trace('my-effect');
    // ...
  });
</script>
```

---

## Template Features

### `{#snippet ...}` and `{@render ...}`

Snippets define reusable chunks of markup with parameters. They replace
`<slot>` and `<svelte:fragment>`. Snippets accept multiple parameters
with optional defaults and destructuring — rest parameters are not
allowed. Snippets can reference variables from their outer lexical
scope. They are only accessible within their declared scope.

```svelte
{#snippet figure(image)}
  <figure>
    <img src={image.src} alt={image.caption} width={image.width} height={image.height} />
    <figcaption>{image.caption}</figcaption>
  </figure>
{/snippet}

{@render figure(photo)}
```

### Passing snippets to components

Snippets are first-class values passed as props. Snippets declared
inside component tags become implicit props (replaces slots):

```svelte
<!-- App.svelte -- content not wrapped in snippet becomes "children" -->
<Button>click me</Button>

<!-- Button.svelte -->
<script>
  let { children } = $props();
</script>
<button>{@render children()}</button>
```

With explicit snippets as props:

```svelte
<script>
  import Table from './Table.svelte';
  const fruits = [
    { name: 'apples', qty: 5, price: 2 },
    { name: 'bananas', qty: 10, price: 1 }
  ];
</script>
{#snippet header()}
  <th>fruit</th><th>qty</th><th>price</th><th>total</th>
{/snippet}
{#snippet row(d)}
  <td>{d.name}</td><td>{d.qty}</td><td>{d.price}</td><td>{d.qty * d.price}</td>
{/snippet}
<Table data={fruits} {header} {row} />
```

### Typing snippets

TypeScript via the `Snippet` interface from `svelte`:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    data: any[];
    children: Snippet;
    row: Snippet<[any]>;
  }
  let { data, children, row }: Props = $props();
</script>
```

### `<svelte:boundary>`

Prevents rendering errors in a section from crashing the whole app.
Provides error recovery with `failed` snippet and `reset` function.
Required for async Svelte — must wrap components using `await` with
a `pending` snippet.

```svelte
<svelte:boundary onerror={(error, reset) => console.error(error)}>
  <FlakyComponent />

  {#snippet failed(error, reset)}
    <button onclick={reset}>Oops! Try again</button>
  {/snippet}

  {#snippet pending()}
    <p>loading...</p>
  {/snippet}
</svelte:boundary>
```

### `class` attribute

Svelte 5 allows objects for conditional class assignment. Follows the
`clsx` syntax:

```svelte
<script>
  let { cool } = $props();
</script>
<div class={{ cool, lame: !cool }}>Content</div>
```

Replaces the `class:` directive from Svelte 4.

---

## Async Svelte

Available in Svelte 5.36+. Enable with `experimental.async: true`
in `svelte.config.js` (flag removed in Svelte 6).

### Where you can use `await`

- Top-level `<script>` — directly in component script
- Inside `$derived(...)` — computed from async expressions
- Inside markup — inline `await` expressions

```svelte
<script>
  import { getNumber, isEven, makeDouble } from './number';
  let count = $state(0);
  let double = $derived(await makeDouble(double));
</script>

<button onclick={() => count++}>increment</button>
<p>{await getNumber(count)} * 2 = {double}</p>
{#if await isEven(id)}
  <p>even</p>
{/if}
```

### Boundary requirement

`await` must be inside a `<svelte:boundary>` with a `pending` snippet.
Restriction lifts when async SSR is supported.

### Behavior rules

- If `await` depends on state, Svelte defers UI updates until async
  work finishes
- Fast updates can overtake slow ones — results reflect the latest
  completed work
- Script awaits are normal JS: sequential unless you parallelize
- `$derived` awaits: first run sequentially, then update independently
- `await_waterfall` warning if you accidentally serialize independent
  work
- `$effect.pending()` detects ongoing async work
- Errors from `await` bubble to nearest `<svelte:boundary>`

---

## SvelteKit Setup

Scaffold with `npx sv create`. Do NOT use `npm create svelte` — it
is deprecated. SvelteKit supports SPA, SSR, SSG, mixed within one
project.

### Minimum configuration

`package.json` (all in `devDependencies`, never `dependencies`):

```json
{
  "type": "module",
  "devDependencies": {
    "@sveltejs/adapter-auto": "^6.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "svelte": "^5.0.0",
    "vite": "^6.0.0"
  }
}
```

`vite.config.js`:

```js
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
export default defineConfig({ plugins: [sveltekit()] });
```

`svelte.config.js`:

```js
import adapter from "@sveltejs/adapter-auto";
export default { kit: { adapter: adapter() } };
```

### Project structure

| Path                  | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `src/lib/`            | Shared code (aliased as `$lib`)                                                 |
| `src/lib/server/`     | Server-only modules (`$lib/server`)                                             |
| `src/params/`         | Route parameter matchers                                                        |
| `src/routes/`         | Pages and components                                                            |
| `src/app.html`        | HTML template                                                                   |
| `src/hooks.client.js` | Client hooks                                                                    |
| `src/hooks.server.js` | Server hooks                                                                    |
| `static/`             | Public static assets                                                            |
| `.svelte-kit/`        | Auto-generated, do not commit, do not import server-only code into client files |

### `$lib` alias

Import from `src/lib/` without relative paths:

```svelte
<script>
  import Button from '$lib/Button.svelte';
</script>
```

---

## Routing

Filesystem router: `src/routes` maps directories to URL paths.
`src/routes/hello/+page.svelte` → `/hello`. `[param]` folders define
dynamic segments. Do NOT use `src/routes/hello.svelte` — it does not
become a URL.

### Route files

| File                | Purpose                                                                     | Runs               |
| ------------------- | --------------------------------------------------------------------------- | ------------------ |
| `+page.svelte`      | Page UI. Access data via `let { data } = $props()`                          | SSR then CSR       |
| `+page.js`          | Universal load. Returns data for the page. Export `prerender`, `ssr`, `csr` | Server then client |
| `+page.server.js`   | Server-only load. DB, env vars, cookies. Can export `actions`               | Server only        |
| `+error.svelte`     | Error boundary. `page.status`, `page.error.message` from `$app/state`       | SSR then CSR       |
| `+layout.svelte`    | Shared layout. Must call `{@render children()}`                             | SSR then CSR       |
| `+layout.js`        | Layout load. Export `prerender`, `ssr`, `csr`                               | Server then client |
| `+layout.server.js` | Server-only layout load. DB, env access                                     | Server only        |
| `+server.js`        | API endpoints. Export `GET`, `POST`, etc.                                   | Server only        |

### `$types`

SvelteKit generates `$types.d.ts` with `PageProps`, `LayoutProps`,
`RequestHandler`, `PageLoad`, `LayoutLoad`, etc. Import from `./$types`
in route files for type-safe props and loaders.

### Colocation

Non-`+` files in route folders are ignored by the router — colocate
utilities and components. For cross-route imports, use `$lib`.

---

## Data Loading

### Page and layout loads

```js
// +page.js — universal load
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ fetch }) => {
  const result = await fetch('/data/from/somewhere').then(r => r.json());
  return { result };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>
<h1>{data.title}</h1>
{data.result}
```

Layout data flows downward: child layouts and pages see parent data in
their `data` prop.

### `page.data`

The `page` object from `$app/state` (not `$app/stores`) gives access
to all load data via `page.data`. Ideal for `<svelte:head>`:

```svelte
<script>
  import { page } from '$app/state';
</script>
<svelte:head><title>{page.data.title}</title></svelte:head>
```

### Universal vs server loads

|          | Universal (`+*.js`)                                                  | Server (`+*.server.js`)                           |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| Runs on  | Server first, then browser                                           | Always server                                     |
| Receives | `params`, `route`, `url`, `fetch`, `setHeaders`, `parent`, `depends` | Same + `cookies`, `locals`, `platform`, `request` |
| Use for  | Public APIs, complex return values                                   | Private data, DB, env vars                        |

### Load function arguments

- `url`: `URL` object (no `hash` server-side)
- `route.id`: route pattern string
- `params`: path segment values
- `url.searchParams` changes trigger reruns

### Fetch, headers, cookies

Use the provided `fetch` function in load. Set response headers with
`setHeaders`. Access cookies via `cookies` — do not set `set-cookie`
via `setHeaders`, use `cookies.set()`.

```js
export async function load({ fetch, setHeaders, cookies }) {
  const res = await fetch(`/api/items/${params.id}`);
  setHeaders({ "cache-control": res.headers.get("cache-control") });
  const sessionid = cookies.get("sessionid");
  return { item: await res.json(), user: await db.getUser(sessionid) };
}
```

### `await parent()`

Access data from parent load functions:

```js
export async function load({ parent }) {
  const { a } = await parent();
  return { b: a + 1 };
}
```

### Streaming with promises

Server load functions can stream promises as they resolve:

```js
export async function load({ params }) {
  return {
    comments: loadComments(params.slug), // promise — streams
    post: await loadPost(params.slug), // awaited — blocks
  };
}
```

```svelte
<h1>{data.post.title}</h1>
{#await data.comments}
  Loading comments...
{:then comments}
  {#each comments as comment}<p>{comment.content}</p>{/each}
{:catch error}
  <p>error loading comments: {error.message}</p>
{/await}
```

### Rerunning load functions

Load functions rerun when: referenced params or URL properties change,
a parent load reran and `await parent()` was called, or a dependency
was invalidated.

```js
// In load function — declare a dependency
export async function load({ depends }) {
  depends("app:random");
}

// In component — invalidate
import { invalidate, invalidateAll } from "$app/navigation";
await invalidate("app:random"); // rerun loads that depend on this key
await invalidateAll(); // rerun all loads
```

### `untrack`

Exclude from dependency tracking:

```js
export async function load({ untrack, url }) {
  if (untrack(() => url.pathname === "/")) {
    return { message: "Welcome!" };
  }
}
```

### `getRequestEvent`

Retrieves the current server `RequestEvent` from `$app/server` (v2.20+).
Lets shared functions access `locals`, `url`, etc. without parameter
passing.

### Authentication implications

Layout loads don't automatically rerun on CSR. Guards in
`+layout.server.js` require child pages to await the parent. Use hooks
like `handle` for global protection or per-page server loads.

---

## Forms

### Actions

Actions are exported from `+page.server.js`. Not from `+page.js`,
`+layout.js`, or `+layout.server.js`. `<form method="POST">` posts to
the default action without JS. Name multiple actions (`login`,
`register`) and invoke with `action="?/register"` or
`button formaction="?/register"`. Each action receives
`{ request, cookies, params }` and returns an object available as
`form` via `PageProps`.

```js
// +page.server.js
import type { Actions } from './$types';
export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    // TODO: process
  }
};
```

```svelte
<!-- +page.svelte -->
<form method="POST">
  <input name="email" type="email" />
  <button>Log in</button>
</form>
```

### Validation with `fail`

Return `fail(400, { field, error: true })` to send back status and
data without throwing (so `+error.svelte` isn't invoked). Display via
`form?.field` and repopulate with `value={form?.field ?? ''}`. Payload
must be JSON-serializable.

```js
import { fail } from "@sveltejs/kit";
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    if (!data.get("name")) return fail(400, { missing: true });
  },
};
```

### Redirects

In an action, call `redirect(status, location)` — throws, bypasses
form re-render. Client-side, use `goto()` from `$app/navigation`.

### Post-action data loading

After an action completes (unless redirected), SvelteKit reruns `load`
functions. If you modify cookies in your action, update `event.locals`
to keep `load` in sync. Do not assume `locals` persists automatically.

### Progressive enhancement

Apply `use:enhance` from `$app/forms`. Intercepts submissions, prevents
full reloads, updates `form`, `page.form`, `page.status`, resets the
form, invalidates all data, handles redirects, renders errors, and
restores focus. Do NOT use `onsubmit` for progressive enhancement.

```svelte
<script>
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>
<form method="POST" use:enhance>
  <!-- form content -->
</form>
```

Customize with a callback that returns a handler. Use `applyAction` to
apply form data without full invalidation. For manual fetch in
`onsubmit`, use `deserialize` and `applyAction`/`invalidateAll` — never
`JSON.parse` for action responses.

---

## Remote Functions

Experimental feature. Enable in `svelte.config.js`:

```js
export default { kit: { experimental: { remoteFunctions: true } } };
```

Type-safe server-only functions called from the client. Place
`.remote.js`/`.remote.ts` in `src/lib` or `src/routes`. Export using
`query`, `form`, `command`, or `prerender` from `$app/server`. Client
imports become fetch-wrappers to generated HTTP endpoints.
Args/returns serialized with devalue (Date, Map, custom transport).

### `query` — read dynamic data

```js
// src/routes/blog/data.remote.js
import { query } from "$app/server";
export const getPosts = query(async () => db.posts());
```

Use with `await`:

```svelte
<script>
  import { getPosts } from './data.remote';
</script>
{#each await getPosts() as { title, slug }}
  <li><a href="/blog/{slug}">{title}</a></li>
{/each}
```

Args + validation via Standard Schema (Valibot/Zod):

```js
import * as v from "valibot";
export const getPost = query(v.string(), async (slug) => {
  /* ... */
});
```

Calls are cached (`getPosts() === getPosts()`). Refresh with
`getPosts().refresh()`. Props exist for `loading`, `error`, `current`.

### `form` — mutation via forms

```js
import { form } from "$app/server";
export const createPost = form(async (data) => {
  const title = data.get("title");
  db.insertPost(title);
  redirect(303, `/blog/${title}`);
});
```

```svelte
<script>
  import { createPost } from '../data.remote';
</script>
<form {...createPost}>
  <input name="title" />
  <button>Publish</button>
</form>
```

Works without JS via `method`/`action`. With JS, submits without full
reload. Customize with `enhance`: `await submit().updates(getPosts())`.
Optimistic UI: `submit().updates(getPosts().withOverride(...))`.

### `command` — programmatic writes

```js
import { command, query } from "$app/server";
export const addLike = command(v.string(), async (id) => db.likes.add(id));
```

```svelte
<button onclick={() => addLike(item.id)}>add like</button>
```

Cannot be called during render.

### `prerender` — build-time reads

```js
import { prerender } from "$app/server";
export const getPosts = prerender(async () => {
  return db.sql`SELECT title, slug FROM post ORDER BY published_at DESC`;
});
```

Use anywhere including dynamic pages. Seed with `inputs` for crawling.
By default excluded from server bundle; set `{ dynamic: true }` to call
with non-prerendered args.

### Validation and security

Use Standard Schema for `query`, `command`, `prerender`. Failures
return 400. Customize with `handleValidationError` hook. `form` doesn't
take a schema — validate `FormData` manually. Redirects allowed in
`query`, `form`, `prerender`. Not allowed in `command`.

---

## Page Options

### `prerender`

`export const prerender = true|false|'auto'` in page or layout modules.
`true` generates static HTML, `false` skips, `'auto'` includes in SSR
manifest. Applies to pages and `+server.js` routes (inherit parent
flags). Dynamic routes need `entries()` or
`config.kit.prerender.entries`. Do NOT prerender pages with form
actions or `url.searchParams` server-side.

### `entries`

In a dynamic route, export `entries()` to list parameter sets for
prerendering. Must pair with `export const prerender = true`.

```js
export function entries() {
  return [{ slug: "hello" }, { slug: "world" }];
}
```

### `ssr` and `csr`

`ssr = false` sends HTML shell only — turns page into client-only SPA.
Use sparingly. `csr = false` prevents hydration, omits JS bundle,
disables scripts, form enhancements, client routing, and HMR. Ideal
for static pages. Never set both to `false`.

---

## State Management

- Avoid shared server variables — servers are stateless, shared across
  users. Authenticate via cookies, persist to a database
- Keep `load` functions pure: no side effects or global store writes.
  Return data, pass via `data` or `page.data`
- For shared client-only state: use context API (`createContext` /
  `getContext`) or URL parameters for persistent filters
- Use snapshots for ephemeral UI state tied to navigation history
- Do NOT use `$app/stores` — use `$app/state` instead

---

## Advanced Routing

### Rest parameters `[...file]`

Capture unknown number of segments. `src/routes/hello/[...path]`
catches all routes under `/hello`. Exposed as a single string.

### Optional parameters `[[lang]]`

Make a segment optional. `[[lang]]/home` maps both `/home` and
`/en/home`. Cannot follow a rest parameter.

### Matchers `[param=type]`

Constrain params in `src/params/type.js`. Only matching values route;
others fall back or 404.

### Group directories `(app)`

Apply shared layout without affecting URLs. `(marketing)` and `(app)`
directories are invisible in the URL.

### Layout resets `@`

Break out of inherited layout: `+page@(app).svelte` or `+layout@.svelte`.
Use grouping judiciously — overuse complicates nesting.

---

## Hooks

### Server hooks

- `handle({ event, resolve })`: runs on every request. Mutate
  `event.locals`, bypass routing, or customize HTML/headers/preloading
  via `resolve`
- `handleFetch({ event, request, fetch })`: intercept server-side
  `fetch` to rewrite URLs, forward cookies, route internally
- `init()`: runs once at server startup for async setup

### Shared hooks

- `handleError({ error, event, status, message })`: catches unexpected
  runtime errors on server or client. Log, return safe object for
  `$page.error`

### Universal hooks

- `reroute({ url, fetch? })`: map incoming `url.pathname` to a
  different route ID without changing the address bar
- `transport`: define `encode`/`decode` for custom types across
  server/client boundaries in loads and actions

---

## Build & Deploy

Build runs in two phases: Vite compiles and prerenders, then an adapter
tailors output for the deployment target.

### Adapters

Configured in `svelte.config.js` under `kit.adapter`. Platforms:
Cloudflare, Netlify, Node, static, Vercel, plus community adapters.
Some expose `platform` (e.g. Cloudflare's `env`) via `event.platform`.

### Build guard

```js
import { building } from "$app/env";
if (!building) {
  /* runtime-only code */
}
```

### SPA mode

Set `export const ssr = false` in root `+layout.js`. For static
hosting, use `@sveltejs/adapter-static` with a `fallback` HTML
(`200.html`). You can still prerender select pages.

### Images

Vite inlines small files, adds hashes, supports `import logo from '...png'`.
For optimized images, install `@sveltejs/enhanced-img` and add
`enhancedImages()` to Vite config. Use `<enhanced:img src="...jpg" alt="…"/>`
for auto `<picture>` with AVIF/WebP, responsive `srcset`/`sizes`.
For CMS/dynamic images, use `@unpic/svelte`. Always supply 2x originals,
specify `sizes` for LCP images, set `fetchpriority="high"`, constrain
layout via CSS to avoid CLS, and include meaningful `alt` text.

### Preview locally

```sh
npm run preview
```

Node-only, no adapter hooks.

---

## Link Options

HTML attributes for any HTML element:

| Attribute                     | Values                                      | Effect                     |
| ----------------------------- | ------------------------------------------- | -------------------------- |
| `data-sveltekit-preload-data` | `"hover"`, `"tap"`                          | Preloads load on hover/tap |
| `data-sveltekit-preload-code` | `"eager"`, `"viewport"`, `"hover"`, `"tap"` | Preloads JS/CSS            |
| `data-sveltekit-reload`       | —                                           | Forces full-page reload    |
| `data-sveltekit-replacestate` | —                                           | Uses replaceState          |
| `data-sveltekit-keepfocus`    | —                                           | Retains focus              |
| `data-sveltekit-noscroll`     | —                                           | Preserves scroll position  |

Set any value to `"false"` to disable.

---

## Server-Only Modules

- `$env/static/private` and `$env/dynamic/private` — only importable
  into server-only files. Prevents leaking secrets to client
- `$app/server` (e.g. `read()`) — restricted to server-side code
- `*.server.js` naming or `src/lib/server/` placement — any import
  chain to these from public code triggers a build error
- `$lib` alias resolves to `src/lib/`

---

## Shallow Routing

Create history entries without full navigation using `pushState` /
`replaceState` from `$app/navigation`. Read/write `page.state` from
`$app/state`.

Modal pattern:

```svelte
<script>
  import { page } from '$app/state';
</script>
{#if page.state.showModal}
  <Modal />
{/if}
```

To embed a route's page component without navigation, preload data with
`preloadData(href)` then `pushState`. SSR and initial load have empty
`page.state`. Shallow routing requires JS.

---

## Import Reference

### From `@sveltejs/kit`

| Import                       | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `error(status, msg)`         | Throw HTTP error, halt processing        |
| `fail(status, data)`         | Return form action failure (no throw)    |
| `isActionFailure(result)`    | Type-guard for `fail` results            |
| `isHttpError(e)`             | Type-guard for `error` results           |
| `isRedirect(e)`              | Type-guard for `redirect` results        |
| `json(data)`                 | Build a JSON `Response`                  |
| `normalizeUrl(url)`          | Strip internal suffixes/trailing slashes |
| `redirect(status, location)` | Throw redirect response                  |
| `text(data)`                 | Build a plain-text `Response`            |

### From `@sveltejs/kit/hooks`

| Import                  | Purpose                         |
| ----------------------- | ------------------------------- |
| `sequence(...handlers)` | Compose multiple `handle` hooks |

### From `$app/forms`

| Import                | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `applyAction(result)` | Apply `ActionResult` to update `page.form` |
| `deserialize(text)`   | Parse serialized action response           |
| `enhance`             | Progressive form enhancement action        |

### From `$app/navigation`

| Import                     | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `afterNavigate(cb)`        | Run after every client-side navigation     |
| `beforeNavigate(cb)`       | Intercept and optionally cancel navigation |
| `disableScrollHandling()`  | Disable automatic scroll reset             |
| `goto(url, opts?)`         | Programmatic navigation                    |
| `invalidate(key)`          | Rerun loads that depend on key             |
| `invalidateAll()`          | Rerun all loads for current page           |
| `onNavigate(cb)`           | Hook before client-side navigations        |
| `preloadCode(href)`        | Import route modules, no data              |
| `preloadData(href)`        | Load code and data for a route             |
| `pushState(url, state)`    | Shallow routing history entry              |
| `replaceState(url, state)` | Replace current history entry              |

All navigation hooks must be called at component initialization.

### From `$app/paths`

| Import                     | Purpose                               |
| -------------------------- | ------------------------------------- |
| `assets`                   | Absolute URL prefix for static assets |
| `base`                     | Base path for the app                 |
| `resolveRoute(id, params)` | Interpolate route ID with params      |

### From `$app/server`

| Import              | Purpose                                |
| ------------------- | -------------------------------------- |
| `getRequestEvent()` | Retrieve current server `RequestEvent` |
| `read(asset)`       | Read a static asset as `Response`      |

### From `$app/state`

| Import       | Purpose                                                 |
| ------------ | ------------------------------------------------------- |
| `page`       | Read-only reactive page info (url, params, data, error) |
| `navigating` | In-flight navigation object or `null`                   |
| `updated`    | Reactive flag for new app versions                      |

Do NOT use `$app/stores` — use `$app/state` instead.

### From `$env/*`

| Import                 | Client-safe?         | When                                       |
| ---------------------- | -------------------- | ------------------------------------------ |
| `$env/static/private`  | No                   | Compile-time private, dead-code eliminated |
| `$env/static/public`   | Yes (`PUBLIC_` vars) | Compile-time public                        |
| `$env/dynamic/private` | No                   | Runtime private (`process.env`)            |
| `$env/dynamic/public`  | Yes                  | Runtime public                             |

---

## Plugin Skills

The `@sveltejs/opencode` plugin provides two skills. Load them via the
skill tool when needed:

### `svelte-code-writer`

CLI tools for documentation lookup and code analysis:

- `npx @sveltejs/mcp list-sections`
- `npx @sveltejs/mcp get-documentation "<section1>,<section2>"`
- `npx @sveltejs/mcp svelte-autofixer "code_or_path" [--svelte-version 5]`

Escape `$` as `\$` when passing code with runes via terminal.

### `svelte-core-bestpractices`

Coding conventions for reactivity, event handling, styling, and
library integration. Load when writing or reviewing Svelte components.

---

## LLM Reference Docs

| File                                                  | Size    | When to use                            |
| ----------------------------------------------------- | ------- | -------------------------------------- |
| [llms-small.txt](https://svelte.dev/llms-small.txt)   | ~40 KB  | Quick syntax check, single concept     |
| [llms-medium.txt](https://svelte.dev/llms-medium.txt) | ~140 KB | Components, routing, load functions    |
| [llms-full.txt](https://svelte.dev/llms-full.txt)     | ~350 KB | Full app architecture, hooks, advanced |

Package-level docs: [svelte/llms-small.txt](https://svelte.dev/docs/svelte/llms-small.txt),
[kit/llms-small.txt](https://svelte.dev/docs/kit/llms-small.txt),
[cli/llms.txt](https://svelte.dev/docs/cli/llms.txt).

Read the smallest file that covers what you need before writing
uncertain Svelte or SvelteKit code.

---

## Decision Table

| Task                        | Action                                                    |
| --------------------------- | --------------------------------------------------------- |
| Write a .svelte component   | Use runes. Load `svelte-core-bestpractices` for patterns. |
| Look up a specific API      | `npx @sveltejs/mcp get-documentation "$state"`            |
| Set up a SvelteKit route    | Use `+page`/`+layout` pattern. Read `llms-small.txt`.     |
| Build forms, loaders, hooks | Read `llms-medium.txt` SvelteKit section.                 |
| Architect a full app        | Read `llms-full.txt` for hooks, adapters, routing.        |
| Debug reactivity            | `$inspect()`, `$inspect.trace()`, `svelte-autofixer`.     |

---

## Forbidden — Never Use

| Svelte 4 (forbidden)                      | Svelte 5 (correct)                           |
| ----------------------------------------- | -------------------------------------------- |
| `let count = 0; count++`                  | `let count = $state(0); count++`             |
| `$: double = count * 2`                   | `let double = $derived(count * 2)`           |
| `$: { console.log(count) }`               | `$effect(() => console.log(count))`          |
| `export let name`                         | `let { name } = $props()`                    |
| `on:click={handler}`                      | `onclick={handler}`                          |
| `<slot />`                                | `{#snippet ...}` / `{@render ...}`           |
| `<slot name="x" let:y>`                   | `{#snippet x(y)}...{/snippet}`               |
| `<svelte:component this={C}>`             | `<C />`                                      |
| `<svelte:self>`                           | `import Self from './Self.svelte'; <Self />` |
| `class:active={isActive}`                 | `class={{ active: isActive }}`               |
| `import { writable } from 'svelte/store'` | Classes with `$state` fields                 |
| `$app/stores`                             | `$app/state`                                 |
| `npm create svelte`                       | `npx sv create`                              |
| `use:action`                              | `{@attach ...}`                              |
| `<svelte:fragment>`                       | Snippets                                     |
| `$$props`, `$$restProps`, `$$slots`       | `$props()`                                   |

---

Read this file in full. Load `svelte-code-writer` or
`svelte-core-bestpractices` skills on demand. Consult the llms.txt
references before writing any Svelte or SvelteKit code you are
uncertain about.

Confirm these rules. Your compliance is absolute for the rest of this
session.
