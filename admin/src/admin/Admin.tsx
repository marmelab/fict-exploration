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

export function Admin({ resources }: { resources: ResourceConfigs }) {
  const hash = createSignal(window.location.hash);

  $effect(() => {
    const handler = () => hash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  });

  const path = hash().replace(/^#\/?/, "");
  const [resource = "", idStr] = path.split("/");
  const id = idStr != null ? parseInt(idStr, 10) : NaN;
  const route = { resource, id: !isNaN(id) ? id : null };
  const currentResource = resources.find((r) => r.name === route.resource);
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
                class={route.resource === r.name ? "active" : ""}
              >
                {r.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main class="admin-content">
        {currentResource && route.id !== null && currentResource.showFields ? (
          <ErrorBoundary
            fallback={(err: any) => <div class="error">{err.message}</div>}
          >
            <Suspense fallback={<div class="loading">Loading…</div>}>
              <Show
                resource={
                  currentResource as ResourceConfig<keyof Resources & string>
                }
                id={route.id}
              />
            </Suspense>
          </ErrorBoundary>
        ) : currentResource ? (
          <ErrorBoundary
            fallback={(err: any) => <div class="error">{err.message}</div>}
          >
            <Suspense fallback={<div class="loading">Loading…</div>}>
              <List
                resource={
                  currentResource as ResourceConfig<keyof Resources & string>
                }
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <div class="admin-dashboard">
            <h1>Dashboard</h1>
            <p>Select a resource from the sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
