import { use } from "react";
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
  const data = use(getOne(resource.name, id));

  const fields = resource.showFields || [];

  return (
    <div className="show-view">
      <div className="show-header">
        <a href={`#/${resource.name}`}>&larr; Back to list</a>
        <h1>
          {resource.name} #{id}
        </h1>
      </div>
      <div className="show-fields">
        {fields.map((f) => (
          <div className="field" key={f.source}>
            <label>{f.label || f.source}</label>
            <span>{String(data[f.source] ?? "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
