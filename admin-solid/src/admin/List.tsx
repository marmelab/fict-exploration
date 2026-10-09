import { createResource, For, Show as When } from "solid-js";
import type { ResourceConfig } from "./Admin";
import { getList } from "./dataProvider";
import type { Resources } from "./types";

export function List<T extends keyof Resources & string>(props: {
  resource: ResourceConfig<T>;
}) {
  const [rows] = createResource(
    () => props.resource.name,
    (name: T) => getList(name),
  );

  const fields = () => props.resource.listFields ?? [];

  return (
    <div class="list-view">
      <h1>{props.resource.name}</h1>
      <table class="data-table">
        <thead>
          <tr>
            <For each={fields()}>{(f) => <th>{f.label || f.source}</th>}</For>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <For each={rows() ?? []}>
            {(row) => (
              <tr>
                <For each={fields()}>
                  {(f) => <td>{String(row[f.source] ?? "")}</td>}
                </For>
                <td>
                  <When when={props.resource.showFields}>
                    <a
                      class="show-link"
                      href={`#/${props.resource.name}/${row.id}`}
                    >
                      Show
                    </a>
                  </When>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
