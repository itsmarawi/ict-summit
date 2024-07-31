<script lang="ts" setup>
import { theDialogs } from 'src/dialogs';
import { useProfileStore } from 'src/stores/profile-store';

import { useRouter } from 'vue-router';
const $router = useRouter();
theDialogs.emit({
  type: 'requireSignUpCode',
  arg: {
    async done(code) {
      const profileStore = useProfileStore();
      const user = await profileStore.getUserAsync();
      if (user) {
        await profileStore.updateProfileProp(user.key, 'institution', code);
        await profileStore.updateProfileProp(user.key, 'role', '');

        $router.replace({
          name: 'home',
        });
      }
    },
    cancel() {
      $router.replace({
        name: 'home',
      });
    },
  },
});
</script>
<template>
  <q-page
    :class="$q.screen.lt.md ? '' : '__background flex flex-center'"
  ></q-page>
</template>
