<template>
  <div v-if="col.name === 'status'">
    <q-toggle
      :model-value="col.value != 'closed'"
      :checked-icon="col.value == 'open' ? 'check' : 'ion-play'"
      unchecked-icon="clear"
      :color="color"
      @update:model-value="emit('onToggleStatus')"
    />
    <span :class="`text-${color}`">
      {{ name }}
    </span>
  </div>
  <div v-else-if="col.name === 'spinning'">
    <q-spinner-pie size="md" v-if="col.value" />
    <q-icon v-else size="md" name="stop" />
  </div>
  <q-btn
    flat
    v-else-if="col.name == 'name'"
    :to="{ name: 'raffle', params: { draw: identity } }"
    >{{ col.value }}</q-btn
  >
  <span v-else> {{ col.value }}</span>
</template>
<script setup lang="ts">
import { IPropsTableCustom } from '../table.interface';

defineProps<IPropsTableCustom>();
const emit = defineEmits<{
  (event: 'onToggleStatus'): void;
}>();
</script>
