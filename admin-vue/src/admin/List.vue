<script setup lang="ts" vapor>
import { computed } from "vue";
import { getList } from "./dataProvider";
import { errorMessage } from "./errors";
import type { AnyRecord, AnyResourceConfig } from "./types";
import { useAsync } from "./useAsync";

const props = defineProps<{ resource: AnyResourceConfig }>();

const fields = computed(() => props.resource.listFields ?? []);
const name = computed(() => props.resource.name);
const showFields = computed(() => props.resource.showFields);

const { data, error, pending } = useAsync(
  () => getList(props.resource.name) as Promise<AnyRecord[]>,
);
</script>

<template>
  <div v-if="pending" class="loading">Loading…</div>
  <div v-else-if="error" class="error">{{ errorMessage(error) }}</div>
  <div v-else class="list-view">
    <h1>{{ name }}</h1>
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="field in fields" :key="field.source">
            {{ field.label || field.source }}
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data ?? []" :key="row.id">
          <td v-for="field in fields" :key="field.source">
            {{ String(row[field.source] ?? "") }}
          </td>
          <td>
            <a
              v-if="showFields"
              class="show-link"
              :href="`#/${name}/${row.id}`"
            >
              Show
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
