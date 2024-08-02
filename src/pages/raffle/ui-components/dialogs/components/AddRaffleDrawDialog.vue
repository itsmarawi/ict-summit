<template>
  <q-dialog v-model="isShowDialog" persistent>
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-form @submit="onSummitRaffleDraw" v-if="raffleDraw">
        <div class="row">
          <q-avatar class="col q-mx-sm">
            <q-icon name="celebration" />
          </q-avatar>
          <div class="col-auto text-center">
            <div class="text-h5 text-info">Create Raffle Draw</div>
          </div>
        </div>
        <q-card-section>
          <div class="row justify-between q-col-gutter-x-lg">
            <div class="col-12">
              <q-input label="Name" v-model="raffleDraw.name" />
            </div>
            <div class="col-12">
              <q-select
                multiple
                label="Default Prices"
                v-model="raffleDraw.defaultPrices"
                use-input
                use-chips
                new-value-mode="add"
              />
            </div>
            <div class="col-12">
              <q-select
                multiple
                use-chips
                label="Winner Prices"
                v-model="raffleDraw.winnerPrices"
                use-input
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
import { RaffleDraw } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { useProfileStore } from 'src/stores/profile-store';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';

const profileStore = useProfileStore();
const raffleStore = useRaffleDrawStore();
const isShowDialog = ref(false);
const busy = ref(false);
const raffleDraw = ref<RaffleDraw>();
const doneCb = ref<(raffle: RaffleDraw) => void>();
const errorCb = ref<ErrorCallback>();

async function onSummitRaffleDraw() {
  if (!raffleDraw.value) return;
  try {
    const saved = !raffleDraw.value.key
      ? await raffleStore.createRaffleDraw(raffleDraw.value)
      : await raffleStore.updateRaffleDraw(
          raffleDraw.value.key,
          ['defaultPrices', 'winnerPrices', 'name'],
          raffleDraw.value
        );
    if (saved) {
      doneCb.value && doneCb.value(saved);
      isShowDialog.value = false;
    } else {
      errorCb.value && errorCb.value(new Error('Failed to save raffle draw'));
    }
  } catch (error) {
    errorCb.value && errorCb.value(new Error(String(error)));
  }
}

theDialogs.on({
  type: 'addRaffle',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    raffleDraw.value = {
      date: new Date().toString(),
      key: '',
      name: '',
      defaultPrices: [],
      winnerPrices: [],
      owner: { ...profileStore.theUser },
      status: 'open',
      summit: new Date().getFullYear().toString(),
    };
    isShowDialog.value = true;
  },
});
theDialogs.on({
  type: 'editRaffle',
  permissions: ['admin', 'moderator'],
  info: { module: 'raffle', icon: 'celebrate' },
  async cb(e) {
    if (!profileStore.theUser) return;
    doneCb.value = e.done;
    errorCb.value = e.error;
    raffleDraw.value = e.payload;
    isShowDialog.value = true;
  },
});
</script>
<style scoped></style>
