<template>
  <q-dialog v-model="isShowDialog" persistent :full-width="$q.screen.lt.xl">
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form @submit="onSubmit" v-if="sponsor">
        <div class="row">
          <q-avatar class="col q-mx-sm">
            <q-icon name="person" />
          </q-avatar>
          <div class="col-auto text-center">
            <div class="text-h5 text-info" v-if="sponsor.key">
              Update Sponsor
            </div>
            <div class="text-h5 text-info" v-else>Register Sponsor</div>
          </div>
        </div>
        <q-card-section>
          <div class="row justify-between q-col-gutter-x-lg">
            <div class="col-12">
              <q-input label="Sponsor" v-model="sponsor.name" />
            </div>
            <div class="col-12">
              <q-input label="Background" v-model="sponsor.background">
                <template v-slot:append>
                  <q-icon
                    name="colorize"
                    class="cursor-pointer"
                    :color="sponsor.background"
                  >
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-color v-model="sponsor.background" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-8">
              <div
                v-if="sponsor.logo"
                class="cursor-pointer"
                @click="selectCompanyIcon"
              >
                <q-img :src="sponsor.logo" height="100px" />
              </div>
              <q-btn v-else icon="image" @click="selectCompanyIcon" />
            </div>
            <div class="col-4">
              <q-input label="Order" v-model="sponsor.order" type="number" />
            </div>
            <div class="col-12 q-pb-sm">
              <q-input
                label="Description"
                v-model="sponsor.description"
                type="textarea"
              />
            </div>
            <div class="col-12 q-pb-sm">
              <q-input label="Website" v-model="sponsor.website" />
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
                label="Submit"
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
import { ref } from 'vue';
import { ISponsor } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { useProfileStore } from 'src/stores/profile-store';
import { useSummitStore } from 'src/stores/summit-store';

const profileStore = useProfileStore();
const summitStore = useSummitStore();
const isShowDialog = ref(false);
const busy = ref(false);
const sponsor = ref<ISponsor>();
const doneCb = ref<(sponsor: ISponsor) => void>();
const errorCb = ref<ErrorCallback>();
async function onSubmit() {
  if (!sponsor.value) return;
  try {
    const saved = !sponsor.value.key
      ? await summitStore.registerSponsor(sponsor.value)
      : await summitStore.updateSponsor(
          sponsor.value.key,
          [
            'name',
            'logo',
            'background',
            'institution',
            'order',
            'description',
            'website',
          ],
          sponsor.value
        );
    if (saved) {
      doneCb.value && doneCb.value(saved);
      isShowDialog.value = false;
    } else {
      errorCb.value &&
        errorCb.value(new Error('Failed to save sponsor details'));
    }
  } catch (error) {
    errorCb.value && errorCb.value(new Error(String(error)));
  }
}
theDialogs.on({
  type: 'addSponsor',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    sponsor.value = {
      name: '',
      logo: '',
      background: '',
      summit: e.payload.key,
      institution: '',
      status: true,
      key: '',
    };
    isShowDialog.value = true;
  },
});

theDialogs.on({
  type: 'editSponsor',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    sponsor.value = e.payload;
    isShowDialog.value = true;
  },
});
function selectCompanyIcon() {
  if (!sponsor.value) return;
  theDialogs.emit({
    type: 'select-image',
    arg: {
      path: 'summit/' + sponsor.value.summit + '/institutions',
      done(url) {
        if (!sponsor.value) return;
        sponsor.value.logo = url;
      },
    },
  });
}
</script>
<style scoped></style>
