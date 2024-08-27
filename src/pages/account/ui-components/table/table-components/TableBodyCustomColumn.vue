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
  <q-avatar size="md" v-else-if="col.name == 'avatar'">
    <img
      v-if="typeof col.value == 'string' && col.value"
      :src="String(col.value)"
    />
    <span v-else>AV</span>
  </q-avatar>
  <span v-else> {{ col.value }}</span>
</template>
<script setup lang="ts">
import { IPropsTableCustom } from '../table.interface';

defineProps<IPropsTableCustom>();
const emit = defineEmits<{
  (event: 'onToggleStatus'): void;
}>();
</script>
