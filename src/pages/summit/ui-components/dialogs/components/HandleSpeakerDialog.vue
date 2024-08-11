<template>
  <q-dialog v-model="isShowDialog" persistent>
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form @submit="onSubmit" v-if="speaker">
        <div class="row">
          <q-avatar class="col q-mx-sm">
            <q-icon name="person" />
          </q-avatar>
          <div class="col-auto text-center">
            <div class="text-h5 text-info" v-if="speaker.key">
              Update Speaker
            </div>
            <div class="text-h5 text-info" v-else>Register Speaker</div>
          </div>
        </div>
        <q-card-section>
          <div class="row justify-between q-col-gutter-x-lg">
            <div class="col-12">
              <q-input label="Full name" v-model="speaker.fullname" />
            </div>
            <div class="col-12">
              <q-input label="Position" v-model="speaker.position" />
            </div>
            <div class="col-12 q-pb-sm">
              <q-input label="Expertise" v-model="speaker.expertise" />
            </div>
            <span class="col-3 text-bold text-grey">Gender:</span>
            <q-option-group
              class="col-3"
              inline
              v-model="speaker.defaultAvatar"
              :options="[
                { label: 'Man', value: 'man' },
                { label: 'Woman', value: 'woman' },
              ]"
            >
            </q-option-group>
            <q-input label="Order" v-model="speaker.order" type="number" />
            <div class="col-6">
              <div
                v-if="speaker.avatar"
                class="cursor-pointer"
                @click="selectAvatar"
              >
                <q-avatar size="lg">
                  <q-img :src="speaker.avatar" />
                </q-avatar>
              </div>
              <q-btn
                size="lg"
                round
                v-else
                icon="person"
                @click="selectAvatar"
              />
            </div>

            <div class="col-6">
              <div
                v-if="speaker.companyLogo"
                class="cursor-pointer"
                @click="selectCompanyIcon"
              >
                <q-img :src="speaker.companyLogo" height="100px" />
              </div>
              <q-btn v-else icon="image" @click="selectCompanyIcon" />
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
import { ISpeaker } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { useProfileStore } from 'src/stores/profile-store';
import { useSummitStore } from 'src/stores/summit-store';

const profileStore = useProfileStore();
const summitStore = useSummitStore();
const isShowDialog = ref(false);
const busy = ref(false);
const speaker = ref<ISpeaker>();
const doneCb = ref<(speaker: ISpeaker) => void>();
const errorCb = ref<ErrorCallback>();
async function onSubmit() {
  if (!speaker.value) return;
  try {
    const saved = !speaker.value.key
      ? await summitStore.registerSpeaker(speaker.value)
      : await summitStore.updateSpeaker(
          speaker.value.key,
          [
            'fullname',
            'companyLogo',
            'defaultAvatar',
            'institution',
            'expertise',
            'position',
            'avatar',
            'order',
          ],
          speaker.value
        );
    if (saved) {
      doneCb.value && doneCb.value(saved);
      isShowDialog.value = false;
    } else {
      errorCb.value &&
        errorCb.value(new Error('Failed to save speaker details'));
    }
  } catch (error) {
    errorCb.value && errorCb.value(new Error(String(error)));
  }
}
theDialogs.on({
  type: 'addSpeaker',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    speaker.value = {
      fullname: '',
      expertise: '',
      position: '',
      summit: e.payload.key,
      companyLogo: '',
      defaultAvatar: 'man',
      avatar: '',
      institution: '',
      status: true,
      key: '',
    };
    isShowDialog.value = true;
  },
});

theDialogs.on({
  type: 'editSpeaker',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    speaker.value = e.payload;
    isShowDialog.value = true;
  },
});
function selectCompanyIcon() {
  if (!speaker.value) return;
  theDialogs.emit({
    type: 'select-image',
    arg: {
      path: 'summit/' + speaker.value.summit + '/institutions',
      done(url) {
        if (!speaker.value) return;
        speaker.value.companyLogo = url;
      },
    },
  });
}
function selectAvatar() {
  if (!speaker.value) return;
  theDialogs.emit({
    type: 'select-image',
    arg: {
      path: 'summit/' + speaker.value.summit + '/speakers',
      done(url) {
        if (!speaker.value) return;
        speaker.value.avatar = url;
      },
    },
  });
}
</script>
<style scoped></style>
