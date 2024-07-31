<template>
  <slot v-if="$slots.customSearch" name="customSearch" />
  <q-input
    v-else
    v-model:model-value="search"
    :class="$q.screen.lt.md ? 'col-12' : 'col-4'"
    input-class="primary"
    type="text"
    label="Search"
    color="primary"
    label-color="primary"
    debounce="500"
    outlined
    rounded
    dense
    @update:model-value="$emit('on-search', search)"
  >
    <template v-slot:prepend>
      <q-icon name="search" color="primary" />
    </template>
    <template v-if="$slots.customButtons && $q.screen.lt.md" #after >
      <slot name="customButtons" />
    </template>
  </q-input>

  <q-space />
  <span v-if="!$q.screen.lt.md">
    <template v-if="actions?.length" >
      <q-btn
        v-for="(elem) in actions" :key="elem.event"
        class="q-ml-xs"
        :color="elem.color"
        :icon="elem.icon"
        :disable="elem.disable"
        rounded
        @click="elem.cb && elem.cb()"
        :label="elem.label"
      >
        <q-tooltip>
          {{ elem.toolTip || elem.label }}
        </q-tooltip>
      </q-btn>
    </template>
    <slot v-else-if="$slots.customButtons" name="customButtons" />
  </span>
</template>
<script setup lang="ts" generic="E extends string">
import { IPropsTableElements } from '../table.interface';
import { ref } from 'vue';

defineProps<IPropsTableElements<E>>();

defineEmits<{
  (event: 'onSearch', payload: string): void;
  (event: E): void;
}>();
const search = ref('');
</script>
