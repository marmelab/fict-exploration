This repository contains my exploration for the fict library. A blog post about this code can be found [here](#no-blog-post-yet).

I build the basic counter app from fict. And I tried to build a fict admin to see how it works in an advanced scenario.

Then I rebuilt that same admin in React, Solid, Svelte and Vue Vapor, to see what each one costs.

## Packages

| Package        | Framework   | Entry point    | Dev port |
| -------------- | ----------- | -------------- | -------- |
| `admin`        | Fict        | `src/main.tsx` | 5173     |
| `admin-react`  | React 19    | `src/main.tsx` | 5174     |
| `admin-solid`  | SolidJS 1.9 | `src/main.tsx` | 5175     |
| `admin-svelte` | Svelte 5    | `src/main.ts`  | 5176     |
| `admin-vue`    | Vue 3.6 Vapor | `src/main.ts` | 5178     |
| `basic`        | Fict        | `src/main.tsx` | 5177     |

The admin app is hash routing, a sidebar, a list table and a detail view over
[jsonplaceholder](https://jsonplaceholder.typicode.com). The five versions share a
byte-identical `src/index.css` and behave the same, so every difference is in the
framework layer.

Each package pins its own dev port, so you can run them all at once:

```bash
pnpm install

pnpm dev          # every package at once
pnpm dev:admin    # just the admin apps, for side by side comparison
pnpm build        # build every package

pnpm -F admin-react dev     # or admin-solid / admin-svelte / admin-vue / fict-admin
```

`pnpm dev` prefixes each log line with the package name. `--strictPort` means a
collision fails instead of silently moving to the next free port.

## How the same app maps onto each framework

| | Fict | React 19 | Solid | Svelte 5 | Vue 3.6 Vapor |
| --- | --- | --- | --- | --- | --- |
| Route state | `createSignal` + `$effect` | `useSyncExternalStore` | `createSignal` + `onCleanup` | `$state` + `$effect` | `ref` + `onMounted` |
| Derived values | plain `const` | plain `const` (re-runs each render) | accessor functions | `$derived` | `computed` |
| Async read | `resource().read()` | `use()` + `<Suspense>` | `createResource` | `{#await}` | `watchEffect` + refs |
| Loading state | `<Suspense>` | `<Suspense>` | `<Suspense>` | `{#await}` pending | `v-if="pending"` |
| Error state | `<ErrorBoundary>` | hand-written class component | `<ErrorBoundary>` | `{:catch}` | `v-else-if="error"` |
| Request cache | built into `resource()` | hand-written promise cache | hand-written promise cache | hand-written promise cache | hand-written promise cache |
| Lists | `.map()` | `.map()` + `key` | `<For>` | `{#each}` keyed | `v-for` + `:key` |
| Props | destructuring is safe | destructuring is safe | **must not destructure** | `$props()` | `defineProps` |

What stood out:

- Only Fict ships a request cache. React, Solid, Svelte and Vue each needed the same
  40-line promise cache to stop refetching on every render. It ends up near identical
  in all four, so the real difference sits in the component layer.
- React has no built-in error boundary, so it needs a class component. It also needs
  `resetKeys`, because a React boundary keeps its error across route changes at the
  same tree position.
- Solid reads closest to Fict, but props must not be destructured. Fict's compiler
  keeps reactivity through destructuring, Solid's proxy does not.
- A cached promise has to keep its rejection. Evicting failed entries looks like a
  sensible retry policy, but under React's `use()` it loops: the boundary re-renders,
  the cache misses, a new request goes out, fails, evicts, repeat. One 404 on
  `#/posts/99999` fired ~80 requests. Retry is explicit now, via `invalidate(key)`.
  Solid and Svelte only re-read when their dependencies change, so the same code was
  harmless there. It takes `use()` to expose it.
- Narrow with `err instanceof Error` before reading `.message`. A rejected `fetch` is
  not the only thing that reaches a boundary.
- Vue Vapor does not support `<Suspense>` yet. Using it renders nothing and warns
  `Vapor component setup() returned non-block value`. Async reads have to go through
  refs and `v-if`, which puts Vue closest to the Svelte port. Keeping `<Suspense>` in
  the tree also pulled the virtual DOM back into the bundle, 35.54 kB gzip against
  28.31 kB without it.

## Bundle size

Vite 8 production build, gzip in parentheses. CSS is 2.45 kB (0.89 kB) everywhere.

| Package        | JS bundle            |
| -------------- | -------------------- |
| `admin-solid`  | 22.41 kB (8.44 kB)   |
| `admin-svelte` | 43.03 kB (16.47 kB)  |
| `admin-vue`    | 76.12 kB (28.31 kB)  |
| `admin`        | 106.61 kB (34.56 kB) |
| `admin-react`  | 224.21 kB (69.93 kB) |

Measured on `fict@0.36.0`. The same app on `fict@0.21.0` built to 68.13 kB (22.65 kB),
so the runtime grew a lot between those releases.

`admin-vue` runs on `vue@3.6.0-rc.9`, a release candidate, because Vapor Mode needs
3.6 and `latest` is still 3.5.
