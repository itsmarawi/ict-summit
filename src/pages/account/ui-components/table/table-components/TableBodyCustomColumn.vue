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
  <q-avatar v-else-if="col.name == 'avatar'">
    <img
      :src="String(col.value) || 'https://cdn.quasar.dev/img/boy-avatar.png'"
    />
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
