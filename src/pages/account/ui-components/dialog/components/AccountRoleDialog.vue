<template>
  <q-dialog v-model="isShowDialog" persistent>
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form @submit="onSetRoleOfAccount">
        <div class="row">
          <q-avatar class="col q-mx-sm">
            <img :src="avatar" />
          </q-avatar>
          <div class="col-auto text-center">
            <div class="text-h5 text-info">
              Assign role to
              <span class="text-bold">{{ account?.name }}</span>
              <span v-if="account?.institution">
                (of {{ account?.institution }})
              </span>
              <span v-if="account?.role"> (from {{ account?.role }}) </span>
            </div>
          </div>
        </div>
        <q-card-section>
          <div class="row justify-between q-col-gutter-x-lg">
            <div class="col-12">
              <q-select v-model="role" :options="options" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <div class="row justify-between q-col-gutter-x-sm">
            <div>
              <q-btn
                color="negative"
                label="cancel"
                outline
                :disable="busy"
                rounded
                v-close-popup
              />
            </div>
            <div>
              <q-btn
                color="primary"
                label="Assign"
                :loading="busy"
                rounded
                type="submit"
              />
            </div>
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { IProfile, Roles, RoleType } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { theWorkflows } from 'src/workflows/the.workflows';
import { useProfileStore } from 'src/stores/profile-store';

const isShowDialog = ref(false);
const busy = ref(false);
const role = ref<RoleType>();
const options = ref<string[]>([...Roles]);
const account = ref<IProfile>();
const doneCb = ref<(profile: IProfile) => void>();
const errorCb = ref<ErrorCallback>();

async function onSetRoleOfAccount() {
  if (!account.value) {
    errorCb.value && errorCb.value(new Error('No account'));
    isShowDialog.value = false;
    return;
  }
  busy.value = true;
  theWorkflows.emit({
    type: 'assignRole',
    arg: {
      payload: account.value,
      role: role.value,
      done(profile) {
        busy.value = false;
        isShowDialog.value = false;
        doneCb.value && doneCb.value(profile);
      },
      error(e) {
        busy.value = false;
        isShowDialog.value = false;
        errorCb.value && errorCb.value(e);
      },
    },
  });
}
const avatar = computed(() => {
  const url = account.value?.avatar;
  if (!url || url == '#') return 'https://cdn.quasar.dev/img/boy-avatar.png';
  return url;
});
theDialogs.on({
  type: 'setAccountRoleDialog',
  permissions: ['admin'],
  info: { module: 'auth', icon: 'support_agent' },
  async cb(e) {
    const profileStore = useProfileStore();
    const user = await profileStore.getUserAsync();
    if (!user?.role || !/^(admin)$/.test(user?.role)) {
      e.error && e.error(new Error('denied'));
      return;
    }
    doneCb.value = e.done;
    errorCb.value = e.error;
    account.value = e.profile;
    role.value = e.profile.role;
    if (user.role == 'admin') {
      options.value = ['No role', ...Roles];
    } else if (user.role == 'moderator') {
      options.value = ['No role', ...Roles].filter(
        (r) => !/^(admin|moderator)$/.test(r)
      );
    }
    isShowDialog.value = true;
  },
});
</script>
<style scoped></style>
