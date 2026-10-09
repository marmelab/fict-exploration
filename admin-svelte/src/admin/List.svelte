<script lang="ts">
  import { getList } from "./dataProvider";
  import { errorMessage } from "./errors";
  import type { AnyFieldConfig, AnyRecord, AnyResourceConfig } from "./types";

  let { resource }: { resource: AnyResourceConfig } = $props();

  let fields: AnyFieldConfig[] = $derived(resource.listFields ?? []);
  let rows: Promise<AnyRecord[]> = $derived(getList(resource.name));
</script>

{#await rows}
  <div class="loading">Loading…</div>
{:then data}
  <div class="list-view">
    <h1>{resource.name}</h1>
    <table class="data-table">
      <thead>
        <tr>
          {#each fields as field (field.source)}
            <th>{field.label || field.source}</th>
          {/each}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data as row (row.id)}
          <tr>
            {#each fields as field (field.source)}
              <td>{String(row[field.source] ?? "")}</td>
            {/each}
            <td>
              {#if resource.showFields}
                <a class="show-link" href={`#/${resource.name}/${row.id}`}>
                  Show
                </a>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:catch error}
  <div class="error">{errorMessage(error)}</div>
{/await}
