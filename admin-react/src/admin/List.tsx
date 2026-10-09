import { use } from "react";
import type { ResourceConfig } from "./Admin";
import { getList } from "./dataProvider";
import type { Resources } from "./types";

export function List<T extends keyof Resources & string>({
  resource,
}: {
  resource: ResourceConfig<T>;
}) {
  const data = use(getList(resource.name));

  const fields = resource.listFields || [];

  return (
    <div className="list-view">
      <h1>{resource.name}</h1>
      <table className="data-table">
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.source}>{f.label || f.source}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {fields.map((f) => (
                <td key={f.source}>{String(row[f.source] ?? "")}</td>
              ))}
              <td>
                {resource.showFields && (
                  <a className="show-link" href={`#/${resource.name}/${row.id}`}>
                    Show
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
