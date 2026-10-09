import {
  createSignal,
  ErrorBoundary,
  For,
  Match,
  onCleanup,
  onMount,
  Suspense,
  Switch,
} from "solid-js";
import { List } from "./List";
import { ShowView } from "./Show";
import type { Resources } from "./types";

type FieldConfig<T extends keyof Resources> = {
  source: keyof Resources[T] & string;
  label?: string;
};

export type ResourceConfig<T extends keyof Resources> = {
  name: T;
  listFields?: FieldConfig<T>[];
  showFields?: FieldConfig<T>[];
};

type AnyResourceConfig = {
  [K in keyof Resources]: ResourceConfig<K>;
}[keyof Resources];

export type ResourceConfigs = AnyResourceConfig[];

type AnyResourceName = keyof Resources & string;

// Anything can be thrown, not just an Error, so narrow before reading `.message`.
function errorFallback(err: unknown) {
  return (
    <div class="error">{err instanceof Error ? err.message : String(err)}</div>
  );
}

export function Admin(props: { resources: ResourceConfigs }) {
  const [hash, setHash] = createSignal(window.location.hash);

  onMount(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    onCleanup(() => window.removeEventListener("hashchange", handler));
  });

  const route = () => {
    const path = hash().replace(/^#\/?/, "");
    const [resource = "", idStr] = path.split("/");
    const id = idStr != null ? parseInt(idStr, 10) : NaN;
    return { resource, id: isNaN(id) ? null : id };
  };

  const currentResource = () =>
    props.resources.find((r) => r.name === route().resource) as
      | ResourceConfig<AnyResourceName>
      | undefined;

  const showTarget = () => {
    const resource = currentResource();
    const id = route().id;
    return resource && id !== null && resource.showFields
      ? { resource, id }
      : null;
  };

  return (
    <div class="admin-layout">
      <nav class="admin-sidebar">
        <a href="#/" class="admin-title">
          Solid Admin
        </a>
        <ul>
          <For each={props.resources}>
            {(r) => (
              <li>
                <a
                  href={`#/${r.name}`}
                  class={route().resource === r.name ? "active" : ""}
                >
                  {r.name}
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
      <main class="admin-content">
        <Switch
          fallback={
            <div class="admin-dashboard">
              <h1>Dashboard</h1>
              <p>Select a resource from the sidebar.</p>
            </div>
          }
        >
          {/* `keyed` recreates the branch, and with it a fresh ErrorBoundary,
              when the route changes. Without it, Solid keeps the boundary
              mounted and an error stays on screen after navigating away. */}
          <Match when={showTarget()} keyed>
            {(target) => (
              <ErrorBoundary fallback={errorFallback}>
                <Suspense fallback={<div class="loading">Loading…</div>}>
                  <ShowView resource={target.resource} id={target.id} />
                </Suspense>
              </ErrorBoundary>
            )}
          </Match>
          <Match when={currentResource()} keyed>
            {(resource) => (
              <ErrorBoundary fallback={errorFallback}>
                <Suspense fallback={<div class="loading">Loading…</div>}>
                  <List resource={resource} />
                </Suspense>
              </ErrorBoundary>
            )}
          </Match>
        </Switch>
      </main>
    </div>
  );
}
