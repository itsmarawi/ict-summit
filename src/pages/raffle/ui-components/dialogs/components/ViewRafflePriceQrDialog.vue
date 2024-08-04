<template>
  <q-dialog
    v-model="isShowDialog"
    :maximized="$q.screen.lt.lg"
    :full-width="$q.screen.lt.lg"
    persistent
    @before-hide="onHide"
  >
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form v-if="rafflePrice">
        <div class="row justify-center">
          <q-avatar class="q-mx-sm">
            <q-icon name="celebration" />
          </q-avatar>
          <div class="text-center">
            <div class="text-h5 text-info">
              <span v-if="rafflePrice.status == 'ready'"
                >Present this QR Code to releasing officer to claim your
                price</span
              >
              <span v-else-if="rafflePrice.status == 'released'"
                >Your price is claimed</span
              >
            </div>
          </div>
        </div>
        <q-card-section v-if="rafflePrice.status == 'ready'">
          <div class="row justify-center">
            <q-card class="bg-white q-pa-sm">
              <qrcode-vue
                :value="priceQrCode"
                :size="
                  Math.min($q.screen.width, $q.screen.height) -
                  ($q.screen.lt.lg ? 20 : 260)
                "
                level="H"
              />
            </q-card>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <div class="row justify-between q-col-gutter-x-sm">
            <div>
              <q-btn
                color="negative"
                label="close"
                outline
                rounded
                v-close-popup
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
import QrcodeVue from 'qrcode.vue';
import { theDialogs } from 'src/dialogs';
import { RafflePrice } from 'src/entities';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { Subscription } from 'rxjs';
const raffleStore = useRaffleDrawStore();
const isShowDialog = ref(false);
const rafflePrice = ref<RafflePrice>();
const doneCb = ref<(price: RafflePrice) => void>();
const errorCb = ref<ErrorCallback>();
let sub: Subscription;
function onHide() {
  sub?.unsubscribe();
}
const priceQrCode = computed(() => {
  return JSON.stringify({
    ...rafflePrice.value,
    recipient: undefined,
    status: undefined,
    releasedBy: undefined,
    draw: undefined,
    id: undefined,
  });
});
theDialogs.on({
  type: 'viewRafflePriceQr',
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    doneCb.value = e.done;
    errorCb.value = e.error;
    rafflePrice.value = e.payload;
    isShowDialog.value = true;
    sub = raffleStore.streamPriceUpdate(e.payload).subscribe({
      next(value) {
        rafflePrice.value = value[0] || rafflePrice.value;
      },
    });
  },
});
</script>
<style scoped></style>
