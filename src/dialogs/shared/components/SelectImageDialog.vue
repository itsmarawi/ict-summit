<template>
  <q-dialog
    :model-value="isShow"
    :maximized="$q.screen.lt.sm"
    persistent
    @hide="onCancel"
    style="position: relative"
  >
    <q-card flat style="border-radius: 16px; background-color: transparent">
      <q-card-section class="bg-dark" style="border-radius: 16px 16px 0 0">
        <q-avatar
          color="white"
          class="absolute"
          size="64px"
          style="
            top: 0%;
            right: 43%;
            transform: translateY(-50%);
            box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.24);
          "
        >
          <q-icon
            v-if="!selectedUrl"
            size="lg"
            color="black"
            name="diversity_3"
          />
          <q-img :src="selectedUrl" />
        </q-avatar>
        <q-btn
          class="self-end"
          outline
          round
          style="position: absolute; top: 8px; right: 8px; z-index: 9999"
          icon="close"
          size="sm"
          data-cy="close"
          @click="onCancel"
        />
      </q-card-section>
      <q-form @submit="onSubmit">
        <div class="q-pa-xl bg-dark">
          <div class="text-h4" style="color: #555555">Select Image</div>
        </div>
        <div class="q-pt-sm bg-dark q-px-md">
          <q-table :rows="list" row-key="url" :loading="loading" grid>
            <template #item="{ row }">
              <q-card>
                <q-card-section>
                  <q-img height="100px" :src="row.url" />
                </q-card-section>
                <q-card-actions>
                  <q-radio
                    v-model="selectedUrl"
                    :val="row.url"
                    :label="row.name"
                  />
                </q-card-actions>
              </q-card>
            </template>
          </q-table>
        </div>
        <div class="text-center q-pt-sm bg-white q-pa-md">
          <q-file
            v-model="file"
            class="q-py-sm"
            :dark="false"
            filled
            accept=".jpg, image/*"
            :multiple="false"
            use-chips
            label="Upload Image"
            @update:model-value="uploadImage"
          />
          <q-btn
            style="width: 300px"
            label="Select"
            color="primary"
            rounded
            type="submit"
          ></q-btn>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { theDialogs } from 'src/dialogs';
import { useMediaStore } from 'src/stores/media-store';
import { ref } from 'vue';

type ImageRef = {
  url: string;
  name: string;
  path: string;
};
const $q = useQuasar();
const mediaStore = useMediaStore();
const list = ref<ImageRef[]>([]);
const selectedUrl = ref('');
const file = ref<File>();
const path = ref('');
const isShow = ref(false);
const loading = ref(false);
const submitCb = ref<(url: string) => void>();
const errorCb = ref<ErrorCallback>();
function onCancel() {
  isShow.value = false;
}
function onSubmit() {
  submitCb.value && submitCb.value(selectedUrl.value);
  isShow.value = false;
}
theDialogs.on({
  type: 'select-image',
  info: {
    icon: 'image',
    module: 'shared',
  },
  async cb(e) {
    submitCb.value = e.done;
    errorCb.value = e.error;
    isShow.value = true;
    loading.value = true;
    file.value = undefined;
    path.value = e.path || '';
    try {
      list.value = await mediaStore.listMedia(e.path || '');
    } catch (error) {
      list.value = [];
      $q.notify({
        message: String(error),
        icon: 'error',
        color: 'negative',
        position: 'center',
      });
    } finally {
      loading.value = false;
    }
  },
});

async function uploadImage() {
  if (!file.value) return;
  const image = await mediaStore.uploadImage(file.value, path.value);
  if (image) {
    list.value.push({
      name: file.value.name,
      path: path.value || '',
      url: image,
    });
    selectedUrl.value = image;
  }
}
</script>
