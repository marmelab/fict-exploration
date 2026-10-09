<script setup lang="ts" vapor>
import { computed, onMounted, onUnmounted, ref } from "vue";
import List from "./List.vue";
import Show from "./Show.vue";
import type { ResourceConfigs } from "./types";

const props = defineProps<{ resources: ResourceConfigs }>();

const hash = ref(window.location.hash);
const onHashChange = () => (hash.value = window.location.hash);
onMounted(() => window.addEventListener("hashchange", onHashChange));
onUnmounted(() => window.removeEventListener("hashchange", onHashChange));

const route = computed(() => {
  const path = hash.value.replace(/^#\/?/, "");
  const [resource = "", idStr] = path.split("/");
  const id = idStr != null ? parseInt(idStr, 10) : NaN;
  return { resource, id: !isNaN(id) ? id : null };
});

const currentResource = computed(() =>
  props.resources.find((r) => r.name === route.value.resource),
);
</script>

<template>
  <div class="admin-layout">
    <nav class="admin-sidebar">
      <a href="#/" class="admin-title">Vue Admin</a>
      <ul>
        <li v-for="r in resources" :key="r.name">
          <a
            :href="`#/${r.name}`"
            :class="route.resource === r.name ? 'active' : ''"
          >
            {{ r.name }}
          </a>
        </li>
      </ul>
    </nav>
    <main class="admin-content">
      <template v-if="currentResource">
        <Show
          v-if="route.id !== null && currentResource.showFields"
          :key="`show:${currentResource.name}:${route.id}`"
          :resource="currentResource"
          :id="route.id"
        />
        <List v-else :key="`list:${currentResource.name}`" :resource="currentResource" />
      </template>
      <div v-else class="admin-dashboard">
        <h1>Dashboard</h1>
        <p>Select a resource from the sidebar.</p>
      </div>
    </main>
  </div>
</template>
