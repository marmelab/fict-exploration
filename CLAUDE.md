# Fict — Coding Skill

This project uses **Fict**, a compile-time reactive UI framework. Write plain JavaScript/TypeScript with JSX — the compiler handles signals, memos, and DOM updates.

## Project Structure

pnpm workspace (`pnpm-workspace.yaml`) with six packages:

- `basic/` — minimal Fict counter demo (`src/main.tsx`)
- `admin/` — Fict admin UI demo with List/Show views and a `dataProvider` (`src/admin/`)
- `admin-react/`, `admin-solid/`, `admin-svelte/`, `admin-vue/` — the same admin in React 19, Solid 1.9, Svelte 5 and Vue 3.6 Vapor (a release candidate, `3.6.0-rc.9`), for comparison. Same features, routing, API and CSS.

The Fict packages depend on `fict@^0.36.0` and build with Vite 8 + `@fictjs/vite-plugin@^0.36.0`. This file describes the Fict 0.36 API.

## Commands

```bash
pnpm install                  # install workspace deps
pnpm dev:admin                # dev servers for all five admins
pnpm build                    # build every package
pnpm -F fict-basic dev        # dev server for basic
pnpm -F fict-admin dev        # dev server for admin
pnpm -F fict-admin build      # tsc && vite build
pnpm -F fict-admin lint       # eslint (admin only)
pnpm -F admin-solid build     # same for admin-react, admin-svelte, admin-vue
```

## Golden Rules

1. **Components run ONCE.** Only reactive expressions re-execute on state change.
2. **Derived values are automatic.** Never wrap computations in `useMemo` or `createMemo` — just write `const x = a + b`.
3. **Mutate state directly.** `count++` and `count = count + 1` both work.
4. **Use native JS control flow.** `if`/`else`, ternaries, `.map()` — no special components needed.
5. **Props destructuring is safe.** Reactivity is preserved through destructured props.
6. **`$state` only at top level.** Not inside conditionals or loops.
7. **Import every macro.** `$state`, `$effect`, `$memo` and `$store` must be imported from `"fict"`, or the build fails with `FICT-HIR-MACRO-UNBOUND`.

---

## Fict 0.36 Strict Mode — Read This First

`strictGuarantee` is on by default and forced on in production builds. When the compiler can't prove an update will propagate, the build fails. `FICT-R002`, `FICT-R005` and `FICT-H` cannot be suppressed (`fict-ignore` is rejected): change the code.

| Symptom | Fix |
| --- | --- |
| `FICT-R005` when writing `$state` from a callback given to the browser (`addEventListener`, `setInterval`) | Use a component-level `$store` written from `onMount`, or a `createSignal` from `fict/advanced` |
| `FICT-R002` when passing a prop-derived value to an unknown function (`resource.read({ name: resource.name })`) | Name it in a `const` first. The `reactive(() => …)` accessor only compiles when the resource is declared in the same module |
| `FICT-R002`/`R005` on a `.map()` callback that reads a prop object | Hoist the members into `const`s above the JSX (`const name = resource.name`) |
| `FICT-H` on `obj[key]` where `obj` is reactive | Move the lookup into a helper that takes the object as a parameter |

Silent traps (no diagnostic at all):

- Reading a `createSignal` accessor into a component-level `const` freezes it. Only `$state`, `$store` and props seed derived memos. Read signals inside JSX or inside functions.
- Array destructuring with a default (`const [a = "", b] = path.split("/")`) is not memoized, so it freezes too.
- `.map()` + `key` compiles to a keyed list over `$state`, but not over `createSignal` or `$store`: every change rebuilds all rows. Check the emitted code for `createKeyedList`.
- An `ErrorBoundary` fallback written as a named helper returning JSX renders an empty element for async errors (a resource rejecting inside `<Suspense>`). Write the fallback inline, or have the helper return a component element.

Tooling: the Vite plugin doesn't print compiler warnings unless you pass `onWarn`, and `@fictjs/eslint-plugin` reports none of the strict diagnostics. To iterate on one file, call `transformSync({ protocolVersion: COMPILER_PROTOCOL_VERSION, filename, code, options: {} })` from `@fictjs/compiler`: it returns `diagnostics` and the emitted `code`.

---

## Reactivity Core

### `$state` — Reactive state (compiler macro)

```tsx
let count = $state(0); // primitive
let user = $state({ name: "Alice" }); // object (immutable updates)
let items = $state<string[]>([]); // typed array

count++; // direct mutation ✅
user = { ...user, name: "Bob" }; // immutable update for objects ✅
items = [...items, "new"]; // immutable update for arrays ✅
```

### `$store` — Deep reactive proxy

```tsx
import { $store } from "fict";

const state = $store({
  user: { name: "Alice", settings: { theme: "dark" } },
  items: [1, 2, 3],
});
state.user.name = "Bob"; // fine-grained deep update ✅
state.items.push(4); // array mutation ✅
```

| Use `$state` for           | Use `$store` for         |
| -------------------------- | ------------------------ |
| Primitives, simple objects | Complex nested state     |
| Reassignment-based updates | Direct property mutation |

### Derived Values — Automatic

```tsx
let price = $state(100);
let qty = $state(2);
const subtotal = price * qty; // auto-derived
const tax = subtotal * 0.1; // chains work
const total = subtotal + tax;
```

No annotation needed. The compiler infers the dependency graph.

### `$memo` — Explicit memo (rarely needed)

```tsx
const expensive = $memo(() => todos.reduce((acc, t) => acc + t.text.length, 0));
```

Use only when caching must be enforced. The compiler auto-derives most cases.

### `$effect` — Side effects

```tsx
$effect(() => {
  console.log(`count is now ${count}`);
  return () => {
    /* cleanup — runs before next execution & on destroy */
  };
});
```

- Deps tracked automatically — no dependency arrays.
- Cleanup runs before re-execution and when component is destroyed.
- Avoid `async/await` inside `$effect`; use `resource` for async work.

---

## Lifecycle

```tsx
import { onMount, onDestroy, onCleanup } from "fict";

onMount(() => {
  // DOM is ready. Optional: return cleanup function.
  return () => console.log("unmounted");
});

onDestroy(() => {
  /* component destroyed */
});

// Inside an effect — runs when the effect's scope cleans up
$effect(() => {
  const sub = subscribe(topic);
  onCleanup(() => sub.unsubscribe());
});
```

---

## Scheduling & Control

```tsx
import {
  batch,
  untrack,
  startTransition,
  useTransition,
  useDeferredValue,
} from "fict";

// Batch multiple updates into one DOM flush
batch(() => {
  firstName = "Jane";
  lastName = "Smith";
  age = 30;
});

// Skip tracking a dependency
$effect(() => {
  if (untrack(() => logEnabled)) console.log(count);
});

// Low-priority transitions
startTransition(() => {
  results = performSearch(query);
});

// Transition with pending state
const [isPending, start] = useTransition();
start(() => {
  data = [...data, ...moreItems];
});

// Deferred value (lower-priority updates)
const deferredQuery = useDeferredValue(() => query);
```

---

## JSX Patterns

### Conditional rendering

```tsx
{
  show ? <Modal /> : null;
}
{
  show && <Modal />;
}

// if-return — compiler makes it reactive
if (count > 10) return <Special />;
return <Normal />;
```

### List rendering — always provide `key`

```tsx
{
  todos.map((todo) => <li key={todo.id}>{todo.text}</li>);
}
```

Keys must be **unique** and **stable** (use IDs, not array indices).

### Event handling

```tsx
<button onClick={() => count++}>+</button>
<input onInput={(e) => name = e.currentTarget.value} />
```

---

## Components & Props

```tsx
function Greeting({ name, age = 18 }: { name: string; age?: number }) {
  const label = `${name} (${age})`; // auto-derived from props
  return <span>{label}</span>;
}

<Greeting name={userName} age={25} />;
```

### `mergeProps` — Merge defaults with user props

```tsx
import { mergeProps } from "fict";

function Button(props: { class?: string; children?: FictNode }) {
  const merged = mergeProps({ class: "btn", type: "button" }, props);
  return <button class={merged.class}>{merged.children}</button>;
}
```

### `prop` — Mark reactive getter (rare, for dynamic prop objects)

```tsx
import { prop } from "fict";
const payload = { theme: prop(() => currentTheme) };
```

---

## Refs

```tsx
import { createRef, onMount } from "fict";

// Object ref
const inputRef = createRef<HTMLInputElement>();
onMount(() => inputRef.current?.focus());
<input ref={inputRef} />;

// Callback ref
let el: HTMLDivElement | null = null;
<div ref={(r) => (el = r)} />;
```

---

## Context

```tsx
import { createContext, useContext, hasContext } from "fict";

const ThemeContext = createContext<"light" | "dark">("light");

// Provider
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>;

// Consumer
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button class={theme === "dark" ? "btn-dark" : "btn-light"}>Click</button>
  );
}

// Guard
if (hasContext(OptionalCtx)) {
  /* ... */
}
```

For reactive context values, pass signals/stores:

```tsx
import { createSignal } from "fict/advanced";

const CounterCtx = createContext({ count: () => 0, increment: () => {} });

function Provider(props: { children: any }) {
  const count = createSignal(0);
  return (
    <CounterCtx.Provider value={{ count, increment: () => count(count() + 1) }}>
      {props.children}
    </CounterCtx.Provider>
  );
}
```

---

## Error Boundaries & Suspense

```tsx
import { ErrorBoundary, Suspense } from "fict";

<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
  onError={(err) => console.error(err)}
>
  <Suspense fallback={<div>Loading...</div>}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>;
```

ErrorBoundary props: `fallback`, `onError`, `resetKeys`.
Suspense props: `fallback`, `onResolve`, `onReject`, `resetKeys`.

---

## Extended API (`fict/plus`)

### `resource` — Async data with caching & Suspense

```tsx
import { resource } from "fict/plus";
import { reactive } from "fict/advanced";

// Declared in the same module as the component: `reactive()` only compiles then.
const userResource = resource({
  fetch: async ({ signal }, userId: string) => {
    const res = await fetch(`/api/users/${userId}`, { signal });
    return res.json();
  },
  cache: { mode: "memory", ttlMs: 5 * 60 * 1000, staleWhileRevalidate: true },
  suspense: true, // enable Suspense mode
});

function UserCard({ userId }: { userId: string }) {
  const user = userResource.read(reactive(() => userId));
  // Without suspense: check user.loading, user.error, user.data
  // With suspense: user.data is guaranteed inside <Suspense>
  return <h2>{user.data?.name}</h2>;
}
```

Resource methods: `.read(args)`, `.refresh()`, `.invalidate(key?)`, `.prefetch(args)`, `.mutate(args, value, opts?)`.

### `lazy` — Code splitting

```tsx
import { lazy } from "fict/plus";

const HeavyChart = lazy(() => import("./HeavyChart"));
// HeavyChart.preload() — eagerly preload
// HeavyChart.reset()   — clear cached module

<Suspense fallback="Loading...">
  <HeavyChart />
</Suspense>;
```

---

## Low-Level APIs (`fict/advanced`)

Use `$state` inside components. Use these for shared/module-level/non-component code.

```tsx
import { createSignal, createSelector } from "fict/advanced";
import { createMemo, createEffect, createRoot } from "fict";

// Signal — getter/setter in one function
const count = createSignal(0);
count(); // read
count(5); // write
count(count() + 1); // update from previous

// Memo
const doubled = createMemo(() => count() * 2);

// Effect (returns disposer)
const dispose = createEffect(() => {
  console.log(count());
});

// Selector — optimized list item subscription
const isSelected = createSelector(selectedId);
isSelected(item.id); // true/false, fine-grained

// Root — isolated reactive context
const { value, dispose } = createRoot(() => {
  /* ... */
});
```

### Scope utilities

```tsx
import { createScope, runInScope, effectScope } from "fict/advanced";

const scope = createScope();
scope.run(() => {
  /* reactive work */
});
scope.stop();

runInScope(
  () => show,
  () => {
    /* conditional scope */
  },
);

const dispose = effectScope(() => {
  /* collected effects */
});
```

---

## DOM Rendering

```tsx
import { render, Fragment } from "fict";

const unmount = render(() => <App />, document.getElementById("app")!);

// Fragment — multiple elements without wrapper
<>
  <h1>Title</h1>
  <p>Text</p>
</>;
```

---

## Project Setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import fict from "@fictjs/vite-plugin";
export default defineConfig({ plugins: [fict()] });
```

```json
// tsconfig.json
{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "fict" } }
```

---

## Execution Model — What Reruns?

```tsx
function Example() {
  console.log("A"); // 🔵 runs ONCE
  let count = $state(0);
  const doubled = count * 2;
  console.log("B", doubled); // 🟢 reruns when count changes
  return <div>{doubled}</div>; // 🟢 DOM text updates surgically
}
```

- Code **before** `$state`: runs once
- Expressions **using** state: recompute on dependency change
- Static JSX: runs once

---

## SSR (`@fictjs/ssr`)

```tsx
import { renderToString } from "@fictjs/ssr"; // string
import { renderToStream } from "@fictjs/ssr"; // web ReadableStream
import { renderToPipeableStream } from "@fictjs/ssr"; // Node.js stream
import { renderToPartial } from "@fictjs/ssr"; // partial prerendering (preview)

// Shell-first streaming
const { pipe, shellReady, allReady } = renderToPipeableStream(() => <App />, {
  mode: "shell",
});
```

---

## Common Pitfalls

- **Don't** use `useMemo`, `useCallback`, `createSignal` (inside components), `createMemo` — Fict handles this.
- **Don't** call state values as functions (`count()`) — just use `count` directly.
- **Don't** use `.value` to read state — just use the variable name.
- **Don't** use `$state` inside loops or conditionals.
- **Don't** use `async/await` in `$effect` — use `resource` instead.
- **Do** use immutable patterns for `$state` arrays: `items = [...items, newItem]`.
- **Do** use `$store` when you need deep mutation on nested objects.
- **Do** provide unique, stable `key` props on list items.
- **Do** use `createSignal` for module-level shared state outside components, and read it inside JSX or functions, never into a `const`.
- **Don't** extract an `ErrorBoundary` fallback into a helper that returns JSX directly: return a component element, or write it inline.
