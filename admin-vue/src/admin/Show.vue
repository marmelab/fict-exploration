<script setup lang="ts" vapor>
import { computed } from "vue";
import { getOne } from "./dataProvider";
import { errorMessage } from "./errors";
import type { AnyRecord, AnyResourceConfig } from "./types";
import { useAsync } from "./useAsync";

const props = defineProps<{ resource: AnyResourceConfig; id: number }>();

const fields = computed(() => props.resource.showFields ?? []);
const name = computed(() => props.resource.name);

const { data, error, pending } = useAsync(
  () => getOne(props.resource.name, props.id) as Promise<AnyRecord>,
);

// Only read in the v-else branch, where the fetch has resolved.
const record = computed(() => data.value ?? ({} as AnyRecord));
</script>

<template>
  <div v-if="pending" class="loading">Loading…</div>
  <div v-else-if="error" class="error">{{ errorMessage(error) }}</div>
  <div v-else class="show-view">
    <div class="show-header">
      <a :href="`#/${name}`">&larr; Back to list</a>
      <h1>{{ name }} #{{ id }}</h1>
    </div>
    <div class="show-fields">
      <div v-for="field in fields" :key="field.source" class="field">
        <label>{{ field.label || field.source }}</label>
        <span>{{ String(record[field.source] ?? "") }}</span>
      </div>
    </div>
  </div>
</template>
