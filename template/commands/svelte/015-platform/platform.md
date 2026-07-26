---
name: sveltekit-platform
description: SvelteKit platform features — accessibility (route announcements, focus management, lang), icons (CSS vs Svelte libraries), auth (sessions vs tokens, hooks integration), service workers, and observability (OpenTelemetry/Jaeger)
---

# Service workers

Service workers act as proxy servers that handle network requests inside your app. This makes it possible to make your app work offline, but even if you don't need offline support (or can't realistically implement it because of the type of app you're building), it's often worth using service workers to speed up navigation by precaching your built JS and CSS.

In SvelteKit, if you have a `src/service-worker.js` file (or `src/service-worker/index.js`) it will be bundled and automatically registered.

## Inside the service worker

Inside the service worker you have access to the [`$service-worker` module]($service-worker), which provides you with the paths to all static assets, build files and prerendered pages. You're also provided with an app version string, which you can use for creating a unique cache name, and the deployment's `base` path. If your Vite config specifies `define` (used for global variable replacements), this will be applied to service workers as well as your server/client builds.

The following example caches the built app and any files in `static` eagerly, and caches all other requests as they happen. This would make each page work offline once visited.

```js
// @errors: 2688 2307
/// file: src/service-worker.js
// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from '$service-worker';

// This gives `self` the correct types
const self = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200 && !response.headers.get('cache-control')?.includes('no-store')) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});
```



## Manual registration

You can [disable automatic registration](configuration#serviceWorker) if you need to register the service worker with your own logic. The default registration looks something like this:

```js
import { dev } from '$app/environment';

if ('serviceWorker' in navigator) {
	addEventListener('load', function () {
		navigator.serviceWorker.register('./path/to/service-worker.js', {
			type: dev ? 'module' : 'classic'
		});
	});
}
```


## Updating the service worker

Browsers check for an updated service worker when a full-page navigation happens within its scope, and after functional events such as `push` and `sync`. Client-side navigations are neither, so navigating around your app will not by itself cause a new deployment's service worker to be picked up.

SvelteKit calls [`registration.update()`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update) only as part of error recovery — if a route module fails to load or a navigation results in an error status, and [version polling](configuration#version) detects that the app has been redeployed, the service worker is updated before SvelteKit falls back to a full-page navigation.

If you want new deployments to be picked up more eagerly, you can trigger an update check yourself — for example on every client-side navigation, in your root layout:

```js
import { afterNavigate } from '$app/navigation';

afterNavigate(async () => {
	if ('serviceWorker' in navigator) {
		const registration = await navigator.serviceWorker.getRegistration();
		await registration?.update();
	}
});
```

This will not cause the new service worker (if there is one) to take over the existing page immediately — instead, it will be installed in the background and take over as soon as the number of tabs managed by the existing service worker drops to zero.

## Other solutions

SvelteKit's service worker implementation is designed to be easy to work with and is probably a good solution for most users. However, outside of SvelteKit, many PWA applications leverage the [Workbox](https://web.dev/learn/pwa/workbox) library. If you're used to using Workbox you may prefer [Vite PWA plugin](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html).

## References

For more general information on service workers, we recommend [the MDN web docs](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

# Observability

<blockquote class="since note">
	<p>Available since 2.31</p>
</blockquote>

Sometimes, you may need to observe how your application is behaving in order to improve performance or find the root cause of a pesky bug. To help with this, SvelteKit can emit server-side [OpenTelemetry](https://opentelemetry.io) spans for the following:

- The [`handle`](hooks#handle) hook and `handle` functions running in a [`sequence`](@sveltejs-kit-hooks#sequence) (these will show up as children of each other and the root `handle` hook)
- Server [`load`](load) functions and universal `load` functions when they're run on the server
- [Form actions](form-actions)
- [Remote functions](remote-functions)

Just telling SvelteKit to emit spans won't get you far, though — you need to actually collect them somewhere to be able to view them. SvelteKit provides `src/instrumentation.server.ts` as a place to write your tracing setup and instrumentation code. It's guaranteed to be run prior to your application code being imported, providing your deployment platform supports it and your adapter is aware of it.

Both of these features are currently experimental, meaning they are likely to contain bugs and are subject to change without notice. You must opt in by adding the `kit.experimental.tracing.server` and `kit.experimental.instrumentation.server` option in your `svelte.config.js`:

```js
/// file: svelte.config.js
// @errors: 2353
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		experimental: {
			tracing: {
				server: true
			},
			instrumentation: {
				server: true
			}
		}
	}
};

export default config;
```


## Augmenting the built-in tracing

SvelteKit provides access to the `root` span and the `current` span on the request event. The root span is the one associated with your root `handle` function, and the current span could be associated with `handle`, `load`, a form action, or a remote function, depending on the context. You can annotate these spans with any attributes you wish to record:

```js
/// file: $lib/authenticate.ts

// @filename: ambient.d.ts
declare module '$lib/auth-core' {
	export function getAuthenticatedUser(): Promise<{ id: string }>
}

// @filename: index.js
// ---cut---
import { getRequestEvent } from '$app/server';
import { getAuthenticatedUser } from '$lib/auth-core';

async function authenticate() {
	const user = await getAuthenticatedUser();
	const event = getRequestEvent();
	event.tracing.root.setAttribute('userId', user.id);
}
```

## Development quickstart

To view your first trace, you'll need to set up a local collector. We'll use [Jaeger](https://www.jaegertracing.io/docs/getting-started/) in this example, as they provide an easy-to-use quickstart command. Once your collector is running locally:

- Turn on the experimental flags mentioned earlier in your `svelte.config.js` file
- Use your package manager to install the dependencies you'll need:
  ```sh
  npm i @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-proto import-in-the-middle
  ```
- Create `src/instrumentation.server.js` with the following:

```js
// @errors: 2307
/// file: src/instrumentation.server.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { createAddHookMessageChannel } from 'import-in-the-middle';
import { register } from 'node:module';

const { registerOptions } = createAddHookMessageChannel();
register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions);

const sdk = new NodeSDK({
	serviceName: 'test-sveltekit-tracing',
	traceExporter: new OTLPTraceExporter(),
	instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

Now, server-side requests will begin generating traces, which you can view in Jaeger's web console at [localhost:16686](http://localhost:16686).

## `@opentelemetry/api`

SvelteKit uses `@opentelemetry/api` to generate its spans. This is declared as an optional peer dependency so that users not needing traces see no impact on install size or runtime performance. In most cases, if you're configuring your application to collect SvelteKit's spans, you'll end up installing a library like `@opentelemetry/sdk-node` or `@vercel/otel`, which in turn depend on `@opentelemetry/api`, which will satisfy SvelteKit's dependency as well. If you see an error from SvelteKit telling you it can't find `@opentelemetry/api`, it may just be because you haven't set up your trace collection yet. If you _have_ done that and are still seeing the error, you can install `@opentelemetry/api` yourself.

# Auth

Auth refers to authentication and authorization, which are common needs when building a web application. Authentication means verifying that the user is who they say they are based on their provided credentials. Authorization means determining which actions they are allowed to take.

## Sessions vs tokens

After the user has provided their credentials such as a username and password, we want to allow them to use the application without needing to provide their credentials again for future requests. Users are commonly authenticated on subsequent requests with either a session identifier or signed token such as a JSON Web Token (JWT).

Session IDs are most commonly stored in a database. They can be immediately revoked, but require a database query to be made on each request.

In contrast, JWT generally are not checked against a datastore, which means they cannot be immediately revoked. The advantage of this method is improved latency and reduced load on your datastore.

## Integration points

Auth [cookies](@sveltejs-kit#Cookies) can be checked inside [server hooks](hooks). If a user is found matching the provided credentials, the user information can be stored in [`locals`](hooks#handle-locals).

## Libraries

The [Svelte CLI](/docs/cli) gives the option to [set up Better Auth](https://svelte.dev/docs/cli/better-auth) with a new project or add it to an existing project.

## Guides

If you'd like to implement your own auth system, [the Lucia auth guide](https://lucia-auth.com/) provides a reference for session-based web app auth with SvelteKit examples.

# Icons

## CSS

A great way to use icons is to define them purely via CSS. Iconify offers support for [many popular icon sets](https://icon-sets.iconify.design/) that [can be included via CSS](https://iconify.design/docs/usage/css/). This method can also be used with popular CSS frameworks by leveraging the Iconify [Tailwind CSS plugin](https://iconify.design/docs/usage/css/tailwind/) or [UnoCSS plugin](https://iconify.design/docs/usage/css/unocss/). As opposed to libraries based on Svelte components, it doesn't require each icon to be imported into your `.svelte` file.

## Svelte

There are many [icon libraries for Svelte](/packages#icons). When choosing an icon library, it is recommended to avoid those that provide a `.svelte` file per icon, as these libraries can have thousands of `.svelte` files which really slow down [Vite's dependency optimization](https://vite.dev/guide/dep-pre-bundling.html). This can become especially pathological if the icons are imported both via an umbrella import and subpath import [as described in the `vite-plugin-svelte` FAQ](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#what-is-going-on-with-vite-and-pre-bundling-dependencies).

# Accessibility

SvelteKit strives to provide an accessible platform for your app by default. Svelte's [compile-time accessibility checks](../svelte/compiler-warnings) will also apply to any SvelteKit application you build.

Here's how SvelteKit's built-in accessibility features work and what you need to do to help these features to work as well as possible. Keep in mind that while SvelteKit provides an accessible foundation, you are still responsible for making sure your application code is accessible. If you're new to accessibility, see the ["further reading"](accessibility#Further-reading) section of this guide for additional resources.

We recognize that accessibility can be hard to get right. If you want to suggest improvements to how SvelteKit handles accessibility, please [open a GitHub issue](https://github.com/sveltejs/kit/issues).

## Route announcements

In traditional server-rendered applications, every navigation (e.g. clicking on an `<a>` tag) triggers a full page reload. When this happens, screen readers and other assistive technology will read out the new page's title so that users understand that the page has changed.

Since navigation between pages in SvelteKit happens without reloading the page (known as [client-side routing](glossary#Routing)), SvelteKit injects a [live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) onto the page that will read out the new page name after each navigation. This determines the page name to announce by inspecting the `<title>` element.

Because of this behavior, every page in your app should have a unique, descriptive title. In SvelteKit, you can do this by placing a `<svelte:head>` element on each page:

```svelte
<!--- file: src/routes/+page.svelte --->
<svelte:head>
	<title>Todo List</title>
</svelte:head>
```

This will allow screen readers and other assistive technology to identify the new page after a navigation occurs. Providing a descriptive title is also important for [SEO](seo#Manual-setup-title-and-meta).

## Focus management

In traditional server-rendered applications, every navigation will reset focus to the top of the page. This ensures that people browsing the web with a keyboard or screen reader will start interacting with the page from the beginning.

To simulate this behavior during client-side routing, SvelteKit focuses the `<body>` element after each navigation and [enhanced form submission](form-actions#Progressive-enhancement). There is one exception - if an element with the [`autofocus`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus) attribute is present, SvelteKit will focus that element instead. Make sure to [consider the implications for assistive technology](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus#accessibility_considerations) when using that attribute.

If you want to customize SvelteKit's focus management, you can use the `afterNavigate` hook:

```js
/// <reference types="@sveltejs/kit" />
// ---cut---
import { afterNavigate } from '$app/navigation';

afterNavigate(() => {
	/** @type {HTMLElement | null} */
	const to_focus = document.querySelector('.focus-me');
	to_focus?.focus();
});
```

You can also programmatically navigate to a different page using the [`goto`]($app-navigation#goto) function. By default, this will have the same client-side routing behavior as clicking on a link. However, `goto` also accepts a `keepFocus` option that will preserve the currently-focused element instead of resetting focus. If you enable this option, make sure the currently-focused element still exists on the page after navigation. If the element no longer exists, the user's focus will be lost, making for a confusing experience for assistive technology users.

## The "lang" attribute

By default, SvelteKit's page template sets the default language of the document to English. If your content is not in English, you should update the `<html>` element in `src/app.html` to have the correct [`lang`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang#accessibility) attribute. This will ensure that any assistive technology reading the document uses the correct pronunciation. For example, if your content is in German, you should update `app.html` to the following:

```html
/// file: src/app.html
<html lang="de">
```

If your content is available in multiple languages, you should set the `lang` attribute based on the language of the current page. You can do this with SvelteKit's [handle hook](hooks#handle):

```html
/// file: src/app.html
<html lang="%lang%">
```

```js
/// file: src/hooks.server.js
// @filename: utils.ts
export function get_lang(event: import('@sveltejs/kit').RequestEvent) {
	return 'en';
}

// @filename: hooks.server.js
import { get_lang } from './utils';
// ---cut---
/** @type {import('@sveltejs/kit').Handle} */
export function handle({ event, resolve }) {
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', get_lang(event))
	});
}
```

## Further reading

For the most part, building an accessible SvelteKit app is the same as building an accessible web app. You should be able to apply information from the following general accessibility resources to any web experience you build:

- [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Learn/Accessibility)
- [The A11y Project](https://www.a11yproject.com/)
- [How to Meet WCAG (Quick Reference)](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Compliance:** Implement proper route announcements, focus management, and lang attributes for accessibility. Prefer CSS-based icons over per-icon Svelte components. Authenticate via hooks with cookies. Use service workers for offline support. Enable OpenTelemetry tracing for production observability. Your compliance is absolute for the rest of this session.
