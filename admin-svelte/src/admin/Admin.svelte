<script lang="ts">
  import List from "./List.svelte";
  import Show from "./Show.svelte";
  import type { ResourceConfigs } from "./types";

  let { resources }: { resources: ResourceConfigs } = $props();

  let hash = $state(window.location.hash);

  $effect(() => {
    const handler = () => (hash = window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  });

  let route = $derived.by(() => {
    const path = hash.replace(/^#\/?/, "");
    const [resource = "", idStr] = path.split("/");
    const id = idStr != null ? parseInt(idStr, 10) : NaN;
    return { resource, id: !isNaN(id) ? id : null };
  });

  let currentResource = $derived(
    resources.find((r) => r.name === route.resource),
  );
</script>

<div class="admin-layout">
  <nav class="admin-sidebar">
    <a href="#/" class="admin-title">Svelte Admin</a>
    <ul>
      {#each resources as r (r.name)}
        <li>
          <a href={`#/${r.name}`} class={route.resource === r.name ? "active" : ""}>
            {r.name}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  <main class="admin-content">
    {#if currentResource && route.id !== null && currentResource.showFields}
      <Show resource={currentResource} id={route.id} />
    {:else if currentResource}
      <List resource={currentResource} />
    {:else}
      <div class="admin-dashboard">
        <h1>Dashboard</h1>
        <p>Select a resource from the sidebar.</p>
      </div>
    {/if}
  </main>
</div>
