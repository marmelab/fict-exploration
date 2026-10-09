<script lang="ts">
  import { getOne } from "./dataProvider";
  import { errorMessage } from "./errors";
  import type { AnyFieldConfig, AnyRecord, AnyResourceConfig } from "./types";

  let { resource, id }: { resource: AnyResourceConfig; id: number } = $props();

  let fields: AnyFieldConfig[] = $derived(resource.showFields ?? []);
  let record: Promise<AnyRecord> = $derived(getOne(resource.name, id));
</script>

{#await record}
  <div class="loading">Loading…</div>
{:then data}
  <div class="show-view">
    <div class="show-header">
      <a href={`#/${resource.name}`}>&larr; Back to list</a>
      <h1>{resource.name} #{id}</h1>
    </div>
    <div class="show-fields">
      {#each fields as field (field.source)}
        <div class="field">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>{field.label || field.source}</label>
          <span>{String(data[field.source] ?? "")}</span>
        </div>
      {/each}
    </div>
  </div>
{:catch error}
  <div class="error">{errorMessage(error)}</div>
{/await}
