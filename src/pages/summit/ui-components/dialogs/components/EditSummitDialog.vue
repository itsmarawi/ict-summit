<template>
  <q-dialog v-model="isShowDialog" persistent>
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form @submit="onSubmit" v-if="summit">
        <div class="row">
          <q-avatar class="col q-mx-sm">
            <q-icon name="celebration" />
          </q-avatar>
          <div class="col-auto text-center">
            <div class="text-h5 text-info">Update Summit</div>
          </div>
        </div>
        <q-card-section>
          <div class="row justify-between q-col-gutter-x-lg">
            <div class="col-12">
              <q-input label="Year" readonly v-model="summit.year" />
            </div>
            <div class="col-12">
              <q-input label="Name" v-model="summit.name" />
            </div>
            <div class="col-12 q-pb-sm">
              <q-input label="Venue" v-model="summit.venue" />
            </div>
            <div class="col-6">
              <q-input label="Theme" v-model="summit.theme" type="textarea" />
            </div>
            <div class="col-6">
              <div
                v-if="summit.promoBg"
                class="cursor-pointer"
                @click="selectPromoBg"
              >
                <q-img :src="summit.promoBg" height="100px" />
              </div>
              <q-btn v-else icon="image" @click="selectPromoBg" />
            </div>
            <div class="col-12">
              <q-chip size="md" color="primary" class="full-width">
                {{ date.formatDate(summit.dateStart, 'MMM DD') }} -
                {{ date.formatDate(summit.dateEnd, 'MMM DD') }}
                <q-space />
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="dateRange"
                      range
                      @update:model-value="
                        (summit.dateStart = dateRange.from),
                          (summit.dateEnd = dateRange.to)
                      "
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Set" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </q-chip>
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
import { ISummit } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { useProfileStore } from 'src/stores/profile-store';
import { useSummitStore } from 'src/stores/summit-store';
import { date } from 'quasar';

const profileStore = useProfileStore();
const summitStore = useSummitStore();
const isShowDialog = ref(false);
const busy = ref(false);
const summit = ref<ISummit>();
const dateRange = ref({ from: '', to: '' });
const doneCb = ref<(summit: ISummit) => void>();
const errorCb = ref<ErrorCallback>();
async function onSubmit() {
  if (!summit.value) return;
  try {
    const saved = !summit.value.key
      ? await summitStore.createSummit(summit.value)
      : await summitStore.updateSummit(
          summit.value.key,
          [
            'theme',
            'dateStart',
            'dateEnd',
            'slots',
            'venue',
            'slotsPerInstitution',
            'promoBg',
            'name',
          ],
          summit.value
        );
    if (saved) {
      doneCb.value && doneCb.value(saved);
      isShowDialog.value = false;
    } else {
      errorCb.value &&
        errorCb.value(new Error('Failed to save summit details'));
    }
  } catch (error) {
    errorCb.value && errorCb.value(new Error(String(error)));
  }
}

theDialogs.on({
  type: 'editSummit',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    summit.value = e.payload;
    isShowDialog.value = true;
  },
});
function selectPromoBg() {
  if (!summit.value) return;
  theDialogs.emit({
    type: 'select-image',
    arg: {
      path: 'summit/' + summit.value.year,
      done(url) {
        if (!summit.value) return;
        summit.value.promoBg = url;
      },
    },
  });
}
</script>
<style scoped></style>
