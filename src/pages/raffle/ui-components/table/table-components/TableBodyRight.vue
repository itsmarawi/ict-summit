<template>
  <q-td class="bg-primary" auto-width>
    <div class="q-gutter-x-xs">
      <template v-for="(elem, idx) in elements" :key="idx">
        <q-btn
          :color="elem.color"
          :icon="elem.icon"
          :disable="elem.disable"
          :loading="elem.loading"
          size="12px"
          round
          dense
          @click="emit(elem.event)"
        >
          <q-tooltip>{{ elem.toolTip || elem.label }}</q-tooltip>
        </q-btn>
      </template>
    </div>
  </q-td>
</template>
<script setup lang="ts">
import { IPropsTableElements, TEvents } from '../table.interface';

defineProps<IPropsTableElements>();
const emit = defineEmits<{
  (event: TEvents): void;
}>();
</script>
