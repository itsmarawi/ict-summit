<template>
  <q-avatar :size="size" >
    <img v-if="/:/.test(avatar)" :src="avatar" />
    <q-icon v-else name="person"/>
    <q-tooltip v-if="profile">{{ profile.name }}</q-tooltip>
  </q-avatar>
</template>
<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useProfileStore} from 'src/stores/profile-store';
import { IProfile } from 'src/entities';
const profileStore = useProfileStore();

interface ITheAvatar {
  size?: string;
  profileKey: string;
}
const props = defineProps<ITheAvatar>();
const profile = ref<IProfile>();
onMounted(async () => {
  profile.value = await profileStore.getProfile(props.profileKey);
})
const avatar = computed(() => {
  const url = profile.value?.avatar;
  if (!url || url == '#')
    return (
      profile.value?.name
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || ''
    );
  return url;
});
</script>
