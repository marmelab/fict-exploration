import type { ResourceConfig } from "./Admin";
import { getList } from "./dataProvider";
import type { Resources } from "./types";

export function List<T extends keyof Resources & string>({
  resource,
}: {
  resource: ResourceConfig<T>;
}) {
  const resourceName = { resource: resource.name };
  const record = getList.read(resourceName);

  const fields = resource.listFields || [];
  const name = resource.name;
  const showFields = resource.showFields;
  const data = record.data as Resources[T][] | undefined;

  return (
    <div class="list-view">
      <h1>{name}</h1>
      <table class="data-table">
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.source}>{f.label || f.source}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row) => (
            <tr key={row.id}>
              {fields.map((f) => (
                <td key={f.source}>{String(row[f.source] ?? "")}</td>
              ))}
              <td>
                {showFields && (
                  <a class="show-link" href={`#/${name}/${row.id}`}>
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
