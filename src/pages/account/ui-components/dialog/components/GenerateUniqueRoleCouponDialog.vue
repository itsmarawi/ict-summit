<template>
  <q-dialog v-model="isShowDialog" persistent>
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form @submit="generateUCoupon">
        <div class="row">
          <q-avatar class="col q-mx-sm">
            <img :src="avatar" />
          </q-avatar>
          <div class="col-auto text-center">
            <div class="text-h5 text-info">
              Generate Unique Role Coupon
              <span class="text-bold">{{ account?.name }}</span>
              <span v-if="activeSummit"> for {{ activeSummit.name }} </span>
            </div>
          </div>
        </div>
        <q-card-section>
          <div class="row justify-between q-col-gutter-x-lg">
            <div class="col-12">
              <q-select
                v-model="role"
                :options="options"
                @update:model-value="uCoupon = ''"
              />
            </div>
            <div class="col-12" v-if="uCoupon">
              <code lang="plain-text" class="text-h4 text-center">{{
                uCoupon
              }}</code>
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
              <q-btn
                color="info"
                label="Close"
                outline
                :disable="!uCoupon"
                rounded
                v-close-popup
              />
            </div>
            <div>
              <q-btn
                color="primary"
                label="Generate"
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
import { IProfile, ISummit, Roles, RoleType } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { useProfileStore } from 'src/stores/profile-store';
import { Profiler } from 'src/utils/profiler';
const activeSummit = ref<ISummit>();
const isShowDialog = ref(false);
const busy = ref(false);
const role = ref<RoleType>('organizer');
const uCoupon = ref('');
const options = ref<string[]>([...Roles]);
const account = ref<IProfile>();
const doneCb = ref<(profile: IProfile) => void>();
const errorCb = ref<ErrorCallback>();

async function generateUCoupon() {
  if (!account.value || !activeSummit.value) {
    errorCb.value && errorCb.value(new Error('No account'));
    isShowDialog.value = false;
    return;
  }
  uCoupon.value = String(
    Profiler.hashName(
      `${account.value.email}:${activeSummit.value.key}:${role.value}`
    )
  ).replace('-', 'N');
}
const avatar = computed(() => {
  const url = account.value?.avatar;
  if (!url || url == '#') return 'https://cdn.quasar.dev/img/boy-avatar.png';
  return url;
});
theDialogs.on({
  type: 'generateURoleCouponDialog',
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
    activeSummit.value = e.summit;
    if (e.profile.role && e.profile.summit == e.summit.key) {
      e.error && e.error(new Error('already have role'));
      return;
    }
    if (user.role == 'admin') {
      options.value = [...Roles];
    } else if (user.role == 'moderator') {
      options.value = ['No role', ...Roles].filter(
        (r) => !/^(admin|moderator)$/.test(r)
      );
    }
    uCoupon.value = '';
    isShowDialog.value = true;
  },
});
</script>
<style scoped></style>
