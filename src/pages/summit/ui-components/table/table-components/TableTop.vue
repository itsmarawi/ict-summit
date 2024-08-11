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
    @update:model-value="onSearch"
  >
    <template v-slot:prepend>
      <q-icon name="search" color="primary" />
    </template>
  </q-input>

  <q-space />

  <span v-if="!$q.screen.lt.md">
    <slot v-if="$slots.customButtons" name="customButtons" />
    <template v-else>
      <q-btn
        v-for="(elem, idx) in elements"
        :key="idx"
        class="q-ml-xs"
        :class="elem.isShowBtn === false ? 'hidden' : ''"
        :color="elem.color"
        :icon="elem.icon"
        :disable="elem.disable"
        rounded
        @click="emit(elem.event, '')"
      >
        <q-tooltip>
          {{ elem.toolTip || elem.label }}
        </q-tooltip>
      </q-btn>
    </template>
  </span>
</template>
<script setup lang="ts" generic="T extends string">
import { ref } from 'vue';
import { IPropsTableElements } from '../table.interface';

defineProps<IPropsTableElements<T>>();
const emit = defineEmits<{
  (event: 'onSearch' | T, data: string, searchAll?: boolean): void;
}>();

const search = ref('');
const searchAll = ref(false);

function onSearch() {
  emit('onSearch', search.value, searchAll.value);
}
</script>
