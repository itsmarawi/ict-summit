<template>
  <div v-if="col.name === 'status'">
    <q-toggle
      :model-value="col.value == 'released'"
      checked-icon="check"
      unchecked-icon="clear"
      :color="color"
      @update:model-value="emit('onToggleStatus')"
    />
    <span :class="`text-${color}`">
      {{ name }}
    </span>
  </div>
  <q-btn flat v-else-if="col.name == 'name'" @click="emit('onViewPriceQr')">{{
    col.value
  }}</q-btn>
  <span v-else-if="col.name == 'releasedBy' && typeof col.value == 'object'">
    <ProfileAvatar :profile-key="(col.value as IProfile).key" />
    {{ (col.value as IProfile).name }}</span
  >
  <span v-else> {{ col.value }}</span>
</template>
<script setup lang="ts">
import { IProfile } from 'src/entities';
import { IPropsTableCustom } from '../table.interface';
import ProfileAvatar from 'src/components/common/ProfileAvatar.vue';

defineProps<IPropsTableCustom>();
const emit = defineEmits<{
  (event: 'onToggleStatus'): void;
  (event: 'onViewPriceQr'): void;
}>();
</script>
