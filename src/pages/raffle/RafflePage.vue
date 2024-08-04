<template>
  <q-page>
    <div v-if="selected">
      <q-banner>
        <div class="text-h6 text-center">
          Congratulations {{ selected.participant.name }}!
          <q-avatar color="grey">
            <q-img
              v-if="selected.participant.avatar"
              :src="selected.participant.avatar"
            />
            <span v-else class="text-uppercase">{{
              selected.participant.name.replace(/(\w)[\w]+\s?/g, '$1')
            }}</span>
          </q-avatar>
        </div>
        <template #action>
          <q-btn @click="nextRound">Next</q-btn>
        </template>
      </q-banner>
      <div class="row justify-center">
        <q-card class="bg-white q-pa-sm">
          <qrcode-vue
            :value="qrCodeUrl"
            :size="Math.min($q.screen.width, $q.screen.height) - 260"
            level="H"
          />
        </q-card>
      </div>
      <div class="text-h6 text-center">Scan to Join</div>
    </div>
    <!-- if present user is the host of event -->
    <div v-else-if="isHosting">
      <q-banner class="text-h6 text-center"
        >Welcome to {{ presentRaffle?.name }}</q-banner
      >

      <div
        v-if="people.length >= 4 && presentRaffle?.winnerPrices?.length"
        class="row justify -center"
      >
        <div class="col-12 text-center">
          <q-chip
            color="primary"
            v-for="(price, indx) in presentRaffle?.winnerPrices || []"
            :key="indx"
            >{{ price }}</q-chip
          >
        </div>
        <Roulette
          display-shadow
          display-indicator
          :counter-clockwise="false"
          :duration="10"
          class="wheel"
          ref="wheel"
          easing="bounce"
          :items="people"
          :size="Math.min($q.screen.width, $q.screen.height) - 150"
          :result-variation="duration"
          @click="launchWheel"
          @wheel-end="wheelEnded"
        ></Roulette>
      </div>
      <div v-else>
        <q-banner class="text-center">
          <div class="text-bold" v-if="presentRaffle?.winnerPrices?.length">
            Requires at least 4 participants
          </div>
          <div class="text-center q-gutter-sm">
            <q-avatar v-for="p in participants" :key="p.key" color="grey">
              <q-img v-if="p.participant.avatar" :src="p.participant.avatar" />
              <span v-else class="text-uppercase">{{
                p.participant.name.replace(/(\w)[\w]+\s?/g, '$1')
              }}</span>
            </q-avatar>
          </div>
        </q-banner>
        <div class="row justify-center">
          <q-card class="bg-white q-pa-sm">
            <qrcode-vue
              :value="qrCodeUrl"
              :size="Math.min($q.screen.width, $q.screen.height) - 260"
              level="H"
            />
          </q-card>
        </div>
        <div class="text-h6 q-pb-lg text-center">Scan to join</div>
      </div>
    </div>
    <div v-else-if="presentRaffle" class="text-center">
      <q-banner class="text-h6">Welcome to {{ presentRaffle.name }}</q-banner>
      <q-spinner-orbit
        v-if="presentRaffle.spinning"
        color="primary"
        size="8em"
      />
      <q-list bordered v-else-if="presentRaffle.winnerPrices?.length">
        <div class="text-h6">Winners</div>
        <q-item v-for="w in winners" :key="w.id">
          <q-item-section avatar>
            <q-avatar>
              <q-img :src="w.winner.avatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section>{{ w.winner.name }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>
<script lang="ts" setup>
import { Roulette } from 'vue3-roulette';
import QrcodeVue from 'qrcode.vue';

import { RaffleDraw, RaffleParticipant, RaffleWinner } from 'src/entities';
import { useProfileStore } from 'src/stores/profile-store';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Subscription } from 'rxjs';
import { useQuasar } from 'quasar';
function generateAvatar(name: string) {
  const initials = name
    .split(' ')
    .map((str) => (str ? str[0].toUpperCase() : ''))
    .join('');

  const canvas = document.createElement('canvas');
  const radius = 25;
  const margin = 5;

  canvas.width = radius * 2 + margin * 2;
  canvas.height = radius * 2 + margin * 2;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.beginPath();
  ctx.arc(radius + margin, radius + margin, radius, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = 'grey'; // Background color
  ctx.fill();

  ctx.fillStyle = 'white'; // Text color
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(initials, radius + 5, (radius * 4) / 3 + margin);

  return canvas.toDataURL(); // The canvas will not be added to the document.
}
class Person {
  htmlContent: string;
  constructor(public name: string, public id: string, avatar: string) {
    if (!avatar || !/\:/.test(avatar)) {
      avatar = generateAvatar(name);
    }
    this.htmlContent = `<div style="gap: 25px;">
      ${name}<br/><img width="25" heght="25" class="avatar" src="${avatar}" alt="" /></div>`;
  }
}
interface SpinningWheel {
  launchWheel(): void;
  reset(): void;
}
const profileStore = useProfileStore();
const raffleStore = useRaffleDrawStore();
const $q = useQuasar();

const wheel = ref<SpinningWheel | null>(null);
const spinning = ref(false);
const participants = ref<RaffleParticipant[]>([]);
const winners = ref<RaffleWinner[]>([]);
const selected = ref<RaffleParticipant>();
const presentRaffle = ref<RaffleDraw>();
const duration = ref(100);
const people = computed(() => {
  return participants.value.map(
    (p) =>
      new Person(p.participant.name, p.participant.key, p.participant.avatar)
  );
});
const $route = useRoute();
const isHosting = computed(() => {
  return (
    presentRaffle.value &&
    presentRaffle.value.owner.key == profileStore.theUser?.key
  );
});
const qrCodeUrl = computed(() => {
  return location.href;
});
let participantSub: Subscription;
let presentSub: Subscription;
let winnesSub: Subscription;

async function load() {
  const raffleId = String($route.params.draw || '');
  presentRaffle.value = await raffleStore.getRaffleDraw(raffleId);
  if (presentRaffle.value) {
    if (profileStore.theUser?.key == presentRaffle.value?.owner.key) {
      participantSub = raffleStore
        .streamRaffleParticipants(presentRaffle.value)
        .subscribe({
          next(value) {
            participants.value = value;
          },
        });
    } else if (profileStore.theUser) {
      raffleStore
        .joinRaffle(presentRaffle.value, profileStore.theUser)
        .then((result) => {
          if (result) {
            $q.notify({
              position: 'center',
              icon: 'info',
              message: `Welcome to ${presentRaffle.value?.name}`,
              caption: Array.isArray(result)
                ? `Please claim your ${result.length} freebie`
                : '',
              actions: [
                {
                  icon: 'reddem',
                  label: 'Redeem',
                  to: { name: 'prices' },
                },
              ],
            });
          } else {
            if (/^(admin|moderator)$/.test(profileStore.theUser?.role || '')) {
              $q.notify({
                position: 'center',
                icon: 'warning',
                message: 'Admins or Moderators are not qualified to join',
              });
            } else {
              $q.notify({
                position: 'center',
                icon: 'warning',
                message: `${presentRaffle.value?.name} is closed for new joiners`,
              });
            }
          }
        });
    }
    presentSub = raffleStore.streamUpdate(presentRaffle.value).subscribe({
      next(value) {
        presentRaffle.value = value[0] || presentRaffle.value;
      },
    });
    winnesSub = raffleStore.streamRaffleWinners(presentRaffle.value).subscribe({
      next(list) {
        winners.value = list || winners.value;
        participants.value = participants.value.filter(
          (p) => !winners.value.find((w) => w.winner.key == p.participant.key)
        );
      },
    });
  }
}
onMounted(async () => {
  await load();
});
onUnmounted(() => {
  participantSub?.unsubscribe();
  presentSub?.unsubscribe();
  winnesSub?.unsubscribe();
});

async function launchWheel() {
  spinning.value = true;
  //duration.value = Math.round(Math.random() * 50) + 50;
  wheel.value?.launchWheel();
  if (presentRaffle.value) {
    presentRaffle.value.spinning = true;
    await raffleStore.updateRaffleDrawProp(
      presentRaffle.value.key,
      'spinning',
      true
    );
  }
}
async function wheelEnded(winner: Person) {
  spinning.value = false;
  selected.value = participants.value.find(
    (p) => p.participant.key == winner.id
  );
  if (presentRaffle.value) {
    presentRaffle.value.spinning = false;
    await raffleStore.updateRaffleDrawProp(
      presentRaffle.value.key,
      'spinning',
      false
    );
    if (selected.value) {
      await raffleStore.setRaffleWinner(
        presentRaffle.value,
        selected.value.participant
      );
    }
  }
}
function nextRound() {
  selected.value = undefined;
}
</script>
