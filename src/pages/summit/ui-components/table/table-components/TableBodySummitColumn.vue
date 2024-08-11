<template>
  <div v-if="col.name === 'status'">
    <q-toggle
      :model-value="col.value"
      checked-icon="check"
      unchecked-icon="clear"
      :color="color"
      @update:model-value="emit('onToggleStatus')"
    />
    <span :class="`text-${color}`">
      {{ name }}
    </span>
  </div>
  <span v-else> {{ col.value }}</span>
</template>
<script setup lang="ts">
import { IPropsTableCustom } from '../table.interface';

defineProps<IPropsTableCustom>();
const emit = defineEmits<{
  (event: 'onToggleStatus'): void;
}>();
</script>
