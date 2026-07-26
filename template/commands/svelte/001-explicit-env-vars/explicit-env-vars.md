---
description: SvelteKit 2.63+ explicit environment variables — src/env.ts, $app/env/private, $app/env/public, validation
---

## Explicit environment variables

As of SvelteKit 2.63, you can opt into _explicit_ environment variables, in which case you instead import environment variables from these modules:

- [`$app/env/private`]($app-env-private)
- [`$app/env/public`]($app-env-public)

Additionally, the [`$app/environment`]($app-environment) module is renamed to [`$app/env`]($app-env).

### Setup

To opt in, update your configuration...

```js
/// file: svelte.config.js
export default {
	kit: {
		experimental: {
			+++explicitEnvironmentVariables: true+++
		}
	}
};
```

...and add a `src/env.ts` (or `src/env.js`) file that exports a `variables` object:

```ts
/// file: src/env.ts
import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  // ...
});
```

Each value in the object passed to [`defineEnvVars`](@sveltejs-kit-env#defineEnvVars) is an [`EnvVarConfig`](@sveltejs-kit#EnvVarConfig) object that configures the environment variable.

### Private variables

By default, all variables are considered private. For example, you don't want to reveal your `API_KEY`:

```ts
/// file: src/env.ts
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	+++API_KEY: {}+++
});
```

Now that `API_KEY` is defined, it can be imported into app code via `$app/env/private`:

```js
import { API_KEY } from "$app/env/private";
```

The `$app/env/private` module cannot be imported into code that runs in the browser, so that you can't accidentally reveal your secrets in a JavaScript bundle.

### Public variables

Some variables are perfectly safe — necessary, even — to expose to the browser. For these, we can specify `public: true`:

```ts
/// file: src/env.ts
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	GOOGLE_ANALYTICS_ID: {
		+++public: true+++
	}
});
```

`GOOGLE_ANALYTICS_ID` can now be imported from `$app/env/public`, or used in your `app.html` template as `%sveltekit.env.GOOGLE_ANALYTICS_ID%`:

```html
<!--- file: src/app.html --->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%

    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=+++%sveltekit.env.GOOGLE_ANALYTICS_ID%+++"
    ></script>

    <script>
      window.dataLayer ??= [];
      function gtag(){dataLayer.push(arguments)}
      gtag('js', new Date());
      gtag('config', +++'%sveltekit.env.GOOGLE_ANALYTICS_ID%'+++);
    </script>
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### Validation

You can specify a [Standard Schema](https://standardschema.dev/) validator such as [Zod](https://zod.dev/) or [Valibot](https://valibot.dev/) to check that an environment variable value is correct:

```ts
/// file: src/env.ts
import { defineEnvVars } from '@sveltejs/kit/env';
+++import * as v from 'valibot';+++

export const variables = defineEnvVars({
	GOOGLE_ANALYTICS_ID: {
		public: true,
		+++schema: v.pipe(v.string(), v.regex(/G-[A-Z0-9]+/))+++
	}
});
```

If a value is invalid, the app will fail to start (or build). To opt out of one or the other, use [`building`]($app-env#building) from `$app/env` along with a validator that accepts an optional value:

```ts
/// file: src/env.ts
import { defineEnvVars } from '@sveltejs/kit/env';
+++import { building } from '$app/env'+++
import * as v from 'valibot';

export const variables = defineEnvVars({
	SECRET: {
		// optional when building but required when starting the app
		+++schema: building ? v.optional(v.string()) : v.string()+++
	}
});
```

You can use validators to make values optional, or transform them (such as turning a string into a boolean, or parsing JSON) — see your validation library's documentation to learn how.

### Static variables

By default, variables are dynamic. If a variable is configured with `static: true`, it will be inlined into your application code, enabling optimisations like dead-code elimination:

```ts
/// file: src/env.ts
import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

export const variables = defineEnvVars({
	SHOW_DEBUG_OVERLAY: {
		public: true,
		+++static: true,+++

		// coerce to true/false
		schema: v.pipe(
			v.optional(v.string(), ''),
			v.transform((str) => str !== '')
		)
	}
});
```

Because this variable is `static`, the `<DebugOverlay>` component shown here will be excluded from the JavaScript bundle unless `SHOW_DEBUG_OVERLAY` is truthy:

```svelte
<script>
	import { SHOW_DEBUG_OVERLAY } from '$app/env/public';
	import DebugOverlay from '$lib/components/DebugOverlay.svelte';
</script>

{#if SHOW_DEBUG_OVERLAY}
	<DebugOverlay />
{/if}
```

But if the variable is set before building the app...

```bash
SHOW_DEBUG_OVERLAY=true npm run build
```

...then the component will be included and shown.

### Documenting variables

You can document the purpose of an environment variable by adding a `description`:

```ts
/// file: src/env.ts
import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  CACHE_TTL_SECONDS: {
    description: "How long to cache responses, in seconds",
  },
});
```

Hovering over `CACHE_TTL_SECONDS` in your app code will show the description.

---

Confirm these rules. Use explicit environment variables (`$app/env/private`,
`$app/env/public`) for all new SvelteKit code. Your compliance is absolute
for the rest of this session.
