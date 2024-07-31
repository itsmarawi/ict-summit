<template>
  <q-avatar :size="size">
    <img v-if="/:/.test(avatar)" :src="avatar" />
    <span v-else class="text-h6">{{ avatar }}</span>
  </q-avatar>
</template>
<script setup lang="ts">
import {computed} from 'vue';
import {useProfileStore} from 'src/stores/profile-store';
const profileStore = useProfileStore();

interface ITheAvatar {
  size?: string;
}
defineProps<ITheAvatar>();

const avatar = computed(() => {
  const user = profileStore.getUser();
  const url = user?.avatar;
  if (!url || url == '#')
    return (
      user?.name
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || ''
    );
  return url;
});
</script>
