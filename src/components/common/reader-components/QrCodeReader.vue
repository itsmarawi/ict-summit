<template>
  <div class="qr-reader" :id="'reader' + id">
    <video
      autoplay="true"
      playsinline
      :width="$q.screen.width"
      :height="$q.screen.height"
      class="q-pa-none q-ma-none"
      v-if="!previewCanvas"
    ></video>
    <q-file
      v-model="filesImage"
      class="q-pt-xl"
      v-if="previewCanvas"
      accept="image/*"
      :multiple="false"
      label="Select QR Image"
      @update:model-value="processImage"
    >
      <template v-slot:prepend>
        <q-icon name="image" />
      </template>
    </q-file>
    <q-dialog seamless v-model="previewCanvas" position="right">
      <q-card
        :id="'reader' + id + '-preview'"
        class="q-pa-none q-ma-none"
        style="border: 1px solid gray"
      >
      </q-card>
    </q-dialog>
    <div class="container" v-if="scanner">
      <div class="guide-frame scanimation"></div>

      <div class="absolute-bottom q-pb-md">
        <q-btn icon="stop" color="negative" rounded @click="stopScanning" />
      </div>
      <q-toggle
        class="absolute-bottom-right q-mb-md"
        v-model="torchOn"
        checked-icon="flashlight_on"
        color="green"
        :disable="!torchCappable"
        unchecked-icon="flashlight_off"
        size="md"
        @update:modelValue="scanner.setTorch(torchOn)"
      />
      <q-toggle
        class="toggle absolute-bottom-left q-mb-md"
        @update:modelValue="cameraChange"
        v-model="cameraFront"
        size="md"
        checked-icon="camera_front"
        unchecked-icon="camera_rear"
      />
      <q-slider
        v-if="zoomCappable"
        v-model="zoom"
        :min="0"
        reverse
        :max="1"
        :step="0.2"
        vertical
        marker-labels
        @update:model-value="
          (val) => typeof val == 'number' && scanner?.setZoom(val)
        "
        class="fixed-left q-ml-md zoom"
        switch-label-side
      >
        <template #marker-label-group="{ getStyle, classes }">
          <q-icon
            v-for="val in [0, 1]"
            :key="val"
            :style="getStyle(val)"
            :name="val == 0 ? 'zoom_out' : 'zoom_in'"
            :class="classes"
          />
        </template>
      </q-slider>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { uid } from 'quasar';
import { QRReader } from './QrReader';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { mediaResource } from 'src/resources/media.resource';
const props = defineProps<{
  camera: string;
  start: boolean;
  value: string;
  zoomLevel?: number;
}>();
const zoom = ref(0);
const $emit = defineEmits([
  'input',
  'error',
  'update:camera',
  'keyChanged',
  'stopped',
  'zoomed',
]);
const previewCanvas = ref(process.env.NODE_ENV !== 'production');
const filesImage = ref(null);
const cameraFront = ref(false);
const torchOn = ref(false);
const frameGuideSize = ref(300);
const frameGuideMin = ref(frameGuideSize.value);
const frameGuideMax = ref(frameGuideSize.value + 100);
const torchCappable = ref(false);
const zoomCappable = ref(false);
const id = ref(uid());
const scanner = ref<QRReader | undefined>();
async function setupQRCodeScanner() {
  cameraFront.value = props.camera == 'user';
  scanner.value = new QRReader({
    elemSelect: '#reader' + id.value,
    canvasProperties: { width: 1280, height: 720 },
    decodedCb: (decoded) => {
      if (decoded) {
        $emit('input', decoded);
      }
    },
    errorCb: (error) => {
      $emit('error', error);
    },
  });
  cameraFront.value = props.camera == 'user';
  cameraChange();
  await startCamera();
}
async function processImage(f: File) {
  scanner.value = new QRReader({
    elemSelect: '#reader' + id.value,
    canvasProperties: { width: 1280, height: 720 },
    decodedCb: (decoded) => {
      if (!decoded) {
        $emit('error', 'No QR detected');
      } else {
        $emit('input', decoded);
      }
    },
    errorCb: (error) => {
      $emit('error', error);
    },
  });
  scanner.value.listenToWorker();
  const imgUrl = await mediaResource.getDataUrl(f);
  if (!imgUrl) return;
  scanner.value.setCanvas();
  const canvas = scanner.value.canvas;
  if (!canvas) return;
  const image = new Image();
  image.onload = () => {
    canvas.width = 300;
    canvas.height = 300;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    scanner.value?.sendMessage({
      event: 'processImage',
      data: imageData,
    });
  };
  image.src = imgUrl;
}
function cameraChange() {
  const camera = cameraFront.value ? 'user' : 'environment';
  $emit('update:camera', camera);
  scanner.value?.setCamera(camera);
}
async function startCamera() {
  if (props.start && scanner.value) {
    await scanner.value.scan();
    torchCappable.value = !!scanner.value.setTorch(false);
    zoom.value =
      typeof props.zoomLevel == 'number' ? props.zoomLevel : zoom.value;
    zoomCappable.value = !!scanner.value.setZoom(zoom.value);
    const dim = scanner.value.computeFrameGuideDim();
    frameGuideMin.value = dim.min;
    frameGuideMax.value = dim.max;
    frameGuideSize.value = dim.min;
    scanner.value.setGuideFrame(frameGuideSize.value);
  }
}
function stopScanning() {
  scanner.value?.stop();
  $emit('stopped');
  scanner.value = undefined;
}
onMounted(() => {
  setTimeout(async () => {
    if (!previewCanvas.value) {
      await setupQRCodeScanner();
    }
  }, 100);
});
onUnmounted(() => {
  scanner.value?.stop();
  $emit('stopped');
});
watch(zoom, (level) => {
  scanner.value?.setZoom(level);
  $emit('zoomed', level);
});
</script>

<style scoped>
.qr-reader {
  z-index: 999;
}
.qr-reader video {
  object-fit: cover;
  position: fixed;
  left: 0;
  bottom: 0;
}
.container {
  position: fixed;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.2);
  color: #f1f1f1;
  width: 100%;
  padding: 0p;
}

.zoom {
  margin-top: 100px;
  margin-bottom: 0;
  height: calc(100% - 200px);
}
.frame-slide {
  margin-left: 100px;
  margin-right: 100px;
  width: calc(100% - 200px);
}
.guide-frame {
  position: fixed;
  border: 2px solid darkred;
  box-sizing: border-box;
}

.scanimation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    360deg,
    rgba(79, 148, 201, 0.5) 0%,
    rgba(79, 148, 201, 0) 100%
  );
  filter: blur(2.5px);
  background-size: 320px;
  overflow: hidden;
  animation: animate 4s ease-in-out infinite;
}
@keyframes animate {
  0% {
    height: 0px;
  }
  88% {
    height: calc(96%);
    opacity: 0.16;
  }
  100% {
    opacity: 0;
  }
}
.scanimation::after {
  content: '';
  position: absolute;
  inset: 0px;
  width: calc(100%);
  height: 2px;
  background: #305b7c;
  filter: drop-shadow(0 0 64px #305b7c);
  animation: animateLine 4s ease-in-out infinite;
}
@keyframes animateLine {
  0% {
    top: 0px;
  }
  88% {
    top: calc(96%);
    opacity: 0.67;
  }
  100% {
    opacity: 0;
  }
}
</style>
