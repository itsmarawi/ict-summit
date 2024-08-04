<template>
  <q-item-label v-if="col.name === 'status'">
    <q-toggle
      :model-value="col.value == 'released'"
      checked-icon="check"
      unchecked-icon="clear"
      :color="color"
      @update:model-value="emit('onToggleStatus')"
    />
    {{ col.value }}
  </q-item-label>
  <q-item-label v-if="col.name === 'releasedBy'">
    <profile-avatar
      v-if="col.value && typeof col.value == 'object'"
      :profile-key="(col.value as IProfile).key"
    />
    <q-btn
      dense
      flat
      v-else-if="profileStore.theUser?.key == identity"
      icon="redeem"
      @click="emit('onRedem')"
      >Redeem</q-btn
    >
  </q-item-label>
  <q-item-label
    v-else
    caption
    class="text-subtitle2 text-info text-weight-light"
  >
    {{ col.value }}
  </q-item-label>
</template>
<script setup lang="ts">
import ProfileAvatar from 'src/components/common/ProfileAvatar.vue';
import { IPropsTableCustom } from '../table.interface';
import { IProfile } from 'src/entities';
import { useProfileStore } from 'src/stores/profile-store';

const profileStore = useProfileStore();
defineProps<IPropsTableCustom>();
const emit = defineEmits<{
  (event: 'onToggleStatus'): void;
  (event: 'onRedem'): void;
}>();
</script>
