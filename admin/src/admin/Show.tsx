import type { ResourceConfig } from "./Admin";
import { getOne } from "./dataProvider";
import type { Resources } from "./types";

// The field list is configuration-driven, so the lookup key is only known at
// runtime. Reading it through a parameter keeps the dynamic access off the
// reactive binding itself (FICT-H).
function cellValue(row: Record<string, unknown>, source: string) {
  return String(row[source] ?? "");
}

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
  const data = (record.data ?? {}) as Record<string, unknown>;

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
            <span>{cellValue(data, f.source)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
