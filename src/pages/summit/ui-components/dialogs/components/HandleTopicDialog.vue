<template>
  <q-dialog v-model="isShowDialog" persistent :full-width="$q.screen.lt.xl">
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form @submit="onSubmit" v-if="topic">
        <div class="row">
          <q-avatar class="col q-mx-sm">
            <q-icon name="person" />
          </q-avatar>
          <div class="col-auto text-center">
            <div class="text-h5 text-info" v-if="topic.key">Update Topic</div>
            <div class="text-h5 text-info" v-else>Register Topic</div>
          </div>
        </div>
        <q-card-section>
          <div class="row justify-between q-col-gutter-x-lg">
            <div class="col-12">
              <q-input label="Schedule" v-model="topic.schedule">
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="topic.schedule"
                        mask="YYYY/MM/DD hh:mm A"
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Set"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time
                        v-model="topic.schedule"
                        mask="YYYY/MM/DD hh:mm A"
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Set"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
                <template #after>
                  <q-chip color="primary">
                    <span v-if="(topic.duration || 0) >= 60">
                      {{ Math.round((topic.duration || 0) / 60) }} hr &nbsp;
                    </span>
                    <span v-if="(topic.duration || 0) % 60 || !topic.duration">
                      {{ (topic.duration || 0) % 60 }} min
                    </span>
                    <q-tooltip>Duration</q-tooltip>
                  </q-chip>
                  <q-icon name="timelapse" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time
                        @update:model-value="computeDuration()"
                        v-model="duration"
                        mask="YYYY/MM/DD HH:mm"
                        format24h
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            @click="computeDuration()"
                            label="Set"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input label="Topic" v-model="topic.name" />
            </div>
            <div class="col-12 q-pb-sm">
              <q-select
                label="Contents"
                filled
                v-model="topic.contents"
                use-input
                use-chips
                multiple
                hide-dropdown-icon
                input-debounce="0"
                new-value-mode="add"
              />
            </div>
            <div class="col-12 q-pb-sm">
              <q-select
                label="Speakers"
                filled
                v-model="speakers"
                use-input
                use-chips
                multiple
                option-label="fullname"
                :options="speakerOptions"
                hide-dropdown-icon
                input-debounce="0"
                new-value-mode="add"
              />
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
import { ISpeaker, ITopic } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { useProfileStore } from 'src/stores/profile-store';
import { useSummitStore } from 'src/stores/summit-store';
import { date } from 'quasar';
import { ObjectUtil } from 'src/utils/object.util';

const profileStore = useProfileStore();
const summitStore = useSummitStore();
const isShowDialog = ref(false);
const duration = ref('');
const speakerOptions = ref<ISpeaker[]>([]);
const speakers = ref<ISpeaker[]>([]);
const busy = ref(false);
const topic = ref<ITopic>();
const doneCb = ref<(speaker: ITopic) => void>();
const errorCb = ref<ErrorCallback>();
function computeDuration() {
  const durationDate =
    (duration.value && new Date(duration.value)) || new Date();
  const baseDate = new Date(durationDate);
  baseDate.setHours(0, 0, 0, 0);
  if (topic.value) {
    topic.value.duration = date.getDateDiff(durationDate, baseDate, 'minutes');
  }
}
async function onSubmit() {
  if (!topic.value) return;
  try {
    topic.value.speakers = speakers.value.map((s) => s.key);
    const saved = !topic.value.key
      ? await summitStore.registerTopic(topic.value)
      : await summitStore.updateTopic(
          topic.value.key,
          ['name', 'contents', 'schedule', 'speakers', 'duration'],
          topic.value
        );
    if (saved) {
      doneCb.value && doneCb.value(saved);
      isShowDialog.value = false;
    } else {
      errorCb.value && errorCb.value(new Error('Failed to save topic details'));
    }
  } catch (error) {
    errorCb.value && errorCb.value(new Error(String(error)));
  }
}
theDialogs.on({
  type: 'addTopic',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    topic.value = {
      name: '',
      contents: [],
      schedule: '',
      summit: e.payload.key,
      status: true,
      key: '',
    };
    speakers.value = [];
    summitStore.streamSpeakers(summitStore.activeSummit?.key || '').subscribe({
      next(value) {
        speakerOptions.value = value;
      },
    });
    isShowDialog.value = true;
  },
});

theDialogs.on({
  type: 'editTopic',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    speakers.value = [];
    summitStore.streamSpeakers(summitStore.activeSummit?.key || '').subscribe({
      next(value) {
        speakerOptions.value = value;
        speakers.value = (topic.value?.speakers || [])
          .map((key) => speakerOptions.value.find((s) => s.key == key))
          .filter((s) => s) as ISpeaker[];
      },
    });
    doneCb.value = e.done;
    errorCb.value = e.error;
    topic.value = ObjectUtil.copyObject(e.payload);
    isShowDialog.value = true;
  },
});
</script>
<style scoped></style>
