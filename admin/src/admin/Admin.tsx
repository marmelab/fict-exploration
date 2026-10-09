import { $effect, ErrorBoundary, Suspense } from "fict";
import { createSignal } from "fict/advanced";
import { List } from "./List";
import { Show } from "./Show";
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

type Route = { resource: string; id: number | null };

// The location hash lives in a module-level signal because its writes come from
// a DOM event listener, which sits outside any component's reactive ownership.
const hashSignal = createSignal(window.location.hash);

// Call this from inside a JSX expression: each read re-runs when the hash
// changes. Assigning it to a plain `const` in a component would freeze it.
function currentRoute(): Route {
  const path = hashSignal().replace(/^#\/?/, "");
  const [resource = "", idStr] = path.split("/");
  const id = idStr != null ? parseInt(idStr, 10) : NaN;
  return { resource, id: !isNaN(id) ? id : null };
}

// For an async error (a resource rejecting inside <Suspense>), Fict calls the
// fallback from inside the effect that failed. A plain helper creates its text
// bindings right there, so they belong to the crashed subtree, and Fict
// destroys them along with it: the result is an empty <div class="error" />.
// Synchronous errors and an inline `fallback={(err) => ...}` are not affected.
// A capitalized helper counts as a component; if it computes anything in a
// `const`, it throws "Invalid hook call", since there is no render to hook into.
// Returning a component element lets Fict instantiate it later, under its own
// root, so its bindings survive.
function ErrorMessage({ message }: { message: string }) {
  return <div class="error">{message}</div>;
}

// Anything can be thrown, not just an Error, so narrow before reading .message.
function errorFallback(err: unknown) {
  return (
    <ErrorMessage
      message={err instanceof Error ? err.message : String(err)}
    />
  );
}

// The route arrives as a prop so everything derived from it stays reactive.
function AdminContent({
  resources,
  route,
}: {
  resources: ResourceConfigs;
  route: Route;
}) {
  const resourceName = route.resource;
  const id = route.id;
  const currentResource = resources.find((r) => r.name === resourceName);

  if (!currentResource) {
    return (
      <div class="admin-dashboard">
        <h1>Dashboard</h1>
        <p>Select a resource from the sidebar.</p>
      </div>
    );
  }

  if (id !== null && currentResource.showFields) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<div class="loading">Loading…</div>}>
          <Show
            resource={
              currentResource as ResourceConfig<keyof Resources & string>
            }
            id={id}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<div class="loading">Loading…</div>}>
        <List
          resource={currentResource as ResourceConfig<keyof Resources & string>}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

export function Admin({ resources }: { resources: ResourceConfigs }) {
  $effect(() => {
    const handler = () => hashSignal(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  });

  return (
    <div class="admin-layout">
      <nav class="admin-sidebar">
        <a href="#/" class="admin-title">
          Fict Admin
        </a>
        <ul>
          {resources.map((r) => (
            <li key={r.name}>
              <a
                href={`#/${r.name}`}
                class={currentRoute().resource === r.name ? "active" : ""}
              >
                {r.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main class="admin-content">
        <AdminContent resources={resources} route={currentRoute()} />
      </main>
    </div>
  );
}
