<template>
  <q-item-label v-if="col.name === 'status'">
    <q-toggle
      :model-value="col.value"
      checked-icon="check"
      unchecked-icon="clear"
      :color="color"
      @update:model-value="emit('onToggleStatus')"
    />
  </q-item-label>
  <q-avatar size="md" v-else-if="col.name == 'avatar'">
    <img
      v-if="typeof col.value == 'string' && col.value"
      :src="String(col.value)"
    />
    <span>AV</span>
  </q-avatar>
  <q-item-label
    v-else
    caption
    class="text-subtitle2 text-info text-weight-light"
  >
    {{ col.value }}
  </q-item-label>
</template>
<script setup lang="ts">
import { IPropsTableCustom } from '../table.interface';

defineProps<IPropsTableCustom>();
const emit = defineEmits<{
  (event: 'onToggleStatus'): void;
}>();
</script>
