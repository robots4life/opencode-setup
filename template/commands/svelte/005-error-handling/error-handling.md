---
description: SvelteKit error handling — expected vs unexpected errors, error objects, rendering errors, handleError, handleValidationError
---

## handleValidationError

This hook is called when a remote function is called with an argument that does not match the provided [Standard Schema](https://standardschema.dev/). It must return an object matching the shape of [`App.Error`](types#Error).

Say you have a remote function that expects a string as its argument ...

```js
/// file: todos.remote.js
import * as v from "valibot";
import { query } from "$app/server";

export const getTodo = query(v.string(), (id) => {
  // implementation...
});
```

...but it is called with something that doesn't match the schema — such as a number (e.g. `await getTodos(1)`) — then validation will fail, the server will respond with a [400 status code](https://http.dog/400), and the function will throw with the message 'Bad Request'.

To customise this message and add additional properties to the error object, implement `handleValidationError`:

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleValidationError} */
export function handleValidationError({ issues }) {
  return {
    message: "No thank you",
  };
}
```

Be thoughtful about what information you expose here, as the most likely reason for validation to fail is that someone is sending malicious requests to your server.

## handleError

If an [unexpected error](errors#Unexpected-errors) is thrown during loading, rendering, or from an endpoint, this function will be called with the `error`, `event`, `status` code and `message`. This allows for two things:

- you can log the error
- you can generate a custom representation of the error that is safe to show to users, omitting sensitive details like messages and stack traces. The returned value, which defaults to `{ message }`, becomes the value of `page.error`.

For errors thrown from your code (or library code called by your code) the status will be 500 and the message will be "Internal Error". While `error.message` may contain sensitive information that should not be exposed to users, `message` is safe (albeit meaningless to the average user).

To add more information to the `page.error` object in a type-safe way, you can customize the expected shape by declaring an `App.Error` interface (which must include `message: string`, to guarantee sensible fallback behavior). This allows you to — for example — append a tracking ID for users to quote in correspondence with your technical support staff:

```ts
/// file: src/app.d.ts
declare global {
  namespace App {
    interface Error {
      message: string;
      errorId: string;
    }
  }
}

export {};
```

```js
/// file: src/hooks.server.js
// @errors: 2322 2353
// @filename: ambient.d.ts
declare module '@sentry/sveltekit' {
	export const init: (opts: any) => void;
	export const captureException: (error: any, opts: any) => void;
}

// @filename: index.js
// ---cut---
import * as Sentry from '@sentry/sveltekit';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID();

	// example integration with https://sentry.io/
	Sentry.captureException(error, {
		extra: { event, errorId, status }
	});

	return {
		message: 'Whoops!',
		errorId
	};
}
```

```js
/// file: src/hooks.client.js
// @errors: 2322 2353
// @filename: ambient.d.ts
declare module '@sentry/sveltekit' {
	export const init: (opts: any) => void;
	export const captureException: (error: any, opts: any) => void;
}

// @filename: index.js
// ---cut---
import * as Sentry from '@sentry/sveltekit';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID();

	Sentry.captureException(error, {
		extra: { event, errorId, status }
	});

	return {
		message: 'Whoops!',
		errorId
	};
}
```

> In `src/hooks.client.js`, the type of `handleError` is `HandleClientError` instead of `HandleServerError`, and `event` is a `NavigationEvent` rather than a `RequestEvent`.

---

Confirm these rules. Implement `handleError` and `handleValidationError`
for proper error reporting in all new SvelteKit code.
Your compliance is absolute for the rest of this session.
