<template>
  <q-page
    class="flex flex-center inst-themed"
    :style="'background-image:' + bgCss"
  >
    <div v-if="notScannedYet">
      <div class="column text-center">
        <div class="text-info q-pb-sm">
          <div class="text-h4 text-weight-bold themed-text">
            {{ $t('scan-header-label') }}
          </div>
          <div class="text-h6 text-weight-medium themed-text">
            {{ $t('scan-subheader-label') }}
          </div>
        </div>
        <div v-if="notScannedYet" class="col-4 column">
          <div
            class="column items-center text-center text-body1 q-ma-md"
            style="
              border-top: 2px solid rgb(79, 148, 201);
              border-bottom: 2px solid rgb(79, 148, 201);
              border-radius: 16px;
              color: #619fce;
              height: 96%;
            "
          >
            <div class="q-my-sm" data-cy="scanner-img">
              <QrCodeReader
                v-if="!paused"
                :value="qrValue"
                :start="true"
                :camera="'user'"
                @input="onDetect"
                @error="onError"
                @stopped="stopScanning"
              />
              <q-img
                v-else-if="paused && logoUrl"
                :src="logoUrl"
                native-context-menu
                alt="Logo"
                class="rounded-borders"
                basic
                style="width: 280px; opacity: 0.8"
              />
              <q-img
                v-else
                src="~assets/QR-Code-Scanner.svg"
                native-context-menu
                alt="Logo"
                basic
                style="width: 280px"
              />
            </div>
          </div>
          <div
            v-if="paused"
            class="column flex flex-center text-center text-body1 q-ma-md q-mx-xl q-gutter-sm q-pb-sm"
          >
            <div class="full-width">
              <q-btn
                :loading="loading"
                class="themed-btn-primary"
                icon-right="photo_camera"
                :label="$t('scan-btn')"
                unelevated
                rounded
                @click="startScanning(60 * 1000)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="result" class="row result">
      <q-list class="col-12" bordered>
        <template v-if="priceMatched?.status == 'ready'">
          <q-banner class="bg-positive">
            <template #avatar><q-icon name="redeem" /></template>
            <span class="text-h6">Qualified!</span>
          </q-banner>
          <q-item>
            <q-item-section class="text-bold">
              <q-item-label>Recipient:</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-chip>{{ priceMatched.recipient.name }}</q-chip>
            </q-item-section>
            <q-item-section side avatar>
              <ProfileAvatar :profile-key="priceMatched.recipient.key" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="text-bold">
              <q-item-label>T-Shirt Size:</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-chip>{{ priceMatched.recipient.tshirt }}</q-chip>
            </q-item-section>
            <q-item-section side avatar>
              <q-icon
                :name="
                  priceMatched?.recipient.gender == 'female'
                    ? 'ion-woman'
                    : 'ion-man'
                "
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="text-bold">
              <q-item-label>Institution:</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-chip>{{ priceMatched.recipient.institution }}</q-chip>
            </q-item-section>
            <q-item-section side avatar>
              <q-icon name="ion-briefcase" />
            </q-item-section>
          </q-item>
          <q-item class="bg-positive">
            <q-item-section class="text-bold">
              <q-item-label>Price:</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-chip>{{ priceMatched.price }}</q-chip>
            </q-item-section>
            <q-item-section side>
              <q-btn
                round
                :loading="loading"
                color="primary"
                icon="volunteer_activism"
                @click="releaseRafflePrice(priceMatched)"
              />
            </q-item-section>
          </q-item>
        </template>
        <template v-else-if="priceMatched?.status == 'released'">
          <q-item>
            <q-item-section class="text-bold">
              <q-item-label>Recipient:</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-chip>{{ priceMatched.recipient.name }}</q-chip>
            </q-item-section>
            <q-item-section side avatar>
              <ProfileAvatar :profile-key="priceMatched.recipient.key" />
            </q-item-section>
          </q-item>
          <q-item class="bg-negative" v-if="priceMatched.releasedBy">
            <q-item-section class="text-bold">
              <q-item-label>Released by:</q-item-label>
            </q-item-section>
            <q-item-section>
              {{ priceMatched.releasedBy.name }}
            </q-item-section>
            <q-item-section side avatar>
              <ProfileAvatar :profile-key="priceMatched.releasedBy.key" />
            </q-item-section>
          </q-item>
        </template>
        <q-banner v-else>
          <template #avatar><q-icon name="error" /></template>
          Record not found
        </q-banner>
      </q-list>
      <div class="col-12 row justify-center q-my-lg">
        <q-btn
          unelevated
          rounded
          class="themed-btn-primary q-mx-xs"
          label="Scan Again"
          :loading="loading"
          style="width: 132px"
          @click="(notScannedYet = true), startScanning(10000)"
        />
        <q-btn
          round
          icon="close"
          class="themed-btn-secondary"
          @click="(result = undefined), (notScannedYet = true)"
        ></q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { colors, useQuasar } from 'quasar';
import { ref, computed } from 'vue';
import QrCodeReader from 'src/components/common/reader-components/QrCodeReader.vue';
import { ResultType } from 'src/components/common/reader-components/QrReader';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { RafflePrice } from 'src/entities';
import ProfileAvatar from 'src/components/common/ProfileAvatar.vue';
import { useProfileStore } from 'src/stores/profile-store';

const $q = useQuasar();
const raffleStore = useRaffleDrawStore();
const profileStore = useProfileStore();
const $props = defineProps<{ keepingQrCode?: 'owned' | 'monitoring' }>();
const $emits = defineEmits(['qr-code-kept']);
const notScannedYet = ref(true);
const qrValue = ref('');
const result = ref<ResultType>();
const priceMatched = ref<RafflePrice>();
const paused = ref(true);
const loading = ref(false);
const timer = ref<NodeJS.Timeout>();

const logoUrl = computed(() => {
  return '';
});
const bgCss = computed(() => {
  const url = 'no-bg';
  return `url("${url}")`;
});
const primaryColor = computed(() => {
  return colors.getPaletteColor('primary');
});
const secondaryColor = computed(() => {
  return colors.getPaletteColor('secondary');
});
const primaryText = computed(() => {
  return 'primary';
});
const secondaryText = computed(() => {
  return 'secondary';
});

function startScanning(timeout = 30 * 1000) {
  paused.value = !paused.value;
  if (!paused.value) {
    timer.value && clearTimeout(timer.value);
    timer.value = setTimeout(() => {
      paused.value = true;
      $q.notify({
        icon: 'info',
        message: 'Stopped the scanning to save battery',
        timeout: 3000,
        color: 'info',
      });
    }, timeout);
  }
}
function stopScanning() {
  timer.value && clearTimeout(timer.value);
  paused.value = true;
  if ($props.keepingQrCode && !result.value) {
    $emits('qr-code-kept');
  }
}

async function onDetect(detectedCode: ResultType) {
  notScannedYet.value = false;
  result.value = detectedCode;
  stopScanning();
  if (
    typeof result.value == 'string' &&
    /^(?:[a-z+]+:)?\/\//i.test(result.value)
  ) {
    window.open(result.value, '_self');
  } else if (typeof detectedCode == 'object' && detectedCode) {
    loading.value = true;
    priceMatched.value = await raffleStore.getRafflePriceDraw(detectedCode.key);
    if (priceMatched.value) {
      priceMatched.value.recipient =
        (await profileStore.getProfile(priceMatched.value.recipient.key)) ||
        priceMatched.value.recipient;
    }
    loading.value = false;
  }
}

function onError(err: string) {
  stopScanning();
  $q.notify({
    message: 'Invalid QR Code',
    caption: err,
    color: 'negative',
    position: 'center',
    icon: 'error',
  });
}
function releaseRafflePrice(price: RafflePrice) {
  if (!/^(admin|moderator)$/.test(profileStore.theUser?.role || 'none')) {
    $q.notify({
      message: 'Unauthorized to release prices',
      caption: 'Redeeming your price?',
      icon: 'error',
      color: 'negative',
      position: 'center',
      actions: [
        {
          label: 'View Prices',
          icon: 'redeem',
          to: { name: 'prices' },
        },
      ],
    });
    return;
  }
  const msg = 'Release Raffle Price';
  if (price.status !== 'ready') {
    $q.notify({
      message: `Price is already ${price.status}`,
      icon: 'info',
      position: 'center',
    });
    return;
  }
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: 'warning',
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true, label: msg },
    persistent: true,
    html: true,
  }).onOk(async () => {
    priceMatched.value = await raffleStore.updateRafflePrice(
      price.key,
      ['status', 'releasedBy'],
      {
        status: 'released',
        releasedBy: profileStore.theUser,
      }
    );
  });
}
</script>
<style scoped lang="scss">
.result {
  z-index: 999;
}

.themed-btn-primary {
  background-color: v-bind(primaryColor);
  color: v-bind(primaryText);
  width: 200px;
}

.themed-btn-secondary {
  background-color: v-bind(secondaryColor);
  color: v-bind(secondaryText);
}

.inst-themed {
  background-repeat: no-repeat;
  background-position: 50% 0;
  background-size: cover;
}

.inst-themed:before {
  content: ' ';
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  background-color: white;
  background-repeat: no-repeat;
  background-position: 50% 0;
  background-size: cover;
}

.themed-text {
  text-shadow: -1px -1px 0 #867b7b, 1px -1px 0 #000000a4, -1px 1px 0 #000000a4,
    1px 1px 0 #000000b7;
}
</style>
