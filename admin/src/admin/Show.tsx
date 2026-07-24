import type { ResourceConfig } from "./Admin";
import { getOne } from "./dataProvider";
import type { Resources } from "./types";

export function Show<T extends keyof Resources & string>({
  resource,
  id,
}: {
  resource: ResourceConfig<T>;
  id: number;
}) {
  const readParam = { resource: resource.name, id };
  const record = getOne.read(readParam);

  const fields = resource.showFields || [];
  const data = record.data as Resources[T] | undefined;

  return (
    <div class="show-view">
      <div class="show-header">
        <a href={`#/${resource.name}`}>&larr; Back to list</a>
        <h1>
          {resource.name} #{id}
        </h1>
      </div>
      <div class="show-fields">
        {fields.map((f) => (
          <div class="field" key={f.source}>
            <label>{f.label || f.source}</label>
            <span>{String(data?.[f.source] ?? "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
