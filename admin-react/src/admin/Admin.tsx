import { Suspense, useSyncExternalStore } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
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

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHashSnapshot() {
  return window.location.hash;
}

// Anything can be thrown, not just an Error, so narrow before reading `.message`.
function errorFallback(err: unknown) {
  return (
    <div className="error">
      {err instanceof Error ? err.message : String(err)}
    </div>
  );
}

export function Admin({ resources }: { resources: ResourceConfigs }) {
  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot);

  const path = hash.replace(/^#\/?/, "");
  const [resource = "", idStr] = path.split("/");
  const id = idStr != null ? parseInt(idStr, 10) : NaN;
  const route = { resource, id: !isNaN(id) ? id : null };
  const currentResource = resources.find((r) => r.name === route.resource);

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <a href="#/" className="admin-title">
          React Admin
        </a>
        <ul>
          {resources.map((r) => (
            <li key={r.name}>
              <a
                href={`#/${r.name}`}
                className={route.resource === r.name ? "active" : ""}
              >
                {r.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="admin-content">
        {currentResource && route.id !== null && currentResource.showFields ? (
          <ErrorBoundary fallback={errorFallback} resetKeys={[path]}>
            <Suspense fallback={<div className="loading">Loading…</div>}>
              <Show
                resource={
                  currentResource as ResourceConfig<keyof Resources & string>
                }
                id={route.id}
              />
            </Suspense>
          </ErrorBoundary>
        ) : currentResource ? (
          <ErrorBoundary fallback={errorFallback} resetKeys={[path]}>
            <Suspense fallback={<div className="loading">Loading…</div>}>
              <List
                resource={
                  currentResource as ResourceConfig<keyof Resources & string>
                }
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <div className="admin-dashboard">
            <h1>Dashboard</h1>
            <p>Select a resource from the sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
