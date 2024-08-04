<template>
  <q-page>
    <div class="flex flex-center q-pt-xl">
      <q-card
        v-if="notScannedYet"
        class="my-card q-px-md"
        style="
          min-width: 1232px;
          max-width: 96vw;
          border-radius: 16px;
          position: relative;
        "
      >
        <q-card-section class="column items-center">
          <q-card-section class="flex column" style="width: 56%">
            <h1
              class="text-h5 text-weight-bold text-grey-7 col-1 row flex-center"
            >
              {{ $t('scan-header-label') }}
            </h1>

            <div class="col-4 column">
              <div
                class="column items-center text-center text-body1 q-ma-md"
                style="
                  border-top: 7px solid rgb(79, 148, 201);
                  border-bottom: 7px solid rgb(79, 148, 201);
                  border-radius: 16px;
                  color: #619fce;
                  height: 350px;
                "
              >
                <div v-if="paused" data-cy="scanner-img">
                  <q-img
                    src="~assets/QR-Code-Scanner.svg"
                    native-context-menu
                    alt="Logo"
                    basic
                    style="width: 350px"
                  />
                </div>
                <div v-else>
                  <QrCodeReader
                    :value="qrValue"
                    class="scanimation"
                    :start="true"
                    :camera="'user'"
                    @input="onDetect"
                    @error="onError"
                  />
                </div>
              </div>
              <div
                v-if="paused"
                class="row flex flex-center text-center text-body1"
              >
                <q-btn
                  class="q-ma-sm q-mt-none text-weight-thin q-px-lg"
                  icon-right="photo_camera"
                  unelevated
                  rounded
                  :label="$t('scan-btn')"
                  style="background-color: #4f94c9; color: #f5f9fc"
                  data-cy="scan-btn"
                  @click="startScanning(10000)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card-section>
      </q-card>
      <div
        v-else-if="result"
        class="row q-px-md"
        style="width: 1416px; border-radius: 16px; position: relative"
      >
        <div class="col-12 row justify-center q-my-lg">
          <q-btn
            unelevated
            rounded
            color="primary"
            label="Scan Again"
            style="width: 192px"
            @click="(notScannedYet = true), (paused = false)"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import QrCodeReader from 'src/components/common/reader-components/QrCodeReader.vue';
import { RafflePrice } from 'src/entities';

const $q = useQuasar();
const qrValue = ref('');
const notScannedYet = ref(true);

function onError(err: string) {
  stopScanning();
  $q.notify({
    message: 'Invalid QR Code',
    caption: err,
    color: 'negative',
    position: 'center',
    icon: 'error',
    timeout: 1000 * 2,
  });
}

const timer = ref<NodeJS.Timeout>();
function startScanning(timeout = 5 * 1000) {
  paused.value = false;
  timer.value && clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    if (process.env.NODE_ENV !== 'production') return;
    paused.value = true;
  }, timeout);
}
function stopScanning() {
  timer.value && clearTimeout(timer.value);
  paused.value = true;
}
type ResultType = RafflePrice | string | null;
const result = ref<ResultType>();
const paused = ref(true);
function onDetect(detectedCode: ResultType) {
  stopScanning();
  notScannedYet.value = false;
  result.value = detectedCode;
}
</script>
<style scoped></style>
