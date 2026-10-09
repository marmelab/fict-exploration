import { createResource, For } from "solid-js";
import type { ResourceConfig } from "./Admin";
import { getOne } from "./dataProvider";
import type { Resources } from "./types";

export function ShowView<T extends keyof Resources & string>(props: {
  resource: ResourceConfig<T>;
  id: number;
}) {
  const [record] = createResource(
    () => ({ resource: props.resource.name, id: props.id }),
    (params: { resource: T; id: number }) => getOne(params.resource, params.id),
  );

  const fields = () => props.resource.showFields ?? [];

  return (
    <div class="show-view">
      <div class="show-header">
        <a href={`#/${props.resource.name}`}>&larr; Back to list</a>
        <h1>
          {props.resource.name} #{props.id}
        </h1>
      </div>
      <div class="show-fields">
        <For each={fields()}>
          {(f) => (
            <div class="field">
              <label>{f.label || f.source}</label>
              <span>{String(record()?.[f.source] ?? "")}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
