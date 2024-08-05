<template>
  <q-dialog
    v-model="isShowDialog"
    :maximized="$q.screen.lt.lg"
    :full-width="$q.screen.lt.lg"
    persistent
    @before-hide="onHide"
  >
    <q-card flat class="q-pa-md" style="min-width: 300px; max-width: 80vw">
      <q-toolbar>
        <q-icon name="content_copy" />
        <q-toolbar-title :shrink="false">Clone Participants</q-toolbar-title>
        <q-btn icon="close" dense flat v-close-popup round />
      </q-toolbar>
      <q-form>
        <q-card-section v-if="sourceRaffleDraw">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Source Draw</q-item-label>
              </q-item-section>
              <q-item-section>
                {{ sourceRaffleDraw.name }}
              </q-item-section>
              <q-item-section avatar side>
                <q-icon name="orbit" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Participants</q-item-label>
              </q-item-section>
              <q-item-section>
                {{ totalParticipants - totalWinners }}
              </q-item-section>
              <q-item-section avatar side>
                <q-icon name="person" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Winners</q-item-label>
              </q-item-section>
              <q-item-section>
                {{ totalWinners }}
              </q-item-section>
              <q-item-section avatar side>
                <q-icon name="military_tech" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="raffleDraw"
            label="Select Target Draw"
            :options="raffleDrawOptions"
            option-label="name"
          />
          <q-linear-progress :value="copied" :max="sourceParticipants.length" />
        </q-card-section>
        <q-card-actions align="center">
          <div class="row justify-between q-gutter-sm">
            <q-btn
              color="negative"
              label="close"
              outline
              rounded
              v-close-popup
            />
            <q-btn
              dense
              :disable="!raffleDraw || totalParticipants - totalWinners <= 0"
              icon="content_copy"
              color="primary"
              label="Participants"
              outline
              :loading="saving"
              rounded
              @click="onCloneParticipants"
            />
            <q-btn
              icon="copy_all"
              color="primary"
              :disable="!raffleDraw || totalParticipants <= 0"
              label="All"
              outline
              :loading="saving"
              rounded
              @click="onCloneAll"
            />
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { theDialogs } from 'src/dialogs';
import {
  RaffleDraw,
  RaffleDrawWithParticipants,
  RaffleParticipant,
} from 'src/entities';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { Subscription } from 'rxjs';
const raffleStore = useRaffleDrawStore();
const isShowDialog = ref(false);
const sourceRaffleDraw = ref<RaffleDraw>();
const raffleDrawOptions = ref<RaffleDraw[]>([]);
const totalParticipants = ref<number>(0);
const totalWinners = ref<number>(0);
const copied = ref(0);
const saving = ref(false);
const raffleDraw = ref<RaffleDraw>();
const doneCb = ref<(price: RaffleDrawWithParticipants) => void>();
const errorCb = ref<ErrorCallback>();
const sourceParticipants = ref<RaffleParticipant[]>([]);
let sub: Subscription;
function onHide() {
  sub?.unsubscribe();
}
async function onCloneParticipants() {
  sourceParticipants.value = (
    await raffleStore.findParticipants({
      draw: sourceRaffleDraw.value?.key,
    } as Partial<RaffleParticipant>)
  ).filter((p) => !p.won);
  await startCloning();
}
async function onCloneAll() {
  sourceParticipants.value = await raffleStore.findParticipants({
    draw: sourceRaffleDraw.value?.key,
  } as Partial<RaffleParticipant>);
  await startCloning();
}
async function startCloning() {
  if (!raffleDraw.value) return;
  saving.value = true;
  copied.value = 0;
  try {
    await Promise.all(
      sourceParticipants.value.map(async (participant) => {
        if (!raffleDraw.value) return;
        await raffleStore.joinRaffle(raffleDraw.value, participant.participant);
        copied.value++;
      })
    );
  } catch (error) {
    errorCb.value && errorCb.value(new Error(String(error)));
    saving.value = false;
    isShowDialog.value = false;
    return;
  }
  saving.value = false;
  doneCb.value &&
    doneCb.value({
      ...raffleDraw.value,
      participants: copied.value,
    });
  isShowDialog.value = false;
}
theDialogs.on({
  type: 'cloneRaffleParticipants',
  info: { module: 'raffle', icon: 'content_copy' },
  async cb(e) {
    doneCb.value = e.done;
    errorCb.value = e.error;
    sourceRaffleDraw.value = e.payload;
    totalParticipants.value = await raffleStore.countParticipants({
      draw: e.payload.key,
    });
    totalWinners.value = await raffleStore.countParticipants({
      draw: e.payload.key,
      won: true,
    });
    sub = raffleStore
      .streamAll({
        'key !=': sourceRaffleDraw.value.key,
      })
      .subscribe({
        next(value) {
          isShowDialog.value = true;
          raffleDrawOptions.value = value;
        },
      });
  },
});
</script>
<style scoped></style>
