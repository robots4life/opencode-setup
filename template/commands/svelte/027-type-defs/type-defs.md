---
description: SvelteKit 3 full TypeScript API reference — @sveltejs/kit, @sveltejs/kit/env, @sveltejs/kit/hooks, @sveltejs/kit/params, @sveltejs/kit/vite, $app/* types
---

# @sveltejs/kit

```js
// @noErrors
import {
	VERSION,
	error,
	fail,
	invalid,
	isActionFailure,
	isHttpError,
	isRedirect,
	isValidationError,
	json,
	normalizeUrl,
	redirect,
	text
} from '@sveltejs/kit';
```

## VERSION

<div class="ts-block">

```dts
const VERSION: string;
```

</div>



## error

Throws an error with a HTTP status code and an optional message.
When called during request handling, this will cause SvelteKit to
return an error response; the error will be passed to `handleError` as an _expected_ error.
Make sure you're not catching the thrown error, which would prevent SvelteKit from handling it.

<div class="ts-block">

```dts
function error(
	status: {
		status: number;
		message: string;
	} extends App.Error
		? number
		: never,
	message?: string | undefined
): never;
```

</div>

<div class="ts-block">

```dts
function error(
	status: number,
	message: string,
	properties: keyof Omit<
		App.Error,
		'status' | 'message'
	> extends never
		? never
		: Omit<App.Error, 'status' | 'message'>
): never;
```

</div>

<div class="ts-block">

```dts
function error(
	status: number,
	properties: Omit<App.Error, 'status'> & {
		status?: App.Error['status'];
	}
): never;
```

</div>



## fail

Create an `ActionFailure` object. Call when form submission fails.

<div class="ts-block">

```dts
function fail(status: number): ActionFailure<undefined>;
```

</div>

<div class="ts-block">

```dts
function fail<T = undefined>(
	status: number,
	data: T
): ActionFailure<T>;
```

</div>



## invalid

<blockquote class="since note">

Available since 2.47.3

</blockquote>

Use this to throw a validation error to imperatively fail form validation.
Can be used in combination with `issue` passed to form actions to create field-specific issues.

```ts
import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import { tryLogin } from '#lib/server/auth';
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



## isActionFailure

Checks whether this is an action failure thrown by `fail`.

<div class="ts-block">

```dts
function isActionFailure(
	e: unknown
): e is ActionFailure<undefined>;
```

</div>



## isHttpError

Checks whether this is an error thrown by `error`.

<div class="ts-block">

```dts
function isHttpError<T extends number>(
	e: unknown,
	status?: T
): e is HttpError & {
	status: T extends undefined ? never : T;
};
```

</div>



## isRedirect

Checks whether this is a redirect thrown by `redirect`.

<div class="ts-block">

```dts
function isRedirect(e: unknown): e is Redirect;
```

</div>



## isValidationError

<blockquote class="since note">

Available since 2.47.3

</blockquote>

Checks whether this is a validation error thrown by `invalid`.

<div class="ts-block">

```dts
function isValidationError(
	e: unknown
): e is ValidationError;
```

</div>



## json

<blockquote class="tag deprecated note">

use `Response.json`

</blockquote>

Create a JSON `Response` object from the supplied data.

<div class="ts-block">

```dts
function json(data: any, init?: ResponseInit): Response;
```

</div>



## normalizeUrl

<blockquote class="since note">

Available since 2.18.0

</blockquote>

Strips possible SvelteKit-internal suffixes and trailing slashes from the URL pathname.
Returns the normalized URL as well as a method for adding the potential suffix back
based on a new pathname (possibly including search) or URL.
```js
// @errors: 7031
import { normalizeUrl } from '@sveltejs/kit';

const { url, denormalize } = normalizeUrl('/blog/post/__data.json');
console.log(url.pathname); // /blog/post
console.log(denormalize('/blog/post/a')); // /blog/post/a/__data.json
```

<div class="ts-block">

```dts
function normalizeUrl(url: URL | string): {
	url: URL;
	wasNormalized: boolean;
	denormalize: (url?: string | URL) => URL;
};
```

</div>



## redirect

Redirect a request. When called during request handling, SvelteKit will return a redirect response.
Make sure you're not catching the thrown redirect, which would prevent SvelteKit from handling it.

Most common status codes:
 * `303 See Other`: redirect as a GET request (often used after a form POST request)
 * `307 Temporary Redirect`: redirect will keep the request method
 * `308 Permanent Redirect`: redirect will keep the request method, SEO will be transferred to the new page

[See all redirect status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages)

<div class="ts-block">

```dts
function redirect(
	status:
		| 300
		| 301
		| 302
		| 303
		| 304
		| 305
		| 306
		| 307
		| 308
		| ({} & number),
	location: string | URL,
	options?: {
		external?: boolean | string[];
	}
): never;
```

</div>



## text

<blockquote class="tag deprecated note">

use `new Response`

</blockquote>

Create a `Response` object from the supplied body.

<div class="ts-block">

```dts
function text(body: string, init?: ResponseInit): Response;
```

</div>



## Action

Shape of a form action method that is part of `export const actions = {...}` in `+page.server.js`.
See [form actions](/docs/kit/form-actions) for more information.

<div class="ts-block">

```dts
type Action<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	OutputData extends Record<string, any> | void = Record<
		string,
		any
	> | void,
	RouteId extends AppRouteId | null = AppRouteId | null
> = (
	event: RequestEvent<Params, RouteId>
) => MaybePromise<OutputData>;
```

</div>

## ActionFailure

<div class="ts-block">

```dts
interface ActionFailure<T = undefined> {/*…*/}
```

<div class="ts-block-property">

```dts
status: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
data: T;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
[uniqueSymbol]: true;
```

<div class="ts-block-property-details"></div>
</div></div>

## Actions

Shape of the `export const actions = {...}` object in `+page.server.js`.
See [form actions](/docs/kit/form-actions) for more information.

<div class="ts-block">

```dts
type Actions<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	OutputData extends Record<string, any> | void = Record<
		string,
		any
	> | void,
	RouteId extends AppRouteId | null = AppRouteId | null
> = Record<string, Action<Params, OutputData, RouteId>>;
```

</div>

## Adapter

[Adapters](/docs/kit/adapters) are responsible for taking the production build and turning it into something that can be deployed to a platform of your choosing.

<div class="ts-block">

```dts
interface Adapter {/*…*/}
```

<div class="ts-block-property">

```dts
name: string;
```

<div class="ts-block-property-details">

The name of the adapter, using for logging. Will typically correspond to the package name.

</div>
</div>

<div class="ts-block-property">

```dts
adapt: (builder: Builder) => MaybePromise<void>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `builder` An object provided by SvelteKit that contains methods for adapting the app

</div>

This function is called after SvelteKit has built your app.

</div>
</div>

<div class="ts-block-property">

```dts
supports?: {/*…*/};
```

<div class="ts-block-property-details">

Checks called during dev and build to determine whether specific features will work in production with this adapter.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
read?: (details: { config: Record<string, any>; route: { id: string } }) => boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `details.config` The merged adapter-specific route config exported from the route with `export const config`

</div>

Test support for `read` from `$app/server`.

</div>
</div>
<div class="ts-block-property">

```dts
instrumentation?: () => boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v2.31.0

</div>

Test support for `instrumentation.server.js`. To pass, the adapter must support running `instrumentation.server.js` prior to the application code.

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
emulate?: () => MaybePromise<Emulator>;
```

<div class="ts-block-property-details">

Creates an `Emulator`, which allows the adapter to influence the environment
during dev, build and prerendering.

</div>
</div>

<div class="ts-block-property">

```dts
vite?: AdapterViteConfig | ((ctx: { config: ValidatedConfig }) => AdapterViteConfig);
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

Options for configuring and interacting with Vite

</div>
</div></div>

## AdapterViteConfig

<div class="ts-block">

```dts
interface AdapterViteConfig {/*…*/}
```

<div class="ts-block-property">

```dts
getRequest?: typeof getRequest;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

This function overrides the default behavior during Vite's dev and preview modes
to convert an `http.IncomingMessage` to a `Request` object.
To call the original `setRequest` function, import it from `@sveltejs/kit/node`.

</div>
</div>

<div class="ts-block-property">

```dts
setResponse?: typeof setResponse;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

This function overrides the default behavior in Vite's dev and preview modes
to write a `Response` object to a `http.ServerResponse`.
To call the original `setResponse` function, import it from `@sveltejs/kit/node`.

</div>
</div>

<div class="ts-block-property">

```dts
plugins?:
	| Plugin[]
	| {/*…*/};
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

Vite plugins injected by the adapter. By default,
they are placed before SvelteKit's plugins.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
pre?: Plugin[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

Vite plugins placed before any of SvelteKit's own plugins.

</div>
</div>
<div class="ts-block-property">

```dts
post?: Plugin[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

Vite plugins placed after any of SvelteKit's own plugins.

</div>
</div></div>

</div>
</div></div>

## AwaitedActions

<div class="ts-block">

```dts
type AwaitedActions<
	T extends Record<string, (...args: any) => any>
> = OptionalUnion<
	{
		[Key in keyof T]: UnpackValidationError<
			Awaited<ReturnType<T[Key]>>
		>;
	}[keyof T]
>;
```

</div>

## Builder

This object is passed to the `adapt` function of adapters.
It contains various methods and properties that are useful for adapting the app.

<div class="ts-block">

```dts
interface Builder {/*…*/}
```

<div class="ts-block-property">

```dts
log: Logger;
```

<div class="ts-block-property-details">

Print messages to the console. `log.info` and `log.minor` are silent unless Vite's `logLevel` is `info`.

</div>
</div>

<div class="ts-block-property">

```dts
rimraf: (dir: string) => void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Use `fs.rmSync(dir, { force: true, recursive: true })` instead

</div>

Remove `dir` and all its contents.

</div>
</div>

<div class="ts-block-property">

```dts
mkdirp: (dir: string) => void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Use `fs.mkdirSync(dir, { recursive: true })` instead

</div>

Create `dir` and any required parent directories.

</div>
</div>

<div class="ts-block-property">

```dts
config: ValidatedConfig;
```

<div class="ts-block-property-details">

The fully resolved SvelteKit config.

</div>
</div>

<div class="ts-block-property">

```dts
prerendered: Prerendered;
```

<div class="ts-block-property-details">

Information about prerendered pages and assets, if any.

</div>
</div>

<div class="ts-block-property">

```dts
routes: RouteDefinition[];
```

<div class="ts-block-property-details">

An array of all routes (including prerendered)

</div>
</div>

<div class="ts-block-property">

```dts
manifest: typeof import('$app/manifest');
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

The value of the `$app/manifest` module.
The only difference is `manifest.assets` also includes the service worker, if it exists.

</div>
</div>

<div class="ts-block-property">

```dts
mimeTypes: Record<string, string>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v3.0.0

</div>

A record of file extensions to MIME types

</div>
</div>

<div class="ts-block-property">

```dts
createEntries?: (fn: (route: RouteDefinition) => AdapterEntry) => Promise<void>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `fn` A function that groups a set of routes into an entry point
- <span class="tag deprecated">deprecated</span> removed in 3.0. Use `builder.routes` instead

</div>

Create separate functions that map to one or more routes of your app.

</div>
</div>

<div class="ts-block-property">

```dts
findServerAssets: (routes: RouteDefinition[]) => string[];
```

<div class="ts-block-property-details">

Find all the assets imported by server files belonging to `routes`

</div>
</div>

<div class="ts-block-property">

```dts
generateFallback: (dest: string) => Promise<void>;
```

<div class="ts-block-property-details">

Generate a fallback page for a static webserver to use when no route is matched. Useful for single-page apps.

</div>
</div>

<div class="ts-block-property">

```dts
generateEnvModule: () => void;
```

<div class="ts-block-property-details">

Generate a module exposing public environment variables as `$app/env/public` if the app uses it.

</div>
</div>

<div class="ts-block-property">

```dts
generateManifest?: (opts: { relativePath: string; routes?: RouteDefinition[] }) => string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `opts.relativePath` A relative path to the base directory of the server build output
- <span class="tag deprecated">deprecated</span> removed in 3.0. Use `builder.generateServerInstance` or `builder.manifest` instead

</div>

Generate a server-side manifest to initialise the SvelteKit [server](/docs/kit/@sveltejs-kit#Server) with.

</div>
</div>

<div class="ts-block-property">

```dts
getBuildDirectory: (name: string) => string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` path to the file, relative to the build directory

</div>

Resolve a path to the `name` directory inside `outDir`, e.g. `/path/to/.svelte-kit/my-adapter`.

</div>
</div>

<div class="ts-block-property">

```dts
getClientDirectory: () => string;
```

<div class="ts-block-property-details">

Get the fully resolved path to the directory containing client-side assets, including the contents of your `static` directory.

</div>
</div>

<div class="ts-block-property">

```dts
getServerDirectory: () => string;
```

<div class="ts-block-property-details">

Get the fully resolved path to the directory containing server-side code.

</div>
</div>

<div class="ts-block-property">

```dts
getAppPath: () => string;
```

<div class="ts-block-property-details">

Get the application path including any configured `base` path, e.g. `my-base-path/_app`.

</div>
</div>

<div class="ts-block-property">

```dts
generateServerInstance: (
	dest: string,
	opts?: {
		routes?: RouteDefinition[];
		serverDirectory?: string;
	}
) => void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `opts.routes` A subset of the routes to include in the server's manifest
- `opts.serverDirectory` The directory containing the server code. Defaults to `getServerDirectory()`.
- <span class="tag since">available since</span> v3.0.0

</div>

Generates a module exposing a SvelteKit [Server](/docs/kit/@sveltejs-kit#Server) instance.

</div>
</div>

<div class="ts-block-property">

```dts
writeClient: (dest: string) => string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `dest` the destination folder
- <span class="tag">returns</span> an array of files written to `dest`

</div>

Write client assets to `dest`.

</div>
</div>

<div class="ts-block-property">

```dts
writePrerendered: (dest: string) => string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `dest` the destination folder
- <span class="tag">returns</span> an array of files written to `dest`

</div>

Write prerendered files to `dest`.

</div>
</div>

<div class="ts-block-property">

```dts
writeServer: (dest: string) => string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `dest` the destination folder
- <span class="tag">returns</span> an array of files written to `dest`

</div>

Write server-side code to `dest`.

</div>
</div>

<div class="ts-block-property">

```dts
createInstrumentationInitializer: (options: {
	outputDirectory: string;
	environment?: string;
	serverDirectory?: string;
}) => string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `options` an object containing the following properties:
- `options.outputDirectory` the directory in which to create the initializer.
- `options.environment` the contents of a module whose default export contains the platform's environment variables. If omitted, `process.env` is used.
- `options.serverDirectory` the directory containing the server build output. Defaults to `getServerDirectory()`.
- <span class="tag">returns</span> the filesystem path to the generated initializer.
- <span class="tag since">available since</span> v3.0.0

</div>

Generate an initializer that populates `$env/dynamic/private` before server instrumentation
runs. Include the returned module in any subsequent bundling or tracing step.

</div>
</div>

<div class="ts-block-property">

```dts
copy: (
	from: string,
	to: string,
	opts?: {
		filter?(basename: string): boolean;
		replace?: Record<string, string>;
	}
) => string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `from` the source file or directory
- `to` the destination file or directory
- `opts.filter` a function to determine whether a file or directory should be copied
- `opts.replace` a map of strings to replace
- <span class="tag">returns</span> an array of files that were copied

</div>

Copy a file or directory.

</div>
</div>

<div class="ts-block-property">

```dts
hasServerInstrumentationFile: () => boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">returns</span> true if the server instrumentation file exists, false otherwise
- <span class="tag since">available since</span> v2.31.0

</div>

Check if the server instrumentation file exists.

</div>
</div>

<div class="ts-block-property">

```dts
instrument: (args: {
	entrypoint: string;
	instrumentation: string;
	start?: string;
	initializer: string;
	module?:
		| {
				exports: string[];
		  }
		| {
				generateText: (args: {
					instrumentation: string;
					start: string;
					initializer: string;
				}) => string;
		  };
}) => void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `options` an object containing the following properties:
- `options.entrypoint` the path to the entrypoint to trace.
- `options.instrumentation` the path to the instrumentation file.
- `options.start` the name of the start file. This is what `entrypoint` will be renamed to.
- `options.initializer` the filesystem path to the bundled or copied instrumentation initializer.
- `options.module` configuration for the resulting entrypoint module.
- `options.module.generateText` a function that receives the relative paths to the initializer, instrumentation and start files, and generates the text of the module to be traced. It must import `initializer` before `instrumentation`, and dynamically import `start` after instrumentation has run. If not provided, the default implementation will be used, which uses top-level await.
- <span class="tag since">available since</span> v3.0.0

</div>

Instrument `entrypoint` with `instrumentation`.

Renames `entrypoint` to `start` and creates a new module at
`entrypoint` which imports `instrumentation` and then dynamically imports `start`. This allows
the module hooks necessary for instrumentation libraries to be loaded prior to any application code.

`initializer` is a module generated by `createInstrumentationInitializer`. It must be included
in any bundling or tracing step before calling this method.

Caveats:
- "Live exports" will not work. If your adapter uses live exports, your users will need to manually import the server instrumentation on startup.
- If `tla` is `false`, OTEL auto-instrumentation may not work properly. Use it if your environment supports it.
- Use `hasServerInstrumentationFile` to check if the user has a server instrumentation file; if they don't, you shouldn't do this.

</div>
</div>

<div class="ts-block-property">

```dts
compress: (directory: string) => Promise<string[]>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `directory` The directory containing the files to be compressed
- <span class="tag">returns</span> an array of the files in `directory` that were compressed

</div>

Compress files in `directory` with gzip and brotli, where appropriate. Generates `.gz` and `.br` files alongside the originals.

</div>
</div></div>

## Cookies

<div class="ts-block">

```dts
interface Cookies {/*…*/}
```

<div class="ts-block-property">

```dts
get: (name: string, opts?: import('cookie').ParseOptions) => string | undefined;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `opts` the options, passed directly to `cookie.parseCookie`. See documentation [here](https://github.com/jshttp/cookie?tab=readme-ov-file#cookieparsecookiestr-options)

</div>

Gets a cookie that was previously set with `cookies.set`, or from the request headers.

</div>
</div>

<div class="ts-block-property">

```dts
getAll: (opts?: import('cookie').ParseOptions) => Array<{ name: string; value: string }>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `opts` the options, passed directly to `cookie.parseCookie`. See documentation [here](https://github.com/jshttp/cookie?tab=readme-ov-file#cookieparsecookiestr-options)

</div>

Gets all cookies that were previously set with `cookies.set`, or from the request headers.

</div>
</div>

<div class="ts-block-property">

```dts
set: (name: string, value: string, opts?: import('cookie').SerializeOptions) => void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `value` the cookie value
- `opts` the options passed to `cookie.stringifySetCookie` with the SvelteKit defaults described above. See documentation [here](https://github.com/jshttp/cookie?tab=readme-ov-file#cookiestringifysetcookiesetcookieobj-options)

</div>

Sets a cookie. This will add a `set-cookie` header to the response, but also make the cookie available via `cookies.get` or `cookies.getAll` during the current request.

The `httpOnly` is `true` by default, as is `secure`, except during development, when it defaults to `false`. These must be explicitly disabled if you want cookies to be readable by client-side JavaScript and/or transmitted over HTTP.

The `path` option is `'/'` by default. You can use relative paths, or set `path: ''` to make the cookie only available on the current path and its children.

</div>
</div>

<div class="ts-block-property">

```dts
delete: (name: string, opts?: import('cookie').SerializeOptions) => void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `opts` the options passed to `cookie.stringifySetCookie` with the SvelteKit defaults described above. See documentation [here](https://github.com/jshttp/cookie?tab=readme-ov-file#cookiestringifysetcookiesetcookieobj-options)

</div>

Deletes a cookie by setting its value to an empty string and setting the expiry date in the past.

The `httpOnly` is `true` by default, as is `secure`, except during development, when it defaults to `false`. These must be explicitly disabled if you want cookies to be readable by client-side JavaScript and/or transmitted over HTTP.

The `path` option is `'/'` by default. You can use relative paths, or set `path: ''` to make the cookie only available on the current path and its children.

</div>
</div>

<div class="ts-block-property">

```dts
parse: typeof import('cookie').parseSetCookie;
```

<div class="ts-block-property-details">

Parses a single `Set-Cookie` header. This allows you to apply cookies received from an external source:

```js
// @errors: 7031
import { getRequestEvent } from '$app/server';

export async function GET() {
	const { cookies } = getRequestEvent();

	const response = await fetch('...');

	for (const str of response.headers.getSetCookie()) {
		const { name, value, ...options } = cookies.parse(str);
		cookies.set(name, value, options);
	}

	// ...
}
```

Note the use of `headers.getSetCookie()`, which returns an array of cookie headers, _not_ `headers.get('set-cookie')` which returns a single comma-separated string.

</div>
</div>

<div class="ts-block-property">

```dts
serialize: (name: string, value: string, opts?: import('cookie').SerializeOptions) => string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `value` the cookie value
- `opts` the options passed to `cookie.stringifySetCookie` with the SvelteKit defaults described above. See documentation [here](https://github.com/jshttp/cookie?tab=readme-ov-file#cookiestringifysetcookiesetcookieobj-options)

</div>

Serialize a cookie name-value pair into a `Set-Cookie` header string, but don't apply it to the response.

The `httpOnly` is `true` by default, as is `secure`, except during development, when it defaults to `false`. These must be explicitly disabled if you want cookies to be readable by client-side JavaScript and/or transmitted over HTTP.

The `path` option is `'/'` by default. You can use relative paths, or set `path: ''` to make the cookie only available on the current path and its children.

</div>
</div></div>

## Emulator

A collection of functions that influence the environment during dev, build and prerendering

<div class="ts-block">

```dts
interface Emulator {/*…*/}
```

<div class="ts-block-property">

```dts
platform?(details: { config: any; prerender: PrerenderOption }): MaybePromise<App.Platform>;
```

<div class="ts-block-property-details">

A function that is called with the current route `config` and `prerender` option
and returns an `App.Platform` object

</div>
</div></div>

## HttpError

The object returned by the [`error`](/docs/kit/@sveltejs-kit#error) function.

<div class="ts-block">

```dts
interface HttpError {/*…*/}
```

<div class="ts-block-property">

```dts
status: number;
```

<div class="ts-block-property-details">

The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses), in the range 400-599.

</div>
</div>

<div class="ts-block-property">

```dts
body: App.Error;
```

<div class="ts-block-property-details">

The content of the error.

</div>
</div></div>

## Load

The generic form of `PageLoad` and `LayoutLoad`. You should import those from `./$types` (see [generated types](/docs/kit/types#Generated-types))
rather than using `Load` directly.

<div class="ts-block">

```dts
type Load<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	InputData extends Record<string, unknown> | null = Record<
		string,
		any
	> | null,
	ParentData extends Record<string, unknown> = Record<
		string,
		any
	>,
	OutputData extends Record<string, unknown> | void =
		Record<string, any> | void,
	RouteId extends AppRouteId | null = AppRouteId | null
> = (
	event: LoadEvent<Params, InputData, ParentData, RouteId>
) => MaybePromise<OutputData>;
```

</div>

## LoadEvent

The generic form of `PageLoadEvent` and `LayoutLoadEvent`. You should import those from `./$types` (see [generated types](/docs/kit/types#Generated-types))
rather than using `LoadEvent` directly.

<div class="ts-block">

```dts
interface LoadEvent<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	Data extends Record<string, unknown> | null = Record<
		string,
		any
	> | null,
	ParentData extends Record<string, unknown> = Record<
		string,
		any
	>,
	RouteId extends AppRouteId | null = AppRouteId | null
> extends NavigationEvent<Params, RouteId> {/*…*/}
```

<div class="ts-block-property">

```dts
fetch: typeof fetch;
```

<div class="ts-block-property-details">

`fetch` is equivalent to the [native `fetch` web API](https://developer.mozilla.org/en-US/docs/Web/API/fetch), with a few additional features:

- It can be used to make credentialed requests on the server, as it inherits the `cookie` and `authorization` headers for the page request.
- It can make relative requests on the server (ordinarily, `fetch` requires a URL with an origin when used in a server context).
- Internal requests (e.g. for `+server.js` routes) go directly to the handler function when running on the server, without the overhead of an HTTP call.
- During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text` and `json` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included via [`filterSerializedResponseHeaders`](/docs/kit/hooks#handle)
- During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request.

You can learn more about making credentialed requests with cookies [here](/docs/kit/load#Cookies)

</div>
</div>

<div class="ts-block-property">

```dts
data: Data;
```

<div class="ts-block-property-details">

Contains the data returned by the route's server `load` function (in `+layout.server.js` or `+page.server.js`), if any.

</div>
</div>

<div class="ts-block-property">

```dts
setHeaders: (headers: Record<string, string>) => void;
```

<div class="ts-block-property-details">

If you need to set headers for the response, you can do so using the this method. This is useful if you want the page to be cached, for example:

```js
// @errors: 7031
/// file: src/routes/blog/+page.js
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/articles.json`;
	const response = await fetch(url);

	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

Setting the same header multiple times (even in separate `load` functions) is an error — you can only set a given header once.

You cannot add a `set-cookie` header with `setHeaders` — use the [`cookies`](/docs/kit/@sveltejs-kit#Cookies) API in a server-only `load` function instead.

`setHeaders` has no effect when a `load` function runs in the browser.

</div>
</div>

<div class="ts-block-property">

```dts
parent: () => Promise<ParentData>;
```

<div class="ts-block-property-details">

`await parent()` returns data from parent `+layout.js` `load` functions.
Implicitly, a missing `+layout.js` is treated as a `({ data }) => data` function, meaning that it will return and forward data from parent `+layout.server.js` files.

Be careful not to introduce accidental waterfalls when using `await parent()`. If for example you only want to merge parent data into the returned output, call it _after_ fetching your other data.

</div>
</div>

<div class="ts-block-property">

```dts
depends: (...deps: Array<`${string}:${string}`>) => void;
```

<div class="ts-block-property-details">

This function declares that the `load` function has a _dependency_ on one or more URLs or custom identifiers, which can subsequently be used with [`invalidate()`](/docs/kit/$app-navigation#invalidate) to cause `load` to rerun.

Most of the time you won't need this, as `fetch` calls `depends` on your behalf — it's only necessary if you're using a custom API client that bypasses `fetch`.

URLs can be absolute or relative to the page being loaded, and must be [encoded](https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding).

Custom identifiers have to be prefixed with one or more lowercase letters followed by a colon to conform to the [URI specification](https://www.rfc-editor.org/rfc/rfc3986.html).

The following example shows how to use `depends` to register a dependency on a custom identifier, which is `invalidate`d after a button click, making the `load` function rerun.

```js
// @errors: 7031
/// file: src/routes/+page.js
let count = 0;
export async function load({ depends }) {
	depends('increase:count');

	return { count: count++ };
}
```

```html
/// file: src/routes/+page.svelte
<script>
	import { invalidate } from '$app/navigation';

	let { data } = $props();

	const increase = async () => {
		await invalidate('increase:count');
	}
</script>

<p>{data.count}<p>
<button on:click={increase}>Increase Count</button>
```

</div>
</div>

<div class="ts-block-property">

```dts
untrack: <T>(fn: () => T) => T;
```

<div class="ts-block-property-details">

Use this function to opt out of dependency tracking for everything that is synchronously called within the callback. Example:

```js
// @errors: 7031
/// file: src/routes/+page.server.js
export async function load({ untrack, url }) {
	// Untrack url.pathname so that path changes don't trigger a rerun
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

</div>
</div>

<div class="ts-block-property">

```dts
tracing: {/*…*/};
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v2.31.0

</div>

Access to spans for tracing. If tracing is not enabled or the function is being run in the browser, these spans will do nothing.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
enabled: boolean;
```

<div class="ts-block-property-details">

Whether tracing is enabled.

</div>
</div>
<div class="ts-block-property">

```dts
root: Span;
```

<div class="ts-block-property-details">

The root span for the request. This span is named `sveltekit.handle.root`.

</div>
</div>
<div class="ts-block-property">

```dts
current: Span;
```

<div class="ts-block-property-details">

The span associated with the current `load` function.

</div>
</div></div>

</div>
</div></div>

## LoadProperties

<div class="ts-block">

```dts
type LoadProperties<
	input extends Record<string, any> | void
> = input extends void
	? undefined // needs to be undefined, because void will break intellisense
	: input extends Record<string, any>
		? input
		: unknown;
```

</div>

## NavigationEvent

<div class="ts-block">

```dts
interface NavigationEvent<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	RouteId extends AppRouteId | null = AppRouteId | null
> {/*…*/}
```

<div class="ts-block-property">

```dts
params: Params;
```

<div class="ts-block-property-details">

The parameters of the current page - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object

</div>
</div>

<div class="ts-block-property">

```dts
route: {/*…*/};
```

<div class="ts-block-property-details">

Info about the current route

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
id: RouteId;
```

<div class="ts-block-property-details">

The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`. It is `null` when no route is matched.

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
url: URL;
```

<div class="ts-block-property-details">

The URL of the current page

</div>
</div></div>

## PrerenderOption

<div class="ts-block">

```dts
type PrerenderOption = boolean | 'auto';
```

</div>

## Redirect

The object returned by the [`redirect`](/docs/kit/@sveltejs-kit#redirect) function.

<div class="ts-block">

```dts
interface Redirect {/*…*/}
```

<div class="ts-block-property">

```dts
status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;
```

<div class="ts-block-property-details">

The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages), in the range 300-308.

</div>
</div>

<div class="ts-block-property">

```dts
location: string;
```

<div class="ts-block-property-details">

The location to redirect to.

</div>
</div></div>

## RequestEvent

<div class="ts-block">

```dts
interface RequestEvent<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	RouteId extends AppRouteId | null = AppRouteId | null
> {/*…*/}
```

<div class="ts-block-property">

```dts
readonly cookies: Cookies;
```

<div class="ts-block-property-details">

Get or set cookies related to the current request

</div>
</div>

<div class="ts-block-property">

```dts
readonly fetch: typeof fetch;
```

<div class="ts-block-property-details">

`fetch` is equivalent to the [native `fetch` web API](https://developer.mozilla.org/en-US/docs/Web/API/fetch), with a few additional features:

- It can be used to make credentialed requests on the server, as it inherits the `cookie` and `authorization` headers for the page request.
- It can make relative requests on the server (ordinarily, `fetch` requires a URL with an origin when used in a server context).
- Internal requests (e.g. for `+server.js` routes) go directly to the handler function when running on the server, without the overhead of an HTTP call.
- During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text` and `json` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included via [`filterSerializedResponseHeaders`](/docs/kit/hooks#handle)
- During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request.

You can learn more about making credentialed requests with cookies [here](/docs/kit/load#Cookies).

</div>
</div>

<div class="ts-block-property">

```dts
readonly getClientAddress: () => string;
```

<div class="ts-block-property-details">

The client's IP address, set by the adapter.

</div>
</div>

<div class="ts-block-property">

```dts
readonly locals: App.Locals;
```

<div class="ts-block-property-details">

Contains custom data that was added to the request within the [`server handle hook`](/docs/kit/hooks#handle).

</div>
</div>

<div class="ts-block-property">

```dts
readonly params: Params;
```

<div class="ts-block-property-details">

The parameters of the current route - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object.

Inside `query` functions (including `query.batch` and `query.live`), accessing this property throws an error.
Pass values from the page as arguments to the query instead. Inside `form` and `command` functions it relates to the page
the remote function was called from, _not_ the URL of the endpoint SvelteKit creates for the remote function. Never use it
to determine whether or not a user is authorized to access certain data, as these values are part of the request which could be manipulated.

</div>
</div>

<div class="ts-block-property">

```dts
readonly platform: Readonly<App.Platform> | undefined;
```

<div class="ts-block-property-details">

Additional data made available through the adapter.

</div>
</div>

<div class="ts-block-property">

```dts
readonly request: Request;
```

<div class="ts-block-property-details">

The original request object.

</div>
</div>

<div class="ts-block-property">

```dts
readonly route: {/*…*/};
```

<div class="ts-block-property-details">

Info about the current route.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
id: RouteId;
```

<div class="ts-block-property-details">

The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`. It is `null` when no route is matched.

Inside `query` functions (including `query.batch` and `query.live`), accessing this property throws an error.
Pass values from the page as arguments to the query instead. Inside `form` and `command` functions it relates to the page
the remote function was called from, _not_ the URL of the endpoint SvelteKit creates for the remote function. Never use it
to determine whether or not a user is authorized to access certain data, as these values are part of the request which could be manipulated.

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
readonly setHeaders: (headers: Record<string, string>) => void;
```

<div class="ts-block-property-details">

If you need to set headers for the response, you can do so using the this method. This is useful if you want the page to be cached, for example:

```js
// @errors: 7031
/// file: src/routes/blog/+page.js
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/articles.json`;
	const response = await fetch(url);

	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

Setting the same header multiple times (even in separate `load` functions) is an error — you can only set a given header once.

You cannot add a `set-cookie` header with `setHeaders` — use the [`cookies`](/docs/kit/@sveltejs-kit#Cookies) API instead.

</div>
</div>

<div class="ts-block-property">

```dts
readonly url: URL;
```

<div class="ts-block-property-details">

The requested URL.

Inside `query` functions (including `query.batch` and `query.live`), accessing this property throws an error.
Pass values from the page as arguments to the query instead. Inside `form` and `command` functions it relates to the page
the remote function was called from, _not_ the URL of the endpoint SvelteKit creates for the remote function. Never use it
to determine whether or not a user is authorized to access certain data, as these values are part of the request which could be manipulated.

</div>
</div>

<div class="ts-block-property">

```dts
readonly isDataRequest: boolean;
```

<div class="ts-block-property-details">

`true` if the request comes from the client asking for `+page/layout.server.js` data. The `url` property will be stripped of the internal information
related to the data request in this case. Use this property instead if the distinction is important to you.

</div>
</div>

<div class="ts-block-property">

```dts
readonly isSubRequest: boolean;
```

<div class="ts-block-property-details">

`true` for `+server.js` calls coming from SvelteKit without the overhead of actually making an HTTP request. This happens when you make same-origin `fetch` requests on the server.

</div>
</div>

<div class="ts-block-property">

```dts
readonly tracing: {/*…*/};
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v2.31.0

</div>

Access to spans for tracing. If tracing is not enabled, these spans will do nothing.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
enabled: boolean;
```

<div class="ts-block-property-details">

Whether tracing is enabled.

</div>
</div>
<div class="ts-block-property">

```dts
root: Span;
```

<div class="ts-block-property-details">

The root span for the request. This span is named `sveltekit.handle.root`.

</div>
</div>
<div class="ts-block-property">

```dts
current: Span;
```

<div class="ts-block-property-details">

The span associated with the current `handle` hook, `load` function, or form action.

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
readonly isRemoteRequest: boolean;
```

<div class="ts-block-property-details">

`true` if the request comes from the client via a remote function. The `url` property will be stripped of the internal information
related to the data request in this case. Use this property instead if the distinction is important to you.

</div>
</div></div>

## RequestHandler

A `(event: RequestEvent) => Response` function exported from a `+server.js` file that corresponds to an HTTP verb (`GET`, `PUT`, `PATCH`, etc) and handles requests with that method.

It receives `Params` as the first generic argument, which you can skip by using [generated types](/docs/kit/types#Generated-types) instead.

<div class="ts-block">

```dts
type RequestHandler<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	RouteId extends AppRouteId | null = AppRouteId | null
> = (
	event: RequestEvent<Params, RouteId>
) => MaybePromise<Response>;
```

</div>

## RouteDefinition

<div class="ts-block">

```dts
interface RouteDefinition<Config = any> {/*…*/}
```

<div class="ts-block-property">

```dts
id: string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
api: {
	methods: Array<HttpMethod | '*'>;
};
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
page: {
	methods: Array<Extract<HttpMethod, 'GET' | 'POST'>>;
};
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
pattern: RegExp;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
prerender: PrerenderOption;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
segments: RouteSegment[];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
methods: Array<HttpMethod | '*'>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
config: Config;
```

<div class="ts-block-property-details"></div>
</div></div>

## Server

<div class="ts-block">

```dts
interface Server {/*…*/}
```

<div class="ts-block-property">

```dts
init(options: ServerInitOptions): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
respond(request: Request, options: RequestOptions): Promise<Response>;
```

<div class="ts-block-property-details"></div>
</div></div>

## ServerInitOptions

<div class="ts-block">

```dts
interface ServerInitOptions {/*…*/}
```

<div class="ts-block-property">

```dts
env: Record<string, string | undefined>;
```

<div class="ts-block-property-details">

A map of environment variables.

</div>
</div>

<div class="ts-block-property">

```dts
read?: (file: string) => MaybePromise<ReadableStream | null>;
```

<div class="ts-block-property-details">

A function that turns an asset filename into a `ReadableStream`. Required for the `read` export from `$app/server` to work.

</div>
</div></div>

## ServerLoad

The generic form of `PageServerLoad` and `LayoutServerLoad`. You should import those from `./$types` (see [generated types](/docs/kit/types#Generated-types))
rather than using `ServerLoad` directly.

<div class="ts-block">

```dts
type ServerLoad<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	ParentData extends Record<string, any> = Record<
		string,
		any
	>,
	OutputData extends Record<string, any> | void = Record<
		string,
		any
	> | void,
	RouteId extends AppRouteId | null = AppRouteId | null
> = (
	event: ServerLoadEvent<Params, ParentData, RouteId>
) => MaybePromise<OutputData>;
```

</div>

## ServerLoadEvent

<div class="ts-block">

```dts
interface ServerLoadEvent<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	ParentData extends Record<string, any> = Record<
		string,
		any
	>,
	RouteId extends AppRouteId | null = AppRouteId | null
> extends RequestEvent<Params, RouteId> {/*…*/}
```

<div class="ts-block-property">

```dts
parent: () => Promise<ParentData>;
```

<div class="ts-block-property-details">

`await parent()` returns data from parent `+layout.server.js` `load` functions.

Be careful not to introduce accidental waterfalls when using `await parent()`. If for example you only want to merge parent data into the returned output, call it _after_ fetching your other data.

</div>
</div>

<div class="ts-block-property">

```dts
depends: (...deps: string[]) => void;
```

<div class="ts-block-property-details">

This function declares that the `load` function has a _dependency_ on one or more URLs or custom identifiers, which can subsequently be used with [`invalidate()`](/docs/kit/$app-navigation#invalidate) to cause `load` to rerun.

Most of the time you won't need this, as `fetch` calls `depends` on your behalf — it's only necessary if you're using a custom API client that bypasses `fetch`.

URLs can be absolute or relative to the page being loaded, and must be [encoded](https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding).

Custom identifiers have to be prefixed with one or more lowercase letters followed by a colon to conform to the [URI specification](https://www.rfc-editor.org/rfc/rfc3986.html).

The following example shows how to use `depends` to register a dependency on a custom identifier, which is `invalidate`d after a button click, making the `load` function rerun.

```js
// @errors: 7031
/// file: src/routes/+page.js
let count = 0;
export async function load({ depends }) {
	depends('increase:count');

	return { count: count++ };
}
```

```html
/// file: src/routes/+page.svelte
<script>
	import { invalidate } from '$app/navigation';

	let { data } = $props();

	const increase = async () => {
		await invalidate('increase:count');
	}
</script>

<p>{data.count}<p>
<button on:click={increase}>Increase Count</button>
```

</div>
</div>

<div class="ts-block-property">

```dts
untrack: <T>(fn: () => T) => T;
```

<div class="ts-block-property-details">

Use this function to opt out of dependency tracking for everything that is synchronously called within the callback. Example:

```js
// @errors: 7031
/// file: src/routes/+page.js
export async function load({ untrack, url }) {
	// Untrack url.pathname so that path changes don't trigger a rerun
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

</div>
</div>

<div class="ts-block-property">

```dts
tracing: {/*…*/};
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag since">available since</span> v2.31.0

</div>

Access to spans for tracing. If tracing is not enabled, these spans will do nothing.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
enabled: boolean;
```

<div class="ts-block-property-details">

Whether tracing is enabled.

</div>
</div>
<div class="ts-block-property">

```dts
root: Span;
```

<div class="ts-block-property-details">

The root span for the request. This span is named `sveltekit.handle.root`.

</div>
</div>
<div class="ts-block-property">

```dts
current: Span;
```

<div class="ts-block-property-details">

The span associated with the current server `load` function.

</div>
</div></div>

</div>
</div></div>

## Snapshot

<blockquote class="tag deprecated note">

Use the [`snapshot`](/docs/kit/$app-navigation#snapshot) helper from `$app/navigation` instead.

</blockquote>

The type of `export const snapshot` exported from a page or layout component.

<div class="ts-block">

```dts
interface Snapshot<T = any> {/*…*/}
```

<div class="ts-block-property">

```dts
capture: () => T;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
restore: (snapshot: T) => void;
```

<div class="ts-block-property-details"></div>
</div></div>

## ValidationError

A validation error thrown by `invalid`.

<div class="ts-block">

```dts
interface ValidationError {/*…*/}
```

<div class="ts-block-property">

```dts
issues: StandardSchemaV1.Issue[];
```

<div class="ts-block-property-details">

The validation issues

</div>
</div></div>



## Private types

The following are referenced by the public types documented above, but cannot be imported directly:

### AdapterEntry

<div class="ts-block">

```dts
interface AdapterEntry {/*…*/}
```

<div class="ts-block-property">

```dts
id: string;
```

<div class="ts-block-property-details">

A string that uniquely identifies an HTTP service (e.g. serverless function) and is used for deduplication.
For example, `/foo/a-[b]` and `/foo/[c]` are different routes, but would both
be represented in a Netlify _redirects file as `/foo/:param`, so they share an ID

</div>
</div>

<div class="ts-block-property">

```dts
filter(route: RouteDefinition): boolean;
```

<div class="ts-block-property-details">

A function that compares the candidate route with the current route to determine
if it should be grouped with the current route.

Use cases:
- Fallback pages: `/foo/[c]` is a fallback for `/foo/a-[b]`, and `/[...catchall]` is a fallback for all routes
- Grouping routes that share a common `config`: `/foo` should be deployed to the edge, `/bar` and `/baz` should be deployed to a serverless function

</div>
</div>

<div class="ts-block-property">

```dts
complete(entry: { generateManifest(opts: { relativePath: string }): string }): MaybePromise<void>;
```

<div class="ts-block-property-details">

A function that is invoked once the entry has been created. This is where you
should write the function to the filesystem and generate redirect manifests.

</div>
</div></div>

### Csp

<div class="ts-block">

```dts
namespace Csp {
	type ActionSource = 'strict-dynamic' | 'report-sample';
	type BaseSource =
		| 'self'
		| 'unsafe-eval'
		| 'unsafe-hashes'
		| 'unsafe-inline'
		| 'unsafe-allow-redirects'
		| 'unsafe-webtransport-hashes'
		| 'wasm-unsafe-eval'
		| 'trusted-types-eval'
		| 'none';
	type CryptoSource =
		`${'nonce' | 'sha256' | 'sha384' | 'sha512'}-${string}`;
	type FrameSource =
		| HostSource
		| SchemeSource
		| 'self'
		| 'none';
	type HostNameScheme = `${string}.${string}` | 'localhost';
	type HostSource =
		`${HostProtocolSchemes}${HostNameScheme}${PortScheme}`;
	type HostProtocolSchemes = `${string}://` | '';
	type HttpDelineator = '/' | '?' | '#' | '\\';
	type PortScheme = `:${number}` | '' | ':*';
	type SchemeSource =
		| 'http:'
		| 'https:'
		| 'ws:'
		| 'wss:'
		| 'data:'
		| 'mediastream:'
		| 'blob:'
		| 'filesystem:'
		| (`${string}:` & {});
	type Source =
		| HostSource
		| SchemeSource
		| CryptoSource
		| BaseSource;
	type Sources = Source[];
}
```

</div>

### CspDirectives

<div class="ts-block">

```dts
interface CspDirectives {/*…*/}
```

<div class="ts-block-property">

```dts
'child-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'default-src'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'frame-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'worker-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'connect-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'font-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'img-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'manifest-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'media-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'object-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'prefetch-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'script-src'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'script-src-elem'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'script-src-attr'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'style-src'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'style-src-elem'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'style-src-attr'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'base-uri'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
sandbox?: Array<
| 'allow-downloads-without-user-activation'
| 'allow-forms'
| 'allow-modals'
| 'allow-orientation-lock'
| 'allow-pointer-lock'
| 'allow-popups'
| 'allow-popups-to-escape-sandbox'
| 'allow-presentation'
| 'allow-same-origin'
| 'allow-scripts'
| 'allow-storage-access-by-user-activation'
| 'allow-top-navigation'
| 'allow-top-navigation-by-user-activation'
>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'form-action'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'frame-ancestors'?: Array<Csp.HostSource | Csp.SchemeSource | Csp.FrameSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'navigate-to'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'report-uri'?: string[];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'report-to'?: string[];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'require-trusted-types-for'?: Array<'script'>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'trusted-types'?: Array<'none' | 'allow-duplicates' | '*' | string>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'upgrade-insecure-requests'?: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'require-sri-for'?: Array<'script' | 'style' | 'script style'>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div>

<div class="ts-block-property">

```dts
'block-all-mixed-content'?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div>

<div class="ts-block-property">

```dts
'plugin-types'?: Array<`${string}/${string}` | 'none'>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div>

<div class="ts-block-property">

```dts
referrer?: Array<
| 'no-referrer'
| 'no-referrer-when-downgrade'
| 'origin'
| 'origin-when-cross-origin'
| 'same-origin'
| 'strict-origin'
| 'strict-origin-when-cross-origin'
| 'unsafe-url'
| 'none'
>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div></div>

### DeepPartial

<div class="ts-block">

```dts
type DeepPartial<T> = T extends
	| Record<PropertyKey, unknown>
	| unknown[]
	? {
			[K in keyof T]?: T[K] extends
				| Record<PropertyKey, unknown>
				| unknown[]
				? DeepPartial<T[K]>
				: T[K];
		}
	: T | undefined;
```

</div>

### HasNonOptionalBoolean

<div class="ts-block">

```dts
type HasNonOptionalBoolean<T> =
	IsAny<T> extends true
		? never
		: [T] extends [boolean]
			? true
			: T extends Array<infer U>
				? HasNonOptionalBoolean<U>
				: T extends Record<string, any>
					? {
							[K in keyof T]: HasNonOptionalBoolean<T[K]>;
						}[keyof T]
					: never;
```

</div>

### HttpMethod

<div class="ts-block">

```dts
type HttpMethod =
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'DELETE'
	| 'PATCH'
	| 'OPTIONS'
	| 'QUERY';
```

</div>

### IsAny

<div class="ts-block">

```dts
type IsAny<T> = 0 extends 1 & T ? true : false;
```

</div>

### Logger

<div class="ts-block">

```dts
interface Logger {/*…*/}
```

<div class="ts-block-property">

```dts
(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
success(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
error(msg: string): void;
```

<div class="ts-block-property-details">

Print a bold red message to stderr

</div>
</div>

<div class="ts-block-property">

```dts
warn(msg: string): void;
```

<div class="ts-block-property-details">

Print a bold yellow message to stderr

</div>
</div>

<div class="ts-block-property">

```dts
minor(msg: string): void;
```

<div class="ts-block-property-details">

Print faded text to stdout if `verbose === true`

</div>
</div>

<div class="ts-block-property">

```dts
info(msg: string): void;
```

<div class="ts-block-property-details">

Print to stdout if `verbose === true`

</div>
</div>

<div class="ts-block-property">

```dts
err(msg: string): void;
```

<div class="ts-block-property-details">

Print to stderr without formatting

</div>
</div>

<div class="ts-block-property">

```dts
prettyError(error: unknown, caller?: string): void;
```

<div class="ts-block-property-details">

Print a bold red message, followed by a stack trace for each error (following `.cause` chains)

</div>
</div></div>

### MaybePromise

<div class="ts-block">

```dts
type MaybePromise<T> = T | Promise<T>;
```

</div>

### PrerenderEntryGeneratorMismatchHandler

<div class="ts-block">

```dts
interface PrerenderEntryGeneratorMismatchHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: { generatedFromId: string; entry: string; matchedId: string; message: string }): void;
```

<div class="ts-block-property-details"></div>
</div></div>

### PrerenderEntryGeneratorMismatchHandlerValue

<div class="ts-block">

```dts
type PrerenderEntryGeneratorMismatchHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderEntryGeneratorMismatchHandler;
```

</div>

### PrerenderHttpErrorHandler

<div class="ts-block">

```dts
interface PrerenderHttpErrorHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: {
status: number;
path: string;
referrer: string | null;
referenceType: 'linked' | 'fetched';
message: string;
}): void;
```

<div class="ts-block-property-details"></div>
</div></div>

### PrerenderHttpErrorHandlerValue

<div class="ts-block">

```dts
type PrerenderHttpErrorHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderHttpErrorHandler;
```

</div>

### PrerenderInvalidUrlHandler

<div class="ts-block">

```dts
interface PrerenderInvalidUrlHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: { href: string; referrer: string | null; message: string }): void;
```

<div class="ts-block-property-details"></div>
</div></div>

### PrerenderInvalidUrlHandlerValue

<div class="ts-block">

```dts
type PrerenderInvalidUrlHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderInvalidUrlHandler;
```

</div>

### PrerenderMap

<div class="ts-block">

```dts
type PrerenderMap = Map<string, PrerenderOption>;
```

</div>

### PrerenderMissingIdHandler

<div class="ts-block">

```dts
interface PrerenderMissingIdHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: { path: string; id: string; referrers: string[]; message: string }): void;
```

<div class="ts-block-property-details"></div>
</div></div>

### PrerenderMissingIdHandlerValue

<div class="ts-block">

```dts
type PrerenderMissingIdHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderMissingIdHandler;
```

</div>

### PrerenderOption

<div class="ts-block">

```dts
type PrerenderOption = boolean | 'auto';
```

</div>

### PrerenderUnseenRoutesHandler

<div class="ts-block">

```dts
interface PrerenderUnseenRoutesHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: { routes: string[]; message: string }): void;
```

<div class="ts-block-property-details"></div>
</div></div>

### PrerenderUnseenRoutesHandlerValue

<div class="ts-block">

```dts
type PrerenderUnseenRoutesHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderUnseenRoutesHandler;
```

</div>

### Prerendered

<div class="ts-block">

```dts
interface Prerendered {/*…*/}
```

<div class="ts-block-property">

```dts
pages: Map<
string,
{
	/** The location of the .html file relative to the output directory */
	file: string;
}
>;
```

<div class="ts-block-property-details">

A map of `path` to `{ file }` objects, where a path like `/foo` corresponds to `foo.html` and a path like `/bar/` corresponds to `bar/index.html`.

</div>
</div>

<div class="ts-block-property">

```dts
assets: Map<
string,
{
	/** The MIME type of the asset */
	type: string;
}
>;
```

<div class="ts-block-property-details">

A map of `path` to `{ type }` objects.

</div>
</div>

<div class="ts-block-property">

```dts
redirects: Map<
string,
{
	status: number;
	location: string;
}
>;
```

<div class="ts-block-property-details">

A map of redirects encountered during prerendering.

</div>
</div>

<div class="ts-block-property">

```dts
paths: string[];
```

<div class="ts-block-property-details">

An array of prerendered paths (without trailing slashes, regardless of the trailingSlash config)

</div>
</div></div>

### RequestOptions

<div class="ts-block">

```dts
interface RequestOptions {/*…*/}
```

<div class="ts-block-property">

```dts
getClientAddress(): string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
platform?: App.Platform;
```

<div class="ts-block-property-details"></div>
</div></div>

### RouteSegment

<div class="ts-block">

```dts
interface RouteSegment {/*…*/}
```

<div class="ts-block-property">

```dts
content: string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
dynamic: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
rest: boolean;
```

<div class="ts-block-property-details"></div>
</div></div>

### TrailingSlash

<div class="ts-block">

```dts
type TrailingSlash = 'never' | 'always' | 'ignore';
```

</div>

# @sveltejs/kit/adapter

```js
// @noErrors
import { applyReroute } from '@sveltejs/kit/adapter';
```

## applyReroute

<blockquote class="since note">

Available since 3.0.0

</blockquote>

Helps a catch-all request handler pass the request to a different handler if
the `reroute` hook has returned a URL pathname that's different from the
incoming request.

If your adapter is capable of deploying multiple serverless functions, it's a
good idea to also deploy a "catch-all" one to handle uncaught requests.
Running this in that function allows the app's `reroute` hook to rewrite
the request URL and invoke the next appropriate serverless function, if any.

<div class="ts-block">

```dts
function applyReroute(
	response: Response,
	next: (url: URL) => Response | Promise<Response>
): Response | Promise<Response>;
```

</div>

# @sveltejs/kit/env

```js
// @noErrors
import { defineEnvVars } from '@sveltejs/kit/env';
```

## defineEnvVars

Utility for defining [environment variables](/docs/kit/environment-variables),
which are made available via `$app/env/public` and `$app/env/private`.

```js
// @errors: 7031
import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

export const variables = defineEnvVars({
	API_URL: {
		schema: v.pipe(v.string(), v.url())
	},
	PORT: {
		schema: (value) => {
			if (value === undefined) return 3000;
			const port = Number(value);
			if (!Number.isInteger(port)) throw new Error('PORT must be an integer');
			return port;
		}
	}
});
```

<div class="ts-block">

```dts
function defineEnvVars<
	T extends Record<string, EnvVarConfig<any>>
>(variables: T): DefinedEnvVars<T>;
```

</div>



## DefinedEnvVars

The return type of [`defineEnvVars`](/docs/kit/@sveltejs-kit-env#defineEnvVars).

<div class="ts-block">

```dts
type DefinedEnvVars<
	T extends Record<string, EnvVarConfig<any>>
> = {
	readonly [K in keyof T]: EnvVarEntry<T[K]>;
};
```

</div>

## EnvVarConfig

[Environment variables](/docs/kit/environment-variables) can be configured by exporting
a `variables` object from `src/env.ts`, using [`defineEnvVars`](/docs/kit/@sveltejs-kit-env#defineEnvVars).

<div class="ts-block">

```dts
interface EnvVarConfig<T> {/*…*/}
```

<div class="ts-block-property">

```dts
public?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

Whether the environment variable can be accessed by client-side code.
- if `true`, it can be imported from `$app/env/public`
- if `false`, it can be imported from `$app/env/private`, which is a [server-only module](/docs/kit/server-only-modules)

</div>
</div>

<div class="ts-block-property">

```dts
static?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

Whether the value is determined at build time or when the app runs.
- if `true`, the build time value is inlined into the bundle. This enables optimisations like dead-code elimination
- if `false`, the value is read from the environment when the app starts

</div>
</div>

<div class="ts-block-property">

```dts
schema?: StandardSchemaV1<string | undefined, T> | ((value: string | undefined) => T | undefined);
```

<div class="ts-block-property-details">

A [Standard Schema](https://standardschema.dev/) validator that is applied to the value when the app starts.
Alternatively, a function that returns the (possibly transformed) value, or throws an error explaining
the problem. Returning `undefined` is valid, so a function can describe an optional variable.
The validator can output any value — not necessarily a string — but public, non-static values must be
serializable by [devalue](https://github.com/sveltejs/devalue) so that they can be sent to the browser.

If omitted, the value must be set, but may be an empty string.

</div>
</div>

<div class="ts-block-property">

```dts
description?: string;
```

<div class="ts-block-property-details">

A description of the variable that will be used for inline documentation on hover.

</div>
</div></div>

# @sveltejs/kit/hooks

```js
// @noErrors
import { sequence } from '@sveltejs/kit/hooks';
```

## sequence

A helper function for sequencing multiple `handle` calls in a middleware-like manner.
The behavior for the `handle` options is as follows:
- `transformPageChunk` is applied in reverse order and merged
- `preload` is applied in forward order, the first option "wins" and no `preload` options after it are called
- `filterSerializedResponseHeaders` behaves the same as `preload`

```js
// @errors: 7031
/// file: src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';

/** @type {import('@sveltejs/kit/hooks').Handle} */
async function first({ event, resolve }) {
	console.log('first pre-processing');
	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// transforms are applied in reverse order
			console.log('first transform');
			return html;
		},
		preload: () => {
			// this one wins as it's the first defined in the chain
			console.log('first preload');
			return true;
		}
	});
	console.log('first post-processing');
	return result;
}

/** @type {import('@sveltejs/kit/hooks').Handle} */
async function second({ event, resolve }) {
	console.log('second pre-processing');
	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			console.log('second transform');
			return html;
		},
		preload: () => {
			console.log('second preload');
			return true;
		},
		filterSerializedResponseHeaders: () => {
			// this one wins as it's the first defined in the chain
			console.log('second filterSerializedResponseHeaders');
			return true;
		}
	});
	console.log('second post-processing');
	return result;
}

export const handle = sequence(first, second);
```

The example above would print:

```
first pre-processing
first preload
second pre-processing
second filterSerializedResponseHeaders
second transform
first transform
second post-processing
first post-processing
```

Calling `resolve` invokes the next handler in the sequence (or SvelteKit itself, if it is the last one). To pass data between handlers, use `event.locals`.

<div class="ts-block">

```dts
function sequence(...handlers: Handle[]): Handle;
```

</div>



## CaughtError

The error passed to the [`handleError`](/docs/kit/hooks#handleError) hooks.
Use the `kind` discriminant to distinguish errors from your app (thrown with the
[`error`](/docs/kit/errors#App-errors) helper), errors generated by
SvelteKit itself (such as 404s), validation errors, and unknown errors (thrown by your code,
or code it calls).

<div class="ts-block">

```dts
type CaughtError<
	Issue extends StandardSchemaV1.Issue =
		StandardSchemaV1.Issue
> =
	| {
			[Kind in keyof CaughtErrorMap]: {
				/** Identifies the category and origin of the error */
				kind: Kind;
				/** The caught error. Its type depends on `kind` */
				error: CaughtErrorMap[Kind];
				/** Only present for validation errors */
				issues?: undefined;
			};
	  }[keyof CaughtErrorMap]
	| ValidationCaughtError<Issue>;
```

</div>

## ClientCaughtError

The error passed to the client-side `handleError` hook.

<div class="ts-block">

```dts
type ClientCaughtError = Exclude<
	CaughtError,
	{ kind: 'validation' }
>;
```

</div>

## ClientInit

<blockquote class="since note">

Available since 2.10.0

</blockquote>

The [`init`](/docs/kit/hooks#init) will be invoked once the app starts in the browser

<div class="ts-block">

```dts
type ClientInit = () => MaybePromise<void>;
```

</div>

## Handle

The [`handle`](/docs/kit/hooks#handle) hook runs every time the SvelteKit server receives a [request](/docs/kit/web-standards#Fetch-APIs-Request) and
determines the [response](/docs/kit/web-standards#Fetch-APIs-Response).
It receives an `event` object representing the request and a function called `resolve`, which renders the route and generates a `Response`.
This allows you to modify response headers or bodies, or bypass SvelteKit entirely (for implementing routes programmatically, for example).

<div class="ts-block">

```dts
type Handle = (input: {
	event: RequestEvent;
	resolve: (
		event: RequestEvent,
		opts?: ResolveOptions
	) => Promise<Response>;
}) => MaybePromise<Response>;
```

</div>

## HandleClientError

The client-side [`handleError`](/docs/kit/hooks#handleError) hook runs for every error thrown while navigating, except redirects.
Errors that were already transformed by the server-side hook are not passed to it a second time.

The `kind` property discriminates between _app_ errors (thrown with the [`error`](/docs/kit/errors#App-errors) helper),
_framework_ errors (generated by SvelteKit itself, such as 404s) and _unknown_ errors (thrown by your code, or code it calls).

The hook returns an object matching `App.Error`, in which `status` and `message` are optional — return them only to
override the defaults. Omitted properties are inherited from the caught error: the body passed to `error(...)` for app errors,
the status and safe message for framework errors, and `500`/`'Internal Error'` for unknown errors. Return nothing to
keep the defaults entirely (if you augment `App.Error` with required properties, you must return those).

Make sure that this function _never_ throws an error.

<div class="ts-block">

```dts
type HandleClientError = (
	input: ClientCaughtError & { event: NavigationEvent }
) => MaybePromise<
	| AppErrorWithOptionalDefaults
	| VoidIfNoRequiredAppErrorProperties
>;
```

</div>

## HandleFetch

The [`handleFetch`](/docs/kit/hooks#handleFetch) hook allows you to modify (or replace) the result of an [`event.fetch`](/docs/kit/load#Making-fetch-requests) call that runs on the server (or during prerendering) inside an endpoint, `load`, `action`, `handle`, `handleError` or `reroute`.

<div class="ts-block">

```dts
type HandleFetch = (input: {
	event: RequestEvent;
	request: Request;
	fetch: typeof fetch;
}) => MaybePromise<Response>;
```

</div>

## HandleServerError

The server-side [`handleError`](/docs/kit/hooks#handleError) hook runs for every error thrown while responding to a request, except redirects.

The `kind` property discriminates between _app_ errors (thrown with the [`error`](/docs/kit/errors#App-errors) helper),
_framework_ errors (generated by SvelteKit itself, such as 404s), _validation_ errors (caused by invalid remote function arguments)
and _unknown_ errors (thrown by your code, or code it calls).

The hook returns an object matching `App.Error`, in which `status` and `message` are optional — return them only to
override the defaults. Omitted properties are inherited from the caught error: the body passed to `error(...)` for app errors,
the status and safe message for framework and validation errors, and `500`/`'Internal Error'` for unknown errors. Return nothing to
keep the defaults entirely (if you augment `App.Error` with required properties, you must return those).

Make sure that this function _never_ throws an error.

<div class="ts-block">

```dts
type HandleServerError<
	Issue extends StandardSchemaV1.Issue =
		StandardSchemaV1.Issue
> = (
	input: CaughtError<Issue> & { event: RequestEvent }
) => MaybePromise<
	| AppErrorWithOptionalDefaults
	| VoidIfNoRequiredAppErrorProperties
>;
```

</div>

## Reroute

<blockquote class="since note">

Available since 2.3.0

</blockquote>

The [`reroute`](/docs/kit/hooks#reroute) hook allows you to modify the URL before it is used to determine which route to render.

<div class="ts-block">

```dts
type Reroute = (event: {
	url: URL;
	fetch: typeof fetch;
}) => MaybePromise<void | string>;
```

</div>

## ResolveOptions

<div class="ts-block">

```dts
interface ResolveOptions {/*…*/}
```

<div class="ts-block-property">

```dts
transformPageChunk?: (input: { html: string; done: boolean }) => MaybePromise<string | undefined>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `input` the html chunk and the info if this is the last chunk

</div>

Applies custom transforms to HTML. If `done` is true, it's the final chunk. Chunks are not guaranteed to be well-formed HTML
(they could include an element's opening tag but not its closing tag, for example)
but they will always be split at sensible boundaries such as `%sveltekit.head%` or layout/page components.

</div>
</div>

<div class="ts-block-property">

```dts
filterSerializedResponseHeaders?: (name: string, value: string) => boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` header name
- `value` header value

</div>

Determines which headers should be included in serialized responses when a `load` function loads a resource with `fetch`.
By default, none will be included.

</div>
</div>

<div class="ts-block-property">

```dts
preload?: (
	input:
		| { type: 'css' | 'js' | 'asset'; path: string }
		| { type: 'font'; path: string; filename: string }
) => boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `input` the type of the file and its path

</div>

Determines which files should be preloaded. Files are preloaded via `<link>` tags added to the
`<head>` tag; if `output.linkHeaderPreload` is enabled, dynamically rendered pages use the
[`Link` response header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link) instead.
By default, `js` and `css` files will be preloaded.

For `font` files, `input` also has a `filename` property, the source file's pathname relative
to the project root, so that a filter can match on it instead of the hashed path. `js` and
`css` files are bundled and have no single source file name.

</div>
</div></div>

## ServerInit

<blockquote class="since note">

Available since 2.10.0

</blockquote>

The [`init`](/docs/kit/hooks#init) will be invoked before the server responds to its first request

<div class="ts-block">

```dts
type ServerInit = () => MaybePromise<void>;
```

</div>

## Transport

<blockquote class="since note">

Available since 2.11.0

</blockquote>

The [`transport`](/docs/kit/hooks#transport) hook allows you to transport custom types across the server/client boundary.

Each transporter has a pair of `encode` and `decode` functions. On the server, `encode` determines whether a value is an instance of the custom type and, if so, returns a non-falsy encoding of the value which can be an object or an array (or `false` otherwise).

In the browser, `decode` turns the encoding back into an instance of the custom type.

```ts
import type { Transport } from '@sveltejs/kit/hooks';

declare class MyCustomType {
	data: any
}

// hooks.js
export const transport: Transport = {
	MyCustomType: {
		encode: (value) => value instanceof MyCustomType && [value.data],
		decode: ([data]) => new MyCustomType(data)
	}
};
```

<div class="ts-block">

```dts
type Transport = Record<string, Transporter>;
```

</div>

## Transporter

A member of the [`transport`](/docs/kit/hooks#transport) hook.

<div class="ts-block">

```dts
interface Transporter<
	T = any,
	U =
		any /* minus falsy values, but we can't properly express that */
> {/*…*/}
```

<div class="ts-block-property">

```dts
encode: (value: T) => false | U;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
decode: (data: U) => T;
```

<div class="ts-block-property-details"></div>
</div></div>

# @sveltejs/kit/node

```js
// @noErrors
import {
	createReadableStream,
	getRequest,
	setResponse
} from '@sveltejs/kit/node';
```

## createReadableStream

<blockquote class="since note">

Available since 2.4.0

</blockquote>

Converts a file on disk to a readable stream

<div class="ts-block">

```dts
function createReadableStream(file: string): ReadableStream;
```

</div>



## getRequest

<div class="ts-block">

```dts
function getRequest({
	request,
	response,
	base,
	bodySizeLimit
}: {
	request: import('http').IncomingMessage;
	response?: import('http').ServerResponse;
	base: string;
	bodySizeLimit?: number;
}): Request;
```

</div>



## setResponse

<div class="ts-block">

```dts
function setResponse(
	res: import('http').ServerResponse,
	response: Response
): void;
```

</div>

# @sveltejs/kit/params

```js
// @noErrors
import { defineParams } from '@sveltejs/kit/params';
```

## defineParams

Define [parameter matchers](/docs/kit/advanced-routing#Matching) for your app.

<div class="ts-block">

```dts
function defineParams<
	T extends Record<string, ParamDefinition>
>(definitions: T): DefinedParams<T>;
```

</div>



## DefinedParams

The return type of [`defineParams`](/docs/kit/@sveltejs-kit-params#defineParams).

<div class="ts-block">

```dts
type DefinedParams<
	T extends Record<string, ParamDefinition>
> = {
	readonly [K in keyof T]: ParamEntry<T[K]>;
};
```

</div>

## MatcherParam

Extracts the param type from a matcher.

<div class="ts-block">

```dts
type MatcherParam<M extends StandardSchemaV1<any, any>> =
	M extends StandardSchemaV1<any, infer Inner>
		? Inner extends ParamValue
			? Inner
			: Inner extends StandardSchemaV1<any, any>
				? StandardSchemaV1.InferOutput<Inner> extends ParamValue
					? StandardSchemaV1.InferOutput<Inner>
					: never
				: never
		: never;
```

</div>

## ParamDefinition

A param matcher definition passed to [`defineParams`](/docs/kit/@sveltejs-kit-params#defineParams).

<div class="ts-block">

```dts
type ParamDefinition =
	| ((param: string) => ParamValue | undefined)
	| StandardSchemaV1<string, ParamValue>;
```

</div>

## ParamMatcher

The shape of a param matcher. See [matching](/docs/kit/advanced-routing#Matching) for more info.

<div class="ts-block">

```dts
type ParamMatcher<Output = any> = StandardSchemaV1<
	string,
	Output
>;
```

</div>

## ParamValue

A value that can be parsed from a URL param and losslessly encoded with `String(...)`.

<div class="ts-block">

```dts
type ParamValue = string | number | boolean | bigint;
```

</div>

# @sveltejs/kit/vite

## sveltekit

The SvelteKit Vite plugin, which must be added to your `vite.config.js` file along with your project's configuration:

```js
// @errors: 7031
/// file: vite.config.js
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			compilerOptions: {
				experimental: {
					async: true
				}
			},
			experimental: {
				remoteFunctions: true
			}
		})
	]
});
```

As well as SvelteKit, the plugin options are used by other tooling that integrates with Svelte such as editor extensions.

Any options that don't belong to SvelteKit are passed through to [`vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md), so you can set options like `inspector` here too. The `experimental` namespace is shared — SvelteKit reads its own flags and forwards the rest.

> [!LEGACY]
> Prior to SvelteKit 3, config lived in a `svelte.config.js` file, which is no longer supported. The ability to configure SvelteKit via `vite.config.js` was added in version 2.62.

<div class="ts-block">

```dts
function sveltekit(config?: Config): Promise<Plugin[]>;
```

</div>



## Config

An extension of [`vite-plugin-svelte`'s options](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#svelte-options).

## adapter

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `undefined`

</div>

Your [adapter](/docs/kit/adapters) is run when executing `vite build`. It determines how the output is converted for different platforms.

<div class="ts-block-property-children">



</div>

## alias

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 
- <span class="tag">default</span> `{}`

</div>

An object containing zero or more aliases used to replace values in `import` statements. These aliases are automatically passed to Vite and TypeScript.

This option is deprecated. Use [subpath imports](/docs/kit/$lib) instead.

> [!NOTE] You will need to run `npm run dev` to have SvelteKit automatically generate the required alias configuration in `jsconfig.json` or `tsconfig.json`.

<div class="ts-block-property-children">



</div>

## appDir

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"_app"`

</div>

The directory where SvelteKit keeps its stuff, including static assets (such as JS and CSS) and internally-used routes.

If `paths.assets` is specified, there will be two app directories — `${paths.assets}/${appDir}` and `${paths.base}/${appDir}`.

<div class="ts-block-property-children">



</div>

## csp

<div class="ts-block-property-bullets">



</div>

[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) configuration. CSP helps to protect your users against cross-site scripting (XSS) attacks, by limiting the places resources can be loaded from. For example, a configuration like this...

```js
// @errors: 7031
/// file: vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			csp: {
				directives: {
					'script-src': ['self']
				},
				// must be specified with either the `report-uri` or `report-to` directives, or both
				reportOnly: {
					'script-src': ['self'],
					'report-uri': ['/']
				}
			}
		})
	]
});
```

...would prevent scripts loading from external sites. SvelteKit will augment the specified directives with nonces or hashes (depending on `mode`) for any inline styles and scripts it generates.

To add a nonce for scripts and links manually included in `src/app.html`, you may use the placeholder `%sveltekit.nonce%` (for example `<script nonce="%sveltekit.nonce%">`).

When pages are prerendered, the CSP header is added via a `<meta http-equiv>` tag (note that in this case, `frame-ancestors`, `report-uri` and `sandbox` directives will be ignored).

> [!NOTE] When `mode` is `'auto'`, SvelteKit will use nonces for dynamically rendered pages and hashes for prerendered pages. Using nonces with prerendered pages is insecure and therefore forbidden.

If this level of configuration is insufficient and you have more dynamic requirements, you can use the [`handle` hook](/docs/kit/hooks#handle) to roll your own CSP.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
mode?: 'hash' | 'nonce' | 'auto';
```

<div class="ts-block-property-details">

Whether to use hashes or nonces to restrict `<script>` and `<style>` elements. `'auto'` will use hashes for prerendered pages, and nonces for dynamically rendered pages.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
directives?: CspDirectives;
```

<div class="ts-block-property-details">

Directives that will be added to `Content-Security-Policy` headers.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
reportOnly?: CspDirectives;
```

<div class="ts-block-property-details">

Directives that will be added to `Content-Security-Policy-Report-Only` headers.

</div>
</div>

</div>

## csrf

<div class="ts-block-property-bullets">



</div>

Protection against [cross-site request forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) attacks.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
checkOrigin?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`
- <span class="tag deprecated">deprecated</span> removed in 3.0. Use `trustedOrigins: ['*']` instead

</div>

Whether to check the incoming `origin` header for `POST`, `PUT`, `PATCH`, or `DELETE` form submissions and verify that it matches the server's origin.

To allow people to make `POST`, `PUT`, `PATCH`, or `DELETE` requests with a `Content-Type` of `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain` to your app from other origins, you will need to disable this option. Be careful!

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
trustedOrigins?: string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `[]`

</div>

An array of origins that are allowed to make cross-origin form submissions to your app.

Each origin should be a complete origin including protocol (e.g., `https://payment-gateway.com`).
This is useful for allowing trusted third-party services like payment gateways or authentication providers to submit forms to your app.

If the array contains `'*'`, all origins will be trusted. This is generally not recommended!

> [!NOTE] Only add origins you completely trust, as this bypasses CSRF protection for those origins.

CSRF checks only apply in production, not in local development.

</div>
</div>

</div>

## embedded

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

Whether or not the app is embedded inside a larger app. If `true`, SvelteKit will add its event listeners related to navigation etc on the parent of `%sveltekit.body%` instead of `window`, and will pass `params` from the server rather than inferring them from `location.pathname`.
Note that it is generally not supported to embed multiple SvelteKit apps on the same page and use client-side SvelteKit features within them (things such as pushing to the history state assume a single instance).

<div class="ts-block-property-children">



</div>

## env

<div class="ts-block-property-bullets">



</div>

Environment variable configuration

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
dir?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"."`

</div>

The directory to search for `.env` files.

</div>
</div>

</div>

## experimental

<div class="ts-block-property-bullets">



</div>

Experimental features. Here be dragons. These are not subject to semantic versioning, so breaking changes or removal can happen in any release.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
remoteFunctions?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

Whether to enable the experimental remote functions feature. This feature is not yet stable and may be changed or removed at any time.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
forkPreloads?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

Whether to enable the experimental forked preloading feature using Svelte's fork API.

</div>
</div>

</div>

## files

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead

</div>

Where to find various files within your project.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
src?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src"`
- <span class="tag since">available since</span> v2.28

</div>

The location of your source code.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
assets?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"static"`

</div>

A place to put static files that should have stable URLs and undergo no processing, such as `favicon.ico` or `manifest.json`.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
hooks?: {/*…*/};
```

<div class="ts-block-property-details">

<div class="ts-block-property-children"><div class="ts-block-property">

```ts
// @noErrors
client?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/hooks.client"`

</div>

The location of your client [hooks](/docs/kit/hooks).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
server?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/hooks.server"`

</div>

The location of your server [hooks](/docs/kit/hooks).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
universal?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/hooks"`
- <span class="tag since">available since</span> v2.3.0

</div>

The location of your universal [hooks](/docs/kit/hooks).

</div>
</div></div>

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
params?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/params"`

</div>

A directory containing [parameter matchers](/docs/kit/advanced-routing#Matching).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
routes?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/routes"`

</div>

The files that define the structure of your app (see [Routing](/docs/kit/routing)).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
serviceWorker?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/service-worker"`

</div>

The location of your service worker's entry point (see [Service workers](/docs/kit/service-workers)).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
appTemplate?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/app.html"`

</div>

The location of the template for HTML responses.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
errorTemplate?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> this feature is still supported, but it's generally recommended to use [monorepos](https://levelup.video/tutorials/monorepos-with-pnpm) instead
- <span class="tag">default</span> `"src/error.html"`

</div>

The location of the template for fallback error responses.

</div>
</div>

</div>

## inlineStyleThreshold

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `0`

</div>

Inline CSS inside a `<style>` block at the head of the HTML. This option is a number that specifies the maximum length of a CSS file in UTF-16 code units, as specified by the [String.length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length) property, to be inlined. All CSS files needed for the page that are smaller than this value are merged and inlined in a `<style>` block.

> [!NOTE] This results in fewer initial requests and can improve your [First Contentful Paint](https://web.dev/first-contentful-paint) score. However, it generates larger HTML output and reduces the effectiveness of browser caches. Use it advisedly.

<div class="ts-block-property-children">



</div>

## moduleExtensions

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `[".js", ".ts"]`

</div>

An array of file extensions that SvelteKit will treat as modules. Files with extensions that match neither `config.extensions` nor `config.moduleExtensions` will be ignored.

<div class="ts-block-property-children">



</div>

## outDir

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `".svelte-kit"`

</div>

The directory that SvelteKit writes files to during `dev` and `build`. You should exclude this directory from version control.

<div class="ts-block-property-children">



</div>

## output

<div class="ts-block-property-bullets">



</div>

Options related to the build output format

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
linkHeaderPreload?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`
- <span class="tag since">available since</span> v3.0.0

</div>

Whether to use the [HTTP `Link` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link) to preload assets instead of the [`<link>` HTML element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link) for non-prerendered pages.

Note that some web servers such as Nginx and Apache have a default header size limit which may be easily exceeded.
If you are using one of these web servers, you may want to leave this as `false` or configure a higher limit.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
preloadStrategy?: 'modulepreload' | 'preload-js' | 'preload-mjs';
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"modulepreload"`
- <span class="tag since">available since</span> v1.8.4
- <span class="tag deprecated">deprecated</span> removed in 3.0

</div>

SvelteKit will preload the JavaScript modules needed for the initial page to avoid import 'waterfalls', resulting in faster application startup. There
are three strategies with different trade-offs:
- `modulepreload` - uses `<link rel="modulepreload">`. This delivers the best results in Chromium-based browsers, in Firefox 115+, and Safari 17+. It is ignored in older browsers.
- `preload-js` - uses `<link rel="preload">`. Prevents waterfalls in Chromium and Safari, but Chromium will parse each module twice (once as a script, once as a module). Causes modules to be requested twice in Firefox. This is a good setting if you want to maximise performance for users on iOS devices at the cost of a very slight degradation for Chromium users.
- `preload-mjs` - uses `<link rel="preload">` but with the `.mjs` extension which prevents double-parsing in Chromium. Some static webservers will fail to serve .mjs files with a `Content-Type: application/javascript` header, which will cause your application to break. If that doesn't apply to you, this is the option that will deliver the best performance for the largest number of users, until `modulepreload` is more widely supported.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
bundleStrategy?: 'split' | 'single' | 'inline';
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `'split'`
- <span class="tag since">available since</span> v2.13.0

</div>

The bundle strategy option affects how your app's JavaScript and CSS files are loaded.
- If `'split'`, splits the app up into multiple .js/.css files so that they are loaded lazily as the user navigates around the app. This is the default, and is recommended for most scenarios.
- If `'single'`, creates just one .js bundle and one .css file containing code for the entire app.
- If `'inline'`, inlines all JavaScript and CSS of the entire app into the HTML. The result is usable without a server (i.e. you can just open the file in your browser).

When using `'split'`, you can also adjust the bundling behaviour by setting [`output.codeSplitting`](https://rolldown.rs/reference/OutputOptions.codeSplitting) inside your Vite config's [`build.rolldownOptions`](https://vite.dev/config/build-options#build-rolldownoptions).

If you want to inline your assets, you'll need to set Vite's [`build.assetsInlineLimit`](https://vite.dev/config/build-options.html#build-assetsinlinelimit) option to an appropriate size then import your assets through Vite.

```js
// @errors: 7031
/// file: vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// inline all imported assets
		assetsInlineLimit: Infinity
	}
});
```

```svelte
/// file: src/routes/+layout.svelte
<script>
	// import the asset through Vite
	import favicon from './favicon.png';
</script>

<svelte:head>
	<!-- this asset will be inlined as a base64 URL -->
	<link rel="icon" href={favicon} />
</svelte:head>
```

</div>
</div>

</div>

## paths

<div class="ts-block-property-bullets">



</div>



<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
assets?: '' | `http://${string}` | `https://${string}`;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `""`

</div>

An absolute path that your app's files are served from. This is useful if your files are served from a storage bucket of some kind.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
base?: '' | `/${string}`;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `""`

</div>

A root-relative path that must start, but not end with `/` (e.g. `/base-path`), unless it is the empty string. This specifies where your app is served from and allows the app to live on a non-root path. Note that you need to prepend all your root-relative links with the base value or they will point to the root of your domain, not your `base` (this is how the browser works). You can use [`resolve(...)` from `$app/paths`](/docs/kit/$app-paths#resolve) for that: `<a href="{resolve('/your-page')}">Link</a>`. If you find yourself writing this often, it may make sense to extract this into a reusable component.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
origin?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `undefined`
- <span class="tag since">available since</span> v3.0

</div>

The origin of your app, used for CSRF protection and prerendering.

By default, this is `undefined`, meaning SvelteKit will derive the origin from `request.url` (which is set by the adapter, and ultimately by the platform).

If your app is served from an origin that isn't known at request time — for example because it's deployed to a preview deployment whose URL isn't known at build time, or because it's behind a reverse proxy that doesn't pass the `host` header — you can set this to a string like `https://my-site.com`.

This is also used as the value of `url.origin` during prerendering (when unset, it defaults to `http://sveltekit-prerender`), and as the trusted origin for CSRF checks on form submissions and remote function calls.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
relative?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`
- <span class="tag since">available since</span> v1.9.0

</div>

Whether to use relative asset paths.

If `true`, paths created with `resolve()` and `asset()` imported from `$app/paths` will be replaced with relative asset paths during server-side rendering, resulting in more portable HTML.
If `false`, `%sveltekit.assets%` and references to build artifacts will always be root-relative paths, unless `paths.assets` is an external URL

[Single-page app](/docs/kit/single-page-apps) fallback pages will always use absolute paths, regardless of this setting.

If your app uses a `<base>` element, you should set this to `false`, otherwise asset URLs will incorrectly be resolved against the `<base>` URL rather than the current page.

In 1.0, `undefined` was a valid value, which was set by default. In that case, if `paths.assets` was not external, SvelteKit would replace `%sveltekit.assets%` with a relative path and use relative paths to reference build artifacts, but `base` and `assets` imported from `$app/paths` would be as specified in your config.

</div>
</div>

</div>

## prerender

<div class="ts-block-property-bullets">



</div>

See [Prerendering](/docs/kit/page-options#prerender).

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
concurrency?: number;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `1`

</div>

How many pages can be prerendered simultaneously. JS is single-threaded, but in cases where prerendering performance is network-bound (for example loading content from a remote CMS) this can speed things up by processing other tasks while waiting on the network response.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
crawl?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

Whether SvelteKit should find pages to prerender by following links from `entries`.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
entries?: Array<'*' | `/${string}`>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `["*"]`

</div>

An array of pages to prerender, or start crawling from (if `crawl: true`). The `*` string includes all routes containing no required `[parameters]`  with optional parameters included as being empty (since SvelteKit doesn't know what value any parameters should have).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleHttpError?: PrerenderHttpErrorHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`
- <span class="tag since">available since</span> v1.15.7

</div>

How to respond to HTTP errors encountered while prerendering the app.

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with `status`, `path`, `referrer`, `referenceType` and `message` properties. If you `throw` from this function, the build will fail

```js
// @errors: 7031
/// file: vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
 		prerender: {
 			handleHttpError: ({ path, referrer, message }) => {
					// ignore deliberate link to shiny 404 page
					if (path === '/not-found' && referrer === '/blog/how-we-built-our-404-page') {
						return;
					}

					// otherwise fail the build
					throw new Error(message);
				}
			}
		})
	]
});
```

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleMissingId?: PrerenderMissingIdHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`
- <span class="tag since">available since</span> v1.15.7

</div>

How to respond when hash links from one prerendered page to another don't correspond to an `id` on the destination page.

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with `path`, `id`, `referrers` and `message` properties. If you `throw` from this function, the build will fail

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleEntryGeneratorMismatch?: PrerenderEntryGeneratorMismatchHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`
- <span class="tag since">available since</span> v1.16.0

</div>

How to respond when an entry generated by the `entries` export doesn't match the route it was generated from.

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with `generatedFromId`, `entry`, `matchedId` and `message` properties. If you `throw` from this function, the build will fail

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleUnseenRoutes?: PrerenderUnseenRoutesHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`
- <span class="tag since">available since</span> v2.16.0

</div>

How to respond when a route is marked as prerenderable but has not been prerendered.

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with a `routes` property which contains all routes that haven't been prerendered. If you `throw` from this function, the build will fail

The default behavior is to fail the build. This may be undesirable when you know that some of your routes may never be reached under certain
circumstances such as a CMS not returning data for a specific area, resulting in certain routes never being reached.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleInvalidUrl?: PrerenderInvalidUrlHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`
- <span class="tag since">available since</span> v2.67.0

</div>

How to respond when SvelteKit encounters a URL it cannot parse while crawling prerendered HTML (for example, an AT Protocol URL such as `at://did:plc:...`).

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with `href`, `referrer` and `message` properties. If you `throw` from this function, the build will fail

</div>
</div>

</div>

## router

<div class="ts-block-property-bullets">



</div>



<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
type?: 'pathname' | 'hash';
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"pathname"`
- <span class="tag since">available since</span> v2.14.0

</div>

What type of client-side router to use.
- `'pathname'` is the default and means the current URL pathname determines the route
- `'hash'` means the route is determined by `location.hash`. In this case, SSR and prerendering are disabled. This is only recommended if `pathname` is not an option, for example because you don't control the webserver where your app is deployed.
	It comes with some caveats: you can't use server-side rendering (or indeed any server logic), and you have to make sure that the links in your app all start with #/, or they won't work. Beyond that, everything works exactly like a normal SvelteKit app.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
resolution?: 'client' | 'server';
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"client"`
- <span class="tag since">available since</span> v2.17.0

</div>

How to determine which route to load when navigating to a new page.

By default, SvelteKit will serve a route manifest to the browser.
When navigating, this manifest is used (along with the `reroute` hook, if it exists) to determine which components to load and which `load` functions to run.
Because everything happens on the client, this decision can be made immediately. The drawback is that the manifest needs to be
loaded and parsed before the first navigation can happen, which may have an impact if your app contains many routes.

Alternatively, SvelteKit can determine the route on the server. This means that for every navigation to a path that has not yet been visited, the server will be asked to determine the route.
This has several advantages:
- The client does not need to load the routing manifest upfront, which can lead to faster initial page loads
- The list of routes is hidden from public view
- The server has an opportunity to intercept each navigation (for example through middleware in front of SvelteKit, such as a reverse proxy or your platform's edge functions), enabling (for example) A/B testing opaque to SvelteKit

Route resolution requests are answered as soon as the route has been looked up, before the `handle` hook is invoked. To intercept them within SvelteKit itself, use the `reroute` hook, which runs for these requests too.

The drawback is that for unvisited paths, resolution will take slightly longer (though this is mitigated by [preloading](/docs/kit/link-options#data-sveltekit-preload-data)).

> [!NOTE] When using server-side route resolution and prerendering, the resolution is prerendered along with the route itself.

</div>
</div>

</div>

## serviceWorker

<div class="ts-block-property-bullets">



</div>



<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
register: true;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

Whether to automatically register the service worker, if it exists.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
options?: RegistrationOptions;
```

<div class="ts-block-property-details">

Options for serviceWorker.register("...", options);

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
register?: false;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

Whether to automatically register the service worker, if it exists.

</div>
</div>

</div>

## tracing

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `{ server: false }`

</div>

Options for enabling [OpenTelemetry](https://opentelemetry.io/) tracing for SvelteKit operations.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
server?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

Enables server-side [OpenTelemetry](https://opentelemetry.io/) span emission for SvelteKit operations including the [`handle` hook](/docs/kit/hooks#handle), [`load` functions](/docs/kit/load), [form actions](/docs/kit/form-actions), and [remote functions](/docs/kit/remote-functions). Tracing — and more significantly, observability instrumentation — can have a nontrivial overhead, so consider whether you really need it, or if it might be more appropriate to turn it on in development and preview environments only.

</div>
</div>

</div>

## typescript

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Add configuration to `tsconfig.json` directly

</div>



<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
config?: (config: Record<string, any>) => Record<string, any> | void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `(config) => config`
- <span class="tag since">available since</span> v1.3.0

</div>

A function that allows you to edit the generated `tsconfig.json`. You can mutate the config (recommended) or return a new one.
This is useful for extending a shared `tsconfig.json` in a monorepo root, for example.

Note that any paths configured here should be relative to the generated config file, which is written to `node_modules/$app/tsconfig.json`.

</div>
</div>

</div>

## version

<div class="ts-block-property-bullets">



</div>

Client-side navigation can be buggy if you deploy a new version of your app while people are using it. If the code for the new page is already loaded, it may have stale content; if it isn't, the app's route manifest may point to a JavaScript file that no longer exists.
SvelteKit helps you solve this problem through version management. The current version is included in data, remote, and form action responses via the `x-sveltekit-version` header, so SvelteKit can detect new deployments without polling — for example when a navigation triggers a server `load` function, or when a remote function is called. SvelteKit also checks for new versions when the tab regains focus or becomes visible.
If SvelteKit encounters an error while loading the page and detects that a new version has been deployed (using the `name` specified here, which defaults to a timestamp of the build) it will fall back to traditional full-page navigation.
Not all navigations will result in an error though, for example if the JavaScript for the next page is already loaded. If you still want to force a full-page navigation in these cases, use `beforeNavigate`:
```html
/// file: +layout.svelte
<script>
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';

	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});
</script>
```

In addition to these checks, SvelteKit polls for new versions on an interval and sets [`updated.current`](/docs/kit/$app-state#updated) to `true` when it detects one. Set `pollInterval` to `0` to disable polling (the header- and event-based checks will still run).

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
name?: string;
```

<div class="ts-block-property-details">

The current app version string. If specified, this must be deterministic (e.g. a commit ref rather than `Math.random()` or `Date.now().toString()`), otherwise defaults to a timestamp of the build.

For example, to use the current commit hash, you could do use `git rev-parse HEAD`:

```js
// @errors: 7031
/// file: vite.config.js
import * as child_process from 'node:child_process';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
 		version: {
				name: child_process.execSync('git rev-parse HEAD').toString().trim()
			}
		})
	]
});
```

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
pollInterval?: number;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `3600000`

</div>

The interval in milliseconds to poll for version changes. If this is `0`, no polling occurs. SvelteKit also checks for new versions on server responses (via the `x-sveltekit-version` header) and when the tab regains focus or becomes visible, so polling is only needed for long-lived sessions on a single page.

</div>
</div>

</div>

# $app/env

```js
// @noErrors
import { browser, building, dev, version } from '$app/env';
```

## browser

`true` if the app is running in the browser.

<div class="ts-block">

```dts
const browser: boolean;
```

</div>



## building

SvelteKit analyses your app during the `build` step by running it. During this process, `building` is `true`. This also applies during prerendering.

<div class="ts-block">

```dts
const building: boolean;
```

</div>



## dev

Whether the dev server is running. This is not guaranteed to correspond to `NODE_ENV` or `MODE`.

<div class="ts-block">

```dts
const dev: boolean;
```

</div>



## version

The value of `config.version.name`.

<div class="ts-block">

```dts
const version: string;
```

</div>

# $app/env/private

Private environment variables defined in `src/env.ts` (or `src/env.js`).

See the [Environment variables](environment-variables) page for more information.

# $app/env/public

Public environment variables defined in `src/env.ts` (or `src/env.js`).

See the [Environment variables](environment-variables) page for more information.

# $app/forms

```js
// @noErrors
import { applyAction, deserialize, enhance } from '$app/forms';
```

## applyAction

Updates the `form` property of the current page with the given data and updates `page.status`.
In case of an error, it renders the nearest error page. In case of a redirect, it navigates to
the redirect location.

<div class="ts-block">

```dts
function applyAction<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(result: ActionResult<Success, Failure>): Promise<void>;
```

</div>



## deserialize

Use this function to deserialize the response from a form submission.
Usage:

```js
// @errors: 7031
import { deserialize } from '$app/forms';

async function handleSubmit(event) {
	const response = await fetch('/form?/action', {
		method: 'POST',
		body: new FormData(event.target)
	});

	const result = deserialize(await response.text());
	// ...
}
```

<div class="ts-block">

```dts
function deserialize<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(result: string): ActionResult<Success, Failure>;
```

</div>



## enhance

This action enhances a `<form>` element that otherwise would work without JavaScript.

The `submit` function is called upon submission with the given FormData and the `action` that should be triggered.
If `cancel` is called, the form will not be submitted.
You can use the abort `controller` to cancel the submission in case another one starts.
If a function is returned, that function is called with the response from the server.
If nothing is returned, the fallback will be used.

If this function or its return value isn't set, it emulates the browser-native behaviour, just without the full-page reload. It
- resets the `<form>` element and refreshes all data in case of a successful submission with no redirect response
- updates the `form` prop, `page.form` and `page.status` if the action is on the same page as the form
- navigates to the page the submission lands on — populating that page's `form` prop and `page.status` — on success and failure if that isn't the current page, just as a native form submission would, but with the `?/actionName` param stripped from the destination URL
- redirects in case of a redirect response
- renders the nearest error page in case of an unexpected error — the one nearest the action's route, if the action is on a different page

If you provide a custom function with a callback and want to use the default behavior, invoke `update` in your callback.
It accepts an options object
- `reset: false` if you don't want the `<form>` values to be reset after a successful submission
- `refreshAll` to control whether all data is refreshed after submission; it defaults to `true` for successes and `false` for failures
- `navigate: false` to apply non-redirect results to the current page rather than navigating to `result.location`; redirects are always followed

<div class="ts-block">

```dts
function enhance<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	form_element: HTMLFormElement,
	submit?: SubmitFunction<Success, Failure>
): {
	destroy(): void;
};
```

</div>



## ActionResult

When calling a form action via fetch, the response will be one of these shapes.
```svelte
<form method="post" use:enhance={() => {
	return ({ result }) => {
		// result is of type ActionResult
	};
}}
```

Success and failure results carry the root-relative `pathname + search` of the action URL, with
the `?/actionName` parameter removed. Redirect results carry the redirect target. Server-generated
error results also carry the action location, while client-generated errors such as network
failures do not. `update` uses this location to emulate native form navigation.

<div class="ts-block">

```dts
type ActionResult<
	Success extends Record<string, unknown> | undefined =
		Record<string, any>,
	Failure extends Record<string, unknown> | undefined =
		Record<string, any>
> =
	| {
			type: 'success';
			status: number;
			data?: Success;
			location: string;
	  }
	| {
			type: 'failure';
			status: number;
			data?: Failure;
			location: string;
	  }
	| { type: 'redirect'; status: number; location: string }
	| {
			type: 'error';
			status?: number;
			error: App.Error;
			location?: string;
	  };
```

</div>

## SubmitFunction

<div class="ts-block">

```dts
type SubmitFunction<
	Success extends Record<string, unknown> | undefined =
		Record<string, any>,
	Failure extends Record<string, unknown> | undefined =
		Record<string, any>
> = (input: {
	action: URL;
	formData: FormData;
	formElement: HTMLFormElement;
	controller: AbortController;
	submitter: HTMLElement | null;
	cancel: () => void;
}) => MaybePromise<
	| void
	| ((opts: {
			formData: FormData;
			formElement: HTMLFormElement;
			action: URL;
			result: ActionResult<Success, Failure>;
			/**
			 * Call this to get the default behavior of a form submission response.
			 * @param options Set `reset: false` if you don't want the `<form>` values to be reset after a successful submission. `refreshAll` defaults to `true` for successful results and `false` for failures. When the submission navigates, setting it to `false` still runs the destination's `load` functions but may reuse shared layout data. Set `navigate: false` to apply non-redirect results to the current page instead of navigating to `result.location`. Redirects are always followed.
			 */
			update: (options?: {
				reset?: boolean;
				refreshAll?: boolean;
				navigate?: boolean;
				/** @deprecated Use `refreshAll` instead. */
				invalidateAll?: boolean;
			}) => Promise<void>;
	  }) => MaybePromise<void>)
>;
```

</div>

# $app/manifest

```js
// @noErrors
import { assets, immutable, prerendered, routes } from '$app/manifest';
```

This module is available to [service workers](/docs/kit/service-workers) and other contexts.
It exports information about the build output, static files, prerendered pages, and routes.

## assets

An array of `{ path: AssetPath }` objects representing the files in your `static` directory, or whatever directory is specified by `config.files.assets`.
The path is relative to the [base path](/docs/kit/configuration#paths), and can be used with [`asset(...)`](/docs/kit/$app-paths#asset).

<div class="ts-block">

```dts
const assets: Array<{
	path: import('$app/types').AssetPath;
}>;
```

</div>



## immutable

An array of `{ path: string }` objects representing the files generated by Vite.
The path is relative to the [base path](/docs/kit/configuration#paths), and is intended for use with `cache.add(...)` inside a [service worker](/docs/kit/service-workers).
During development, this is an empty array.

<div class="ts-block">

```dts
const immutable: Array<{ path: string }>;
```

</div>



## prerendered

An array of `{ path: Path }` objects representing prerendered pages and endpoints, relative to the [base path](/docs/kit/configuration#paths).
During development, this is an empty array.

<div class="ts-block">

```dts
const prerendered: Array<{
	path: import('$app/types').Path;
}>;
```

</div>



## routes

An array of objects representing the routes in your app. Only routes that the router can match
are included — directories that merely hold a `+layout` are not routes of their own.

Each object has an `id`, plus `page` and `endpoint` booleans describing whether the route has a
`+page` and/or a `+server`. Both are `true` for a route that has both, so the capabilities can
be filtered independently:

```js
// @errors: 7031
import { routes } from '$app/manifest';

const pages = routes.filter((route) => route.page);
const endpoints = routes.filter((route) => route.endpoint);
```

<div class="ts-block">

```dts
const routes: ManifestRoute[];
```

</div>



## ManifestRoute

A route in your app, along with its capabilities. `page` indicates the presence of a `+page`,
while `endpoint` indicates the presence of a `+server`. Both are `true` when both files exist.

<div class="ts-block">

```dts
type ManifestRoute =
	| {
			id: Exclude<
				import('$app/types').PageRouteId,
				import('$app/types').EndpointRouteId
			>;
			page: true;
			endpoint: false;
	  }
	| {
			id: Exclude<
				import('$app/types').EndpointRouteId,
				import('$app/types').PageRouteId
			>;
			page: false;
			endpoint: true;
	  }
	| {
			id: Extract<
				import('$app/types').PageRouteId,
				import('$app/types').EndpointRouteId
			>;
			page: true;
			endpoint: true;
	  };
```

</div>

# $app/navigation

```js
// @noErrors
import {
	afterNavigate,
	beforeNavigate,
	disableScrollHandling,
	goto,
	invalidate,
	invalidateAll,
	onNavigate,
	preloadCode,
	preloadData,
	pushState,
	refreshAll,
	replaceState,
	snapshot
} from '$app/navigation';
```

## afterNavigate

A lifecycle function that runs the supplied `callback` when the current component mounts, and also whenever we navigate to a URL.

`afterNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```dts
function afterNavigate(
	callback: (navigation: AfterNavigate) => void
): void;
```

</div>



## beforeNavigate

A navigation interceptor that triggers before we navigate to a URL, whether by clicking a link, calling `goto(...)`, or using the browser back/forward controls.

Calling `cancel()` will prevent the navigation from completing. If `navigation.type === 'leave'` — meaning the user is navigating away from the app (or closing the tab) — calling `cancel` will trigger the native browser unload confirmation dialog. In this case, the navigation may or may not be cancelled depending on the user's response.

When a navigation isn't to a SvelteKit-owned route (and therefore controlled by SvelteKit's client-side router), `navigation.to.route.id` will be `null`.

If the navigation will (if not cancelled) cause the document to unload — in other words `'leave'` navigations and `'link'` navigations where `navigation.to.route === null` — `navigation.willUnload` is `true`.

`beforeNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```dts
function beforeNavigate(
	callback: (navigation: BeforeNavigate) => void
): void;
```

</div>



## disableScrollHandling

If called when the page is being updated following a navigation (in `onMount` or `afterNavigate` or an action, for example), this disables SvelteKit's built-in scroll handling.
This is generally discouraged, since it breaks user expectations.

<div class="ts-block">

```dts
function disableScrollHandling(): void;
```

</div>



## goto

Allows you to navigate programmatically to a given route, with control over details such as whether scroll and focus are reset
(as they would be with a regular navigation) or preserved.

Returns a Promise that resolves when SvelteKit navigates (or fails to navigate, in which case the promise rejects) or the state change has been applied.

`goto` is intended for navigations to routes that belong to the app, and will reject if a route cannot be resolved.
For external URLs, use `window.location = url` to perform a full-page navigation instead of calling `goto(url)`.

<div class="ts-block">

```dts
function goto(
	url: string | URL,
	opts?: GotoOptions
): Promise<void>;
```

</div>



## invalidate

Causes any `load` functions belonging to the currently active page to re-run if they depend on the `url` in question, via `fetch` or `depends`. Returns a `Promise` that resolves when the page is subsequently updated.

If the argument is given as a `string` or `URL`, it must resolve to the same URL that was passed to `fetch` or `depends` (including query parameters).
To create a custom identifier, use a string beginning with `[a-z]+:` (e.g. `custom:state`) — this is a valid URL.

The `function` argument can be used define a custom predicate. It receives the full `URL` and causes `load` to rerun if `true` is returned.
This can be useful if you want to invalidate based on a pattern instead of a exact match.

```ts
// Example: Match '/path' regardless of the query parameters
import { invalidate } from '$app/navigation';

invalidate((url) => url.pathname === '/path');
```

<div class="ts-block">

```dts
function invalidate(
	resource: string | URL | ((url: URL) => boolean),
	keepState?: boolean
): Promise<void>;
```

</div>



## invalidateAll

<blockquote class="tag deprecated note">

Use [`refreshAll`](/docs/kit/$app-navigation#refreshAll) instead. Unlike `invalidateAll`, `refreshAll` does not reset `page.state`.

</blockquote>

Causes all `load` and `query` functions belonging to the currently active page to re-run. Returns a `Promise` that resolves when the page is subsequently updated.

Note that this resets `page.state` to an empty object. If you want to preserve `page.state` (for example when using [shallow routing](/docs/kit/shallow-routing)), use `refreshAll` instead.

<div class="ts-block">

```dts
function invalidateAll(): Promise<void>;
```

</div>



## onNavigate

A lifecycle function that runs the supplied `callback` immediately before we navigate to a new URL except during full-page navigations.

If you return a `Promise`, SvelteKit will wait for it to resolve before completing the navigation. This allows you to — for example — use `document.startViewTransition`. Avoid promises that are slow to resolve, since navigation will appear stalled to the user.

If a function (or a `Promise` that resolves to a function) is returned from the callback, it will be called once the DOM has updated.

`onNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```dts
function onNavigate(
	callback: (
		navigation: OnNavigate
	) => MaybePromise<(() => void) | void>
): void;
```

</div>



## preloadCode

Programmatically imports the code for routes that haven't yet been fetched.
Typically, you might call this to speed up subsequent navigation.

Takes a route ID such as `/about` or `/blog/[slug]`. Unlike pathnames, route IDs
are never prefixed with the app's [base path](/docs/kit/configuration#paths).
If you have a pathname rather than a route ID, you can convert it with
[`match`](/docs/kit/$app-paths#match) from `$app/paths`:

```js
// @errors: 7031
import { match } from '$app/paths';
import { preloadCode } from '$app/navigation';

const matched = await match('/blog/hello-world');
if (matched) await preloadCode(matched.id);
```

Unlike `preloadData`, this won't call `load` functions.
Returns a Promise that resolves when the modules have been imported.

<div class="ts-block">

```dts
function preloadCode(
	id: import('$app/types').RouteId
): Promise<void>;
```

</div>



## preloadData

Programmatically preloads the given page, which means
 1. ensuring that the code for the page is loaded, and
 2. calling the page's load function with the appropriate options.

This is the same behaviour that SvelteKit triggers when the user taps or mouses over an `<a>` element with `data-sveltekit-preload-data`.
If the next navigation is to `href`, the values returned from load will be used, making navigation instantaneous.
Returns a Promise that resolves with the result of running the new route's `load` functions once the preload is complete.

<div class="ts-block">

```dts
function preloadData(href: string): Promise<
	(
		| {
				type: 'loaded';
				data: Record<string, any>;
		  }
		| {
				type: 'redirect';
				location: string;
		  }
		| {
				type: 'error';
				error: App.Error;
		  }
	) & {
		status: number;
	}
>;
```

</div>



## pushState

<blockquote class="tag deprecated note">

Use `goto(url, { state, shallow: true })` instead.

</blockquote>

Programmatically create a new history entry with the given `page.state`. Used for [shallow routing](/docs/kit/shallow-routing).

<div class="ts-block">

```dts
function pushState(
	url: string | URL,
	state: App.PageState
): Promise<void>;
```

</div>



## refreshAll

Causes all currently active remote functions to refresh, and all `load` functions belonging to the currently active page to re-run.
Returns a `Promise` that resolves when the page is subsequently updated.

<div class="ts-block">

```dts
function refreshAll(): Promise<void>;
```

</div>



## replaceState

<blockquote class="tag deprecated note">

Use `goto(url, { state, shallow: true, replace: true })` instead.

</blockquote>

Programmatically replace the current history entry with the given `page.state`. Used for [shallow routing](/docs/kit/shallow-routing).

<div class="ts-block">

```dts
function replaceState(
	url: string | URL,
	state: App.PageState
): Promise<void>;
```

</div>



## snapshot

A lifecycle function that captures state before navigating and restores it when traversing history.

By default, the snapshot `id` is generated from the call site. Pass an explicit `id` to keep snapshots stable across deployments or distinguish multiple uses of a shared helper.

The optional `reset` callback runs on navigations where there is no captured value to restore, such as when a new history entry is created. Captured values are serialized with the app's transport hook.

`snapshot` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```dts
function snapshot<T>(options: {
	id?: string;
	capture: () => T;
	restore: (value: T) => void;
	reset?: () => void;
}): void;
```

</div>



## AfterNavigate

The argument passed to [`afterNavigate`](/docs/kit/$app-navigation#afterNavigate) callbacks.

<div class="ts-block">

```dts
type AfterNavigate = (Navigation | NavigationEnter) & {
	type: Exclude<NavigationType, 'leave'>;
	/**
	 * Since `afterNavigate` callbacks are called after a navigation completes, they will never be called with a navigation that unloads the page.
	 */
	willUnload: false;
};
```

</div>

## BeforeNavigate

The argument passed to [`beforeNavigate`](/docs/kit/$app-navigation#beforeNavigate) callbacks.

<div class="ts-block">

```dts
type BeforeNavigate = Navigation & {
	/**
	 * Call this to prevent the navigation from starting.
	 */
	cancel: () => void;
};
```

</div>

## GotoOptions

<div class="ts-block">

```dts
interface GotoOptions {/*…*/}
```

<div class="ts-block-property">

```dts
replace?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, replaces the current history entry rather than creating a new one.

</div>
</div>

<div class="ts-block-property">

```dts
replaceState?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Use `replace` instead.

</div>

</div>
</div>

<div class="ts-block-property">

```dts
shallow?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, updates the URL and `page.state` without navigating.

</div>
</div>

<div class="ts-block-property">

```dts
reset?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true, or false when `shallow` is true`

</div>

If `true`, resets the scroll position (to the top of the page, or to the element
matching the URL's `#hash` if there is one) and resets focus (to the `<body>`, or the
`autofocus` element if there is one) once the navigation completes.

If `false`, the current scroll position and focused element are left alone.

</div>
</div>

<div class="ts-block-property">

```dts
refreshAll?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, reruns all `load` functions and queries of the page.

</div>
</div>

<div class="ts-block-property">

```dts
invalidate?: Array<string | URL | ((url: URL) => boolean)>;
```

<div class="ts-block-property-details">

Causes any `load` functions to rerun if they depend on one of the URLs.

</div>
</div>

<div class="ts-block-property">

```dts
invalidateAll?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Use `refreshAll` instead.

</div>

</div>
</div>

<div class="ts-block-property">

```dts
state?: App.PageState;
```

<div class="ts-block-property-details">

An optional object that will be available as `page.state`.

</div>
</div>

<div class="ts-block-property">

```dts
persistState?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, `page.state` will be restored after a full page reload.

</div>
</div></div>

## Navigation

<div class="ts-block">

```dts
type Navigation =
	| NavigationExternal
	| NavigationFormSubmit
	| NavigationPopState
	| NavigationLink;
```

</div>

## NavigationBase

<div class="ts-block">

```dts
interface NavigationBase {/*…*/}
```

<div class="ts-block-property">

```dts
type: NavigationType;
```

<div class="ts-block-property-details">

The type of navigation:
- `enter`: The app has hydrated/started
- `form`: The user submitted a `<form method="GET">`
- `goto`: Navigation was triggered by a `goto(...)` call or a redirect
- `leave`: The app is being left either because the tab is being closed or a navigation to a different document is occurring
- `link`: Navigation was triggered by a link click
- `popstate`: Navigation was triggered by back/forward navigation

</div>
</div>

<div class="ts-block-property">

```dts
shallow: boolean;
```

<div class="ts-block-property-details">

Whether this is a shallow navigation.

</div>
</div>

<div class="ts-block-property">

```dts
from: NavigationTarget | null;
```

<div class="ts-block-property-details">

Where navigation was triggered from

</div>
</div>

<div class="ts-block-property">

```dts
to: NavigationTarget | null;
```

<div class="ts-block-property-details">

Where navigation is going to/has gone to

</div>
</div>

<div class="ts-block-property">

```dts
willUnload: boolean;
```

<div class="ts-block-property-details">

Whether or not the navigation will result in the page being unloaded (i.e. not a client-side navigation).

</div>
</div>

<div class="ts-block-property">

```dts
complete: Promise<void>;
```

<div class="ts-block-property-details">

A promise that resolves once the navigation is complete, and rejects if the navigation
fails or is aborted. In the case of a `willUnload` navigation, the promise will never resolve

</div>
</div></div>

## NavigationEnter

The navigation that occurs when the app starts/hydrates

<div class="ts-block">

```dts
interface NavigationEnter extends NavigationBase {/*…*/}
```

<div class="ts-block-property">

```dts
type: 'enter';
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
delta?: undefined;
```

<div class="ts-block-property-details">

In case of a history back/forward navigation, the number of steps to go back/forward

</div>
</div>

<div class="ts-block-property">

```dts
event?: undefined;
```

<div class="ts-block-property-details">

Dispatched `Event` object when navigation occurred by `popstate` or `link`.

</div>
</div></div>

## NavigationExternal

<div class="ts-block">

```dts
type NavigationExternal = NavigationGoto | NavigationLeave;
```

</div>

## NavigationFormSubmit

A navigation triggered by a `<form method="GET">`

<div class="ts-block">

```dts
interface NavigationFormSubmit extends NavigationBase {/*…*/}
```

<div class="ts-block-property">

```dts
type: 'form';
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
event: SubmitEvent;
```

<div class="ts-block-property-details">

The `SubmitEvent` that caused the navigation

</div>
</div></div>

## NavigationGoto

A navigation triggered by a `goto(...)` call or a redirect

<div class="ts-block">

```dts
interface NavigationGoto extends NavigationBase {/*…*/}
```

<div class="ts-block-property">

```dts
type: 'goto';
```

<div class="ts-block-property-details"></div>
</div></div>

## NavigationLeave

A navigation triggered by the tab being closed, or the user navigating to a different document

<div class="ts-block">

```dts
interface NavigationLeave extends NavigationBase {/*…*/}
```

<div class="ts-block-property">

```dts
type: 'leave';
```

<div class="ts-block-property-details"></div>
</div></div>

## NavigationLink

A navigation triggered by a link click

<div class="ts-block">

```dts
interface NavigationLink extends NavigationBase {/*…*/}
```

<div class="ts-block-property">

```dts
type: 'link';
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
event: PointerEvent;
```

<div class="ts-block-property-details">

The `PointerEvent` that caused the navigation

</div>
</div></div>

## NavigationPopState

A navigation triggered by back/forward navigation

<div class="ts-block">

```dts
interface NavigationPopState extends NavigationBase {/*…*/}
```

<div class="ts-block-property">

```dts
type: 'popstate';
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
delta: number;
```

<div class="ts-block-property-details">

In case of a history back/forward navigation, the number of steps to go back/forward

</div>
</div>

<div class="ts-block-property">

```dts
event: PopStateEvent;
```

<div class="ts-block-property-details">

The `PopStateEvent` that caused the navigation

</div>
</div></div>

## NavigationTarget

Information about the target of a specific navigation.

<div class="ts-block">

```dts
interface NavigationTarget<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	RouteId extends AppRouteId | null = AppRouteId | null
> {/*…*/}
```

<div class="ts-block-property">

```dts
params: Params | null;
```

<div class="ts-block-property-details">

Parameters of the target page - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object.
Is `null` if the target is not part of the SvelteKit app (could not be resolved to a route).

</div>
</div>

<div class="ts-block-property">

```dts
route: {/*…*/};
```

<div class="ts-block-property-details">

Info about the target route

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
id: RouteId | null;
```

<div class="ts-block-property-details">

The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`. It is `null` when no route is matched.

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
url: URL;
```

<div class="ts-block-property-details">

The URL that is navigated to

</div>
</div>

<div class="ts-block-property">

```dts
scroll: { x: number; y: number } | null;
```

<div class="ts-block-property-details">

The scroll position associated with this navigation.

For the `from` target, this is the scroll position at the moment of navigation.

For the `to` target, this represents the scroll position that will be or was restored:
- In `beforeNavigate` and `onNavigate`, this is only available for `popstate` navigations (back/forward button)
	and will be `null` for other navigation types, since the final scroll position isn't known
	ahead of time.
- In `afterNavigate`, this is always the scroll position that was applied after the navigation
	completed.

</div>
</div></div>

## NavigationType

- `enter`: The app has hydrated/started
- `form`: The user submitted a `<form method="GET">`
- `goto`: Navigation was triggered by a `goto(...)` call or a redirect
- `leave`: The app is being left either because the tab is being closed or a navigation to a different document is occurring
- `link`: Navigation was triggered by a link click
- `popstate`: Navigation was triggered by back/forward navigation

<div class="ts-block">

```dts
type NavigationType =
	| 'enter'
	| 'form'
	| 'leave'
	| 'link'
	| 'goto'
	| 'popstate';
```

</div>

## OnNavigate

The argument passed to [`onNavigate`](/docs/kit/$app-navigation#onNavigate) callbacks.

<div class="ts-block">

```dts
type OnNavigate = Navigation & {
	type: Exclude<NavigationType, 'enter' | 'leave'>;
	/**
	 * Since `onNavigate` callbacks are called immediately before a client-side navigation, they will never be called with a navigation that unloads the page.
	 */
	willUnload: false;
};
```

</div>

# $app/paths

```js
// @noErrors
import { asset, match, resolve } from '$app/paths';
```

## asset

<blockquote class="since note">

Available since 2.26

</blockquote>

Resolve the URL of an asset in your `static` directory, by prefixing it with [`config.paths.assets`](/docs/kit/configuration#paths) if configured, or otherwise by prefixing it with the base path.

During server rendering, the base path is relative and depends on the page currently being rendered.

```svelte
<script>
	import { asset } from '$app/paths';
</script>

<img alt="a potato" src={asset('potato.jpg')} />
```

<div class="ts-block">

```dts
function asset(file: AssetPath): string;
```

</div>



## match

<blockquote class="since note">

Available since 2.52.0

</blockquote>

Match a path or URL to a route ID and extracts any parameters.

```js
// @errors: 7031
import { match } from '$app/paths';

const route = await match('blog/hello-world');

if (route?.id === '/blog/[slug]') {
	const slug = route.params.slug;
	const response = await fetch(`/api/posts/${slug}`);
	const post = await response.json();
}
```

<div class="ts-block">

```dts
function match(url: URL | string): Promise<
	| {
			[K in RouteId]: {
				id: K;
				params: RouteParams<K>;
			};
	  }[RouteId]
	| null
>;
```

</div>



## resolve

<blockquote class="since note">

Available since 2.26

</blockquote>

Resolve a pathname by prefixing it with the base path, if any, or resolve a route ID by populating dynamic segments with parameters.
In hash routing mode, the returned URL starts with `#`.

During server rendering, the base path is relative and depends on the page currently being rendered.

```js
// @errors: 7031
import { resolve } from '$app/paths';

// using a pathname
const resolved = resolve(`blog/hello-world`);

// using a route ID plus parameters
const resolved = resolve('/blog/[slug]', {
	slug: 'hello-world'
});
```

<div class="ts-block">

```dts
function resolve<
	T extends
		| RouteIdWithSearchOrHash
		| PathnameWithSearchOrHash
>(...args: ResolveArgs<T>): ResolvedPathname;
```

</div>





> [!LEGACY]
> `base`, `assets`, and `resolveRoute` were removed in 3.0

# $app/server

```js
// @noErrors
import {
	command,
	form,
	getRequestEvent,
	prerender,
	query,
	read,
	requested
} from '$app/server';
```

## command

<blockquote class="since note">

Available since 2.27

</blockquote>

Creates a remote command. When called from the browser, the function will be invoked on the server via a `fetch` call.

See [Remote functions](/docs/kit/remote-functions#command) for full documentation.

<div class="ts-block">

```dts
function command<Output>(
	fn: () => MaybePromise<Output>
): RemoteCommand<void, Output>;
```

</div>

<div class="ts-block">

```dts
function command<Input, Output>(
	validate: 'unchecked',
	fn: (arg: Input) => MaybePromise<Output>
): RemoteCommand<Input, Output>;
```

</div>

<div class="ts-block">

```dts
function command<Schema extends StandardSchemaV1, Output>(
	validate: Schema,
	fn: (
		arg: StandardSchemaV1.InferOutput<Schema>
	) => MaybePromise<Output>
): RemoteCommand<
	StandardSchemaV1.InferInput<Schema>,
	Output
>;
```

</div>



## form

<blockquote class="since note">

Available since 2.27

</blockquote>

Creates a form object that can be spread onto a `<form>` element.

See [Remote functions](/docs/kit/remote-functions#form) for full documentation.

<div class="ts-block">

```dts
function form<Output>(
	fn: () => MaybePromise<Output>
): RemoteForm<void, Output>;
```

</div>

<div class="ts-block">

```dts
function form<Input extends RemoteFormInput, Output>(
	validate: 'unchecked',
	fn: (
		data: Input,
		issue: RemoteFormInvalidField<Input>
	) => MaybePromise<Output>
): RemoteForm<Input, Output>;
```

</div>

<div class="ts-block">

```dts
function form<
	Schema extends StandardSchemaV1<
		RemoteFormInput,
		Record<string, any>
	>,
	Output
>(
	validate: true extends HasNonOptionalBoolean<
		StandardSchemaV1.InferInput<Schema>
	>
		? 'Error: All booleans in form schemas must be optional (e.g. `v.optional(v.boolean(), false)`) because checkbox inputs do not send a false value when unchecked.'
		: Schema,
	fn: (
		data: StandardSchemaV1.InferOutput<Schema>,
		issue: RemoteFormInvalidField<
			StandardSchemaV1.InferInput<Schema>
		>
	) => MaybePromise<Output>
): RemoteForm<StandardSchemaV1.InferInput<Schema>, Output>;
```

</div>



## getRequestEvent

<blockquote class="since note">

Available since 2.20.0

</blockquote>

Returns the current `RequestEvent`. Can be used inside server hooks, server `load` functions, actions, and endpoints (and functions called by them).

In environments without [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage), this must be called synchronously (i.e. not after an `await`).

<div class="ts-block">

```dts
function getRequestEvent(): RequestEvent;
```

</div>



## prerender

<blockquote class="since note">

Available since 2.27

</blockquote>

Creates a remote prerender function. When called from the browser, the function will be invoked on the server via a `fetch` call.

See [Remote functions](/docs/kit/remote-functions#prerender) for full documentation.

<div class="ts-block">

```dts
function prerender<Output>(
	fn: () => MaybePromise<Output>,
	options?:
		| {
				inputs?: RemotePrerenderInputsGenerator<void>;
				dynamic?: boolean;
		  }
		| undefined
): RemotePrerenderFunction<void, Output>;
```

</div>

<div class="ts-block">

```dts
function prerender<Input, Output>(
	validate: 'unchecked',
	fn: (arg: Input) => MaybePromise<Output>,
	options?:
		| {
				inputs?: RemotePrerenderInputsGenerator<Input>;
				dynamic?: boolean;
		  }
		| undefined
): RemotePrerenderFunction<Input, Output>;
```

</div>

<div class="ts-block">

```dts
function prerender<Schema extends StandardSchemaV1, Output>(
	schema: Schema,
	fn: (
		arg: StandardSchemaV1.InferOutput<Schema>
	) => MaybePromise<Output>,
	options?:
		| {
				inputs?: RemotePrerenderInputsGenerator<
					StandardSchemaV1.InferInput<Schema>
				>;
				dynamic?: boolean;
		  }
		| undefined
): RemotePrerenderFunction<
	StandardSchemaV1.InferInput<Schema>,
	Output
>;
```

</div>



## query

<blockquote class="since note">

Available since 2.27

</blockquote>

Creates a remote query. When called from the browser, the function will be invoked on the server via a `fetch` call.

See [Remote functions](/docs/kit/remote-functions#query) for full documentation.

<div class="ts-block">

```dts
function query<Output>(
	fn: () => MaybePromise<Output>
): RemoteQueryFunction<void, Output>;
```

</div>

<div class="ts-block">

```dts
function query<Input, Output>(
	validate: 'unchecked',
	fn: (arg: Input) => MaybePromise<Output>
): RemoteQueryFunction<Input, Output>;
```

</div>

<div class="ts-block">

```dts
function query<Schema extends StandardSchemaV1, Output>(
	schema: Schema,
	fn: (
		arg: StandardSchemaV1.InferOutput<Schema>
	) => MaybePromise<Output>
): RemoteQueryFunction<
	StandardSchemaV1.InferInput<Schema>,
	Output,
	StandardSchemaV1.InferOutput<Schema>
>;
```

</div>



## read

<blockquote class="since note">

Available since 2.4.0

</blockquote>

Read the contents of an imported asset from the filesystem

```js
// @errors: 7031
import { read } from '$app/server';
import somefile from './somefile.txt';

const asset = read(somefile);
const text = await asset.text();
```

<div class="ts-block">

```dts
function read(asset: string): Response;
```

</div>



## requested

Inside a remote `command` or `form` callback, returns an iterable
of `{ arg, query }` entries for the query instances the client asked to refresh, up to
the supplied `limit`. Each `query` is a `RemoteQuery` bound to the original
client-side cache key, so `refresh()` / `set()` propagate correctly even when
the query's schema transforms the input. `arg` is the *validated* argument,
i.e. the value after the schema has run (so `InferOutput<Schema>` for queries
declared with a Standard Schema).

Arguments that fail validation or exceed `limit` are recorded as failures in
the response to the client.
See [Client-requested refreshes](/docs/kit/remote-functions#Single-flight-mutations-Client-requested-refreshes)
for usage in a remote `command` or `form`.

```ts
import { requested } from '$app/server';

for (const { arg, query } of requested(getPost, 5)) {
	// `arg` is the validated argument; `query` is bound to the client's
	// cache key. It's safe to throw away this promise -- SvelteKit will
	// await it and forward any errors to the client.
	void query.refresh();
}
```

As a shorthand for the above, you can also call `refreshAll` on the result:

```ts
import { requested } from '$app/server';

await requested(getPost, 5).refreshAll();
```

Works with `query.batch` as well — refreshes for individual entries are
collected into a single batched call.

For live queries, the same applies, but with `reconnect` and `reconnectAll`.

<div class="ts-block">

```dts
function requested<Input, Output, Validated = Input>(
	query: RemoteQueryFunction<Input, Output, Validated>,
	limit: number
): RemoteQueryRequestedResult<Validated, Output>;
```

</div>

<div class="ts-block">

```dts
function requested<Input, Output, Validated = Input>(
	query: RemoteLiveQueryFunction<Input, Output, Validated>,
	limit: number
): RemoteLiveQueryRequestedResult<Validated, Output>;
```

</div>



## RemoteCommand

The type of a remote `command` function. See [Remote functions](/docs/kit/remote-functions#command) for full documentation.

<div class="ts-block">

```dts
type RemoteCommand<Input, Output> = {
	(
		arg: undefined extends Input ? Input | void : Input
	): Promise<Output> & {
		updates(
			...updates: RemoteQueryUpdate[]
		): Promise<Output>;
	};
	/** The number of pending command executions */
	get pending(): number;
};
```

</div>

## RemoteForm

The type of a remote `form` function. See [Remote functions](/docs/kit/remote-functions#form) for full documentation.

<div class="ts-block">

```dts
type RemoteForm<
	Input extends RemoteFormInput | void,
	Output
> = RemoteForm_<Input, Output, [Input]>;
```

</div>

## RemoteFormEnhanceCallback

The callback passed to a remote form's `enhance` method. See [Remote functions](/docs/kit/remote-functions#form) for full documentation.

<div class="ts-block">

```dts
type RemoteFormEnhanceCallback<
	Input extends RemoteFormInput | void =
		RemoteFormInput | void,
	Output = any
> = (
	form: RemoteFormEnhanceInstance<Input, Output>
) => MaybePromise<void>;
```

</div>

## RemoteFormEnhanceInstance

The form instance as received inside an `enhance` callback. See [Remote functions](/docs/kit/remote-functions#form) for full documentation.

<div class="ts-block">

```dts
type RemoteFormEnhanceInstance<
	Input extends RemoteFormInput | void =
		RemoteFormInput | void,
	Output = any
> = Omit<
	RemoteForm<Input, Output>,
	'enhance' | 'element'
> & {
	readonly element: HTMLFormElement;
};
```

</div>

## RemoteFormField

Form field accessor type that provides name(), value(), and issues() methods

<div class="ts-block">

```dts
type RemoteFormField<Value extends RemoteFormFieldValue> =
	RemoteFormFieldMethods<Value> & {
		/**
		 * Returns an object that can be spread onto an input element with the correct type attribute,
		 * aria-invalid attribute if the field is invalid, and appropriate value/checked property getters/setters.
		 * @example
		 * ```svelte
		 * <input {...myForm.fields.myString.as('text')} />
		 * <input {...myForm.fields.myNumber.as('number')} />
		 * <input {...myForm.fields.myBoolean.as('checkbox')} />
		 * ```
		 */
		as<T extends RemoteFormFieldType<Value>>(
			...args: AsArgs<T, Value>
		): InputElementProps<T, WidenLiteralString<Value>>;
	};
```

</div>

## RemoteFormFieldType

<div class="ts-block">

```dts
type RemoteFormFieldType<T> = {
	[K in keyof InputTypeMap]: T extends InputTypeMap[K]
		? K
		: never;
}[keyof InputTypeMap];
```

</div>

## RemoteFormFieldValue

<div class="ts-block">

```dts
type RemoteFormFieldValue =
	| string
	| string[]
	| number
	| boolean
	| File
	| File[]
	| ImageInputValue;
```

</div>

## RemoteFormFields

Recursive type to build form fields structure with proxy access

<div class="ts-block">

```dts
type RemoteFormFields<T> =
	WillRecurseIndefinitely<T> extends true
		? RecursiveFormFields
		: NonNullable<T> extends
					| string
					| number
					| boolean
					| File
			? RemoteFormField<NonNullable<T>>
			: IsImageInputValue<NonNullable<T>> extends true
				? RemoteFormField<
						NonNullable<T> & ImageInputValue
					> &
						Pick<
							RemoteFormFieldContainer<T>,
							'allIssues'
						> & {
							[K in KeysOfUnion<T>]-?: RemoteFormFields<
								ValueOfUnionKey<T, K>
							>;
						}
				: // [NonNullable<T>] is used to prevent distributing over union while still allowing
					// nullable wrappers (e.g. `string[] | undefined` from a schema with `.default([])`)
					// to be treated as arrays; only the last condition should distribute over unions
					[NonNullable<T>] extends [string[] | File[]]
					? RemoteFormField<NonNullable<T>> & {
							[K in number]: RemoteFormField<
								NonNullable<T>[number]
							>;
						}
					: [NonNullable<T>] extends [Array<infer U>]
						? RemoteFormFieldContainer<NonNullable<T>> & {
								[K in number]: RemoteFormFields<U>;
							}
						: RemoteFormFieldContainer<T> & {
								[K in KeysOfUnion<T>]-?: RemoteFormFields<
									ValueOfUnionKey<T, K>
								>;
							};
```

</div>

## RemoteFormInput

<div class="ts-block">

```dts
interface RemoteFormInput {/*…*/}
```

<div class="ts-block-property">

```dts
[key: string]: MaybeArray<string | number | boolean | File | RemoteFormInput> | undefined;
```

<div class="ts-block-property-details"></div>
</div></div>

## RemoteFormInvalidField

A function and proxy object used to imperatively create validation errors in form handlers.

Access properties to create field-specific issues: `issue.fieldName('message')`.
The type structure mirrors the input data structure for type-safe field access.
Call `invalid(issue.foo(...), issue.nested.bar(...))` to throw a validation error.

<div class="ts-block">

```dts
type RemoteFormInvalidField<T> =
	WillRecurseIndefinitely<T> extends true
		? Record<string | number, any>
		: NonNullable<T> extends
					| string
					| number
					| boolean
					| File
			? (message: string) => StandardSchemaV1.Issue
			: NonNullable<T> extends Array<infer U>
				? {
						[K in number]: RemoteFormInvalidField<U>;
					} & ((message: string) => StandardSchemaV1.Issue)
				: NonNullable<T> extends RemoteFormInput
					? {
							[K in keyof T]-?: RemoteFormInvalidField<
								T[K]
							>;
						} & ((
							message: string
						) => StandardSchemaV1.Issue)
					: Record<string, never>;
```

</div>

## RemoteFormIssue

<div class="ts-block">

```dts
interface RemoteFormIssue {/*…*/}
```

<div class="ts-block-property">

```dts
message: string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
path: Array<string | number>;
```

<div class="ts-block-property-details"></div>
</div></div>

## RemoteLiveQuery

<div class="ts-block">

```dts
type RemoteLiveQuery<T> = RemoteResource<T> &
	AsyncIterable<T> & {
		/** `true` if the live stream is currently connected. */
		readonly connected: boolean;
		/** `true` once the current live stream iterator is done. */
		readonly done: boolean;
		/** Reconnects the live stream immediately. */
		reconnect(): Promise<void>;
	};
```

</div>

## RemoteLiveQueryFunction

The type of a remote `query.live` function. See [Remote functions](/docs/kit/remote-functions#query.live) for full documentation.

The optional `Validated` generic parameter represents the argument type *after* the
query's schema has validated and (optionally) transformed it, and matches the type
yielded by [`requested`](/docs/kit/$app-server#requested).

<div class="ts-block">

```dts
type RemoteLiveQueryFunction<
	Input,
	Output,
	_Validated = Input
> = (
	arg: undefined extends Input ? Input | void : Input
) => RemoteLiveQuery<Output>;
```

</div>

## RemoteLiveQueryRequestedEntry

A single entry yielded by [`requested`](/docs/kit/$app-server#requested)
when called with a `query.live`. `arg` is the validated argument; `query` is a
`RemoteLiveQuery` bound to the client's original cache key, so `reconnect()` targets
the correct client subscription.

<div class="ts-block">

```dts
type RemoteLiveQueryRequestedEntry<Validated, Output> = {
	arg: Validated;
	query: RemoteLiveQuery<Output>;
	/** Explicitly ignore this requested update. */
	ignore: () => void;
};
```

</div>

## RemoteLiveQueryRequestedResult

<div class="ts-block">

```dts
type RemoteLiveQueryRequestedResult<Validated, Output> =
	Iterable<
		RemoteLiveQueryRequestedEntry<Validated, Output>
	> &
		AsyncIterable<
			RemoteLiveQueryRequestedEntry<Validated, Output>
		> & {
			/**
			 * Call `reconnect` on all live queries selected by this `requested` invocation.
			 * This is identical to:
			 * ```ts
			 * import { requested } from '$app/server';
			 *
			 * for await (const { query } of requested(liveQuery, ...)) {
			 *   void query.reconnect();
			 * }
			 * ```
			 */
			reconnectAll: () => Promise<void>;
			/** Explicitly ignore all updates selected by this `requested` invocation. */
			ignoreAll: () => Promise<void>;
		};
```

</div>

## RemotePrerenderFunction

The type of a remote `prerender` function. See [Remote functions](/docs/kit/remote-functions#prerender) for full documentation.

<div class="ts-block">

```dts
type RemotePrerenderFunction<Input, Output> = (
	arg: undefined extends Input ? Input | void : Input
) => RemoteResource<Output>;
```

</div>

## RemoteQuery

<div class="ts-block">

```dts
type RemoteQuery<T> = RemoteResource<T> & {
	/**
	 * On the client, this function will update the value of the query without re-fetching it.
	 *
	 * On the server, this can be called in the context of a `command` or `form` and the specified data will accompany the action response back to the client.
	 * This prevents SvelteKit needing to refresh all queries on the page in a second server round-trip.
	 */
	set(value: T): void;
	/**
	 * On the client, this function will re-fetch the query from the server.
	 *
	 * On the server, this can be called in the context of a `command` or `form` and the refreshed data will accompany the action response back to the client.
	 * This prevents SvelteKit needing to refresh all queries on the page in a second server round-trip.
	 */
	refresh(): Promise<void>;
	/**
	 * Temporarily override a query's value during a [single-flight mutation](https://svelte.dev/docs/kit/remote-functions#Single-flight-mutations) to provide optimistic updates.
	 *
	 * ```svelte
	 * <script>
	 *   import { getTodos, addTodo } from './todos.remote.js';
	 *   const todos = getTodos();
	 * </script>
	 *
	 * <form {...addTodo.enhance(async (form) => {
	 *   await form.submit().updates(
	 *     todos.withOverride((todos) => [...todos, { text: form.fields.text.value() }])
	 *   );
	 * })}>
	 *   <input type="text" name="text" />
	 *   <button type="submit">Add Todo</button>
	 * </form>
	 * ```
	 */
	withOverride(
		update: (current: T) => T
	): RemoteQueryOverride;
};
```

</div>

## RemoteQueryFunction

The return value of a remote `query` function. See [Remote functions](/docs/kit/remote-functions#query) for full documentation.

The optional `Validated` generic parameter represents the argument type *after* the
query's schema has validated and (optionally) transformed it — this is the type the
query's implementation function receives on the server, and the type yielded by
[`requested`](/docs/kit/$app-server#requested). For queries declared
with [Standard Schema](https://standardschema.dev/) it differs from `Input` when the
schema contains a transform (e.g. `v.pipe(v.number(), v.transform(String))` has
`Input = number` but `Validated = string`). For `'unchecked'` validators and queries
without arguments it defaults to `Input`.

<div class="ts-block">

```dts
type RemoteQueryFunction<
	Input,
	Output,
	_Validated = Input
> = (
	arg: undefined extends Input ? Input | void : Input
) => RemoteQuery<Output>;
```

</div>

## RemoteQueryOverride

<div class="ts-block">

```dts
type RemoteQueryOverride = () => void;
```

</div>

## RemoteQueryRequestedResult

<div class="ts-block">

```dts
type RemoteQueryRequestedResult<Validated, Output> =
	Iterable<RequestedEntry<Validated, Output>> &
		AsyncIterable<RequestedEntry<Validated, Output>> & {
			/**
			 * Call `refresh` on all queries selected by this `requested` invocation.
			 * This is identical to:
			 * ```ts
			 * import { requested } from '$app/server';
			 *
			 * for await (const { query } of requested(getPost, ...)) {
			 *   void query.refresh();
			 * }
			 * ```
			 */
			refreshAll: () => Promise<void>;
			/** Explicitly ignore all updates selected by this `requested` invocation. */
			ignoreAll: () => Promise<void>;
		};
```

</div>

## RemoteQueryUpdate

<div class="ts-block">

```dts
type RemoteQueryUpdate =
	| RemoteQuery<any>
	| RemoteLiveQuery<any>
	| RemoteQueryFunction<any, any>
	| RemoteLiveQueryFunction<any, any>
	| RemoteQueryOverride;
```

</div>

## RemoteResource

<div class="ts-block">

```dts
type RemoteResource<T> = Promise<T> & {
	/** The error in case the query fails. */
	get error(): App.Error | undefined;
	/** `true` before the first result is available and during refreshes */
	get loading(): boolean;
} & (
		| {
				/** The current value of the query. Undefined until `ready` is `true` */
				get current(): undefined;
				ready: false;
		  }
		| {
				/** The current value of the query. Undefined until `ready` is `true` */
				get current(): T;
				ready: true;
		  }
	);
```

</div>

## RequestedEntry

A single entry yielded by [`requested`](/docs/kit/$app-server#requested)
when called with a regular `query`. `arg` is the validated argument (the input *after*
the query's schema validated and transformed it, if applicable); `query` is a
`RemoteQuery` bound to the client's original cache key, so `refresh()` / `set()` will
update the correct client entry.

<div class="ts-block">

```dts
type RequestedEntry<Validated, Output> = {
	arg: Validated;
	query: RemoteQuery<Output>;
	/** Explicitly ignore this requested update. */
	ignore: () => void;
};
```

</div>

## RequestedResult

<div class="ts-block">

```dts
type RequestedResult<Validated, Output> =
	| RemoteQueryRequestedResult<Validated, Output>
	| RemoteLiveQueryRequestedResult<Validated, Output>;
```

</div>

## query

<div class="ts-block">

```dts
namespace query {
	/**
	 * Creates a batch query function that collects multiple calls and executes them in a single request
	 *
	 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query.batch) for full documentation.
	 *
	 * @since 2.35
	 */
	function batch<Input, Output>(
		validate: 'unchecked',
		fn: (
			args: Input[]
		) => MaybePromise<(arg: Input, idx: number) => Output>
	): RemoteQueryFunction<Input, Output>;
	/**
	 * Creates a batch query function that collects multiple calls and executes them in a single request
	 *
	 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query.batch) for full documentation.
	 *
	 * @since 2.35
	 */
	function batch<Schema extends StandardSchemaV1, Output>(
		schema: Schema,
		fn: (
			args: StandardSchemaV1.InferOutput<Schema>[]
		) => MaybePromise<
			(
				arg: StandardSchemaV1.InferOutput<Schema>,
				idx: number
			) => Output
		>
	): RemoteQueryFunction<
		StandardSchemaV1.InferInput<Schema>,
		Output,
		StandardSchemaV1.InferOutput<Schema>
	>;
	/**
	 * Creates a live remote query. When called from the browser, the function will be invoked on the server via a streaming `fetch` call.
	 *
	 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query.live) for full documentation.
	 *
	 * */
	function live<Output>(
		fn: (
			arg: void
		) => RemoteLiveQueryUserFunctionReturnType<Output>
	): RemoteLiveQueryFunction<void, Output>;

	function live<Input, Output>(
		validate: 'unchecked',
		fn: (
			arg: Input
		) => RemoteLiveQueryUserFunctionReturnType<Output>
	): RemoteLiveQueryFunction<Input, Output>;

	function live<Schema extends StandardSchemaV1, Output>(
		schema: Schema,
		fn: (
			arg: StandardSchemaV1.InferOutput<Schema>
		) => RemoteLiveQueryUserFunctionReturnType<Output>
	): RemoteLiveQueryFunction<
		StandardSchemaV1.InferInput<Schema>,
		Output,
		StandardSchemaV1.InferOutput<Schema>
	>;
}
```

</div>

# $app/service-worker

This module can only be imported in service workers.



```js
// @noErrors
import { self } from '$app/service-worker';
```

## self

The execution context of a service worker. This export exists to make it easier to
use service workers with the correct types, provided the importing module is governed
by a `tsconfig.json` that extends [`$app/tsconfig/service-worker`](/docs/kit/$app-tsconfig-service-worker).

<div class="ts-block">

```dts
const self: ServiceWorkerGlobalScope;
```

</div>

# $app/state

SvelteKit makes three read-only state objects available via the `$app/state` module — `page`, `navigating` and `updated`.



```js
// @noErrors
import { navigating, page, updated } from '$app/state';
```

## navigating

A read-only object representing an in-progress navigation, with `from`, `to`, `type` and (if `type === 'popstate'`) `delta` properties.
Values are `null` when no navigation is occurring, or during server rendering.

<div class="ts-block">

```dts
const navigating:
	| Navigation
	| {
			from: null;
			to: null;
			type: null;
			willUnload: null;
			delta: null;
			complete: null;
	  };
```

</div>



## page

A read-only reactive object with information about the current page, serving several use cases:
- retrieving the combined `data` of all pages/layouts anywhere in your component tree (also see [loading data](/docs/kit/load))
- retrieving the current value of the `form` prop anywhere in your component tree (also see [form actions](/docs/kit/form-actions))
- retrieving the page state that was set through `goto` (also see [goto](/docs/kit/$app-navigation#goto) and [shallow routing](/docs/kit/shallow-routing))
- retrieving metadata such as the URL you're on, the current route and its parameters, the target of a shallow navigation, and whether or not there was an error

```svelte
<!--- file: +layout.svelte --->
<script>
	import { page } from '$app/state';
</script>

<p>Currently at {page.url.pathname}</p>

{#if page.error}
	<span class="red">Problem detected</span>
{:else}
	<span class="small">All systems operational</span>
{/if}
```

Changes to `page` are available exclusively with runes. (The legacy reactivity syntax will not reflect any changes)

```svelte
<!--- file: +page.svelte --->
<script>
	import { page } from '$app/state';
	const id = $derived(page.params.id); // This will correctly update id for usage on this page
	$: badId = page.params.id; // Do not use; will never update after initial load
</script>
```

On the server, values can only be read during rendering (in other words _not_ in e.g. `load` functions). In the browser, the values can be read at any time.

<div class="ts-block">

```dts
const page: Page;
```

</div>



## updated

A read-only reactive value that's initially `false`. SvelteKit checks for new versions on data, remote, and form action responses (via the `x-sveltekit-version` header), when the tab regains focus or becomes visible, and on a poll interval (see [`version.pollInterval`](/docs/kit/configuration#version)). `updated.current` is set to `true` when a new version is detected. `updated.check()` will force an immediate check, regardless of polling.

<div class="ts-block">

```dts
const updated: {
	get current(): boolean;
	check(): Promise<boolean>;
};
```

</div>



## Page

The shape of the [`page`](/docs/kit/$app-state#page) reactive object.

<div class="ts-block">

```dts
interface Page<
	Params extends AppLayoutParams<'/'> =
		AppLayoutParams<'/'>,
	RouteId extends AppRouteId | null = AppRouteId | null
> {/*…*/}
```

<div class="ts-block-property">

```dts
url: ReadonlyURL & { readonly pathname: ResolvedPathname | (string & {}) };
```

<div class="ts-block-property-details">

The URL of the current page.

</div>
</div>

<div class="ts-block-property">

```dts
params: Params;
```

<div class="ts-block-property-details">

The parameters of the current page - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object.

</div>
</div>

<div class="ts-block-property">

```dts
route: {/*…*/};
```

<div class="ts-block-property-details">

Info about the current route.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
id: RouteId;
```

<div class="ts-block-property-details">

The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`. It is `null` when no route is matched.

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
status: number;
```

<div class="ts-block-property-details">

HTTP status code of the current page.

</div>
</div>

<div class="ts-block-property">

```dts
error: App.Error | null;
```

<div class="ts-block-property-details">

The error object of the current page, if any. Filled from the `handleError` hooks.

</div>
</div>

<div class="ts-block-property">

```dts
data: App.PageData & Record<string, any>;
```

<div class="ts-block-property-details">

The merged result of all data from all `load` functions on the current page. You can type a common denominator through `App.PageData`.

</div>
</div>

<div class="ts-block-property">

```dts
state: App.PageState;
```

<div class="ts-block-property-details">

The page state, which can be manipulated using [`goto`](/docs/kit/$app-navigation#goto) from `$app/navigation`.

</div>
</div>

<div class="ts-block-property">

```dts
shallow: {/*…*/} | null;
```

<div class="ts-block-property-details">

Information about the target of the current shallow navigation, or `null` if no shallow navigation has occurred.

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
params: AppLayoutParams<'/'> | null;
```

<div class="ts-block-property-details">

Parameters of the target route, or `null` if the URL does not resolve to a route.

</div>
</div>
<div class="ts-block-property">

```dts
route: { id: AppRouteId } | null;
```

<div class="ts-block-property-details">

Info about the target route, or `null` if the URL does not resolve to a route.

</div>
</div>
<div class="ts-block-property">

```dts
url: ReadonlyURL;
```

<div class="ts-block-property-details">

The normalized URL passed to `goto(..., { shallow: true })`.

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
form: any;
```

<div class="ts-block-property-details">

Filled only after a form submission. See [form actions](/docs/kit/form-actions) for more info.

</div>
</div></div>

## ReadonlyURL

<div class="ts-block">

```dts
type ReadonlyURL = Readonly<
	Omit<URL, 'searchParams'> & {
		searchParams: ReadonlyURLSearchParams;
	}
>;
```

</div>

## ReadonlyURLSearchParams

<div class="ts-block">

```dts
type ReadonlyURLSearchParams = Omit<
	URLSearchParams,
	'set' | 'append' | 'delete' | 'sort'
>;
```

</div>

# $app/tsconfig

This module contains TypeScript configuration tailored for your app. Your own config should extend it — a typical `tsconfig.json` looks like this:

```json
/// file: tsconfig.json
{
	"extends": "$app/tsconfig",
	"include": ["src", "test"],
	"exclude": ["src/service-worker"]
}
```

You can extend this configuration with your own `compilerOptions`. Overriding the following properties may cause things to break — SvelteKit will warn you if this happens:

- `paths` — this is derived from the (deprecated) [`alias`](configuration#alias) config option, together with any [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) specified in your `package.json`, to align behaviour between Vite and TypeScript. Ideally, configure subpath imports rather than using `paths` directly
- `types` — your app needs to be able to 'see' generated module declarations for things like [environment variables](environment-variables), and as such this array must include `"$app/types"`
- `isolatedModules` — must be `true`, as Vite compiles modules one at a time
- `verbatimModuleSyntax` — must be `true`, so that you can safely use type imports in `.svelte` files

Note that the example configuration above excludes `src/service-worker`, because service workers need to be in their own TypeScript project. If you are using a service worker, create a `src/service-worker/tsconfig.json` that extends [`$app/tsconfig/service-worker`]($app-tsconfig-service-worker).

# $app/tsconfig/service-worker

This module contains TypeScript configuration tailored for your service worker:

```json
/// file: src/service-worker/tsconfig.json
{
	"extends": "$app/tsconfig/service-worker"
}
```

You can extend this configuration with your own `compilerOptions`, adhering to the same restrictions as [`$app/tsconfig`]($app-tsconfig).

# $app/types

This module contains generated types for the routes in your app.

<blockquote class="since note">
	<p>Available since 2.26</p>
</blockquote>

```js
// @noErrors
import type { RouteId, PageRouteId, EndpointRouteId, RouteParams, LayoutParams } from '$app/types';
```

## AssetPath

A union of all the filenames of assets contained in your `static` directory, relative to the `base` path.

<div class="ts-block">

```dts
type AssetPath = 'favicon.png' | 'robots.txt' | (string & {});
```

</div>

## RouteId

A union of all the route IDs in your app — the union of `PageRouteId` and `EndpointRouteId`. Used for `page.route.id` and `event.route.id`.

<div class="ts-block">

```dts
type RouteId = '/' | '/my-route' | '/my-other-route/[param]' | '/my-endpoint';
```

</div>

## PageRouteId

A union of the route IDs in your app that have a `+page`.

A route ID can be in both `PageRouteId` and `EndpointRouteId`, if its directory contains both a `+page` and a `+server`. In the example below, `/my-route` has both.

<div class="ts-block">

```dts
type PageRouteId = '/' | '/my-route' | '/my-other-route/[param]';
```

</div>

## EndpointRouteId

A union of the route IDs in your app that have a `+server`.

A route ID can be in both `PageRouteId` and `EndpointRouteId`, if its directory contains both a `+page` and a `+server`. In the example below, `/my-route` has both.

<div class="ts-block">

```dts
type EndpointRouteId = '/my-route' | '/my-endpoint';
```

</div>

## Path

A union of all valid paths in your app, relative to the `base` path.

<div class="ts-block">

```dts
type Path = '' | 'my-route' | `my-other-route/${string}` & {};
```

</div>

## ResolvedPathname

Similar to `Path`, but prefixed with a [base path](configuration#paths). Used for `page.url.pathname`.

<div class="ts-block">

```dts
type ResolvedPathname = `${'' | `/${string}`}/` | `${'' | `/${string}`}/my-route` | `${'' | `/${string}`}/my-other-route/${string}` | {};
```

</div>

## RouteParams

A utility for getting the parameters associated with a given route.

```ts
// @errors: 2552
type BlogParams = RouteParams<'/blog/[slug]'>; // { slug: string }
```

<div class="ts-block">

```dts
type RouteParams<T extends RouteId> = { /* generated */ } | Record<string, never>;
```

</div>

## LayoutParams

A utility for getting the parameters associated with a given layout, which is similar to `RouteParams` but also includes optional parameters for any child route. It accepts the route ID of any directory containing a layout, including layout-only directories that are not part of `RouteId`.

<div class="ts-block">

```dts
type LayoutParams<T extends '/' | '/my-layout' | '/my-other-layout'> = { /* generated */ };
```

</div>

