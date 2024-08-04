<template>
  <q-page>
    <div v-if="canManageDraw && (selected.length >= groupCount || !ready)">
      <q-banner class="bg-positive q-mb-sm">
        <div class="text-h6 text-center" v-if="selected.length">
          <div>Congratulations!</div>
          <q-chip v-for="winner in selected" :key="winner.key">
            <ProfileAvatar size="sm" :profile-key="winner.participant.key" />
            {{ winner.participant.name }}
          </q-chip>
        </div>
        <div v-else class="text-center q-gutter-sm">
          <div>
            Welcome to {{ presentRaffle?.name }} with
            {{ participants.length }} Participants
          </div>
          <q-avatar v-for="p in participants" :key="p.key" color="grey">
            <q-img v-if="p.participant.avatar" :src="p.participant.avatar" />
            <span v-else class="text-uppercase">{{
              p.participant.name.replace(/(\w)[\w]+\s?/g, '$1')
            }}</span>
          </q-avatar>
        </div>
        <template #action>
          <q-btn @click="nextRound">{{
            winners.length || selected.length ? 'Next' : 'Start'
          }}</q-btn>
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
        >Welcome to {{ presentRaffle?.name }} with
        {{ participants.length }} Participants
        <template #action>
          <q-btn icon="add" @click="groupCount++"></q-btn>
          <q-btn icon="qr_code" @click="ready = false"></q-btn>
        </template>
      </q-banner>

      <div
        v-if="participants.length >= 4 && presentRaffle?.winnerPrices?.length"
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
          v-for="group in groupCount"
          :key="group"
          display-indicator
          :duration="5"
          class="wheel"
          ref="wheels"
          easing="bounce"
          :items="groupings[group - 1] || []"
          :size="Math.min($q.screen.width, $q.screen.height) - 150"
          :result-variation="duration"
          @click="launchWheel"
          @wheel-end="(winner:Person) => wheelEnded(wheels && wheels[group-1], winner)"
        >
        </Roulette>
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
      <q-list
        bordered
        dense
        class="rounded-border q-mx-xl"
        v-else-if="presentRaffle.winnerPrices?.length"
      >
        <div class="text-h6">Winners</div>
        <q-item
          v-for="(w, i) in winners"
          :key="w.id"
          :class="i % 2 ? '' : 'bg-dark'"
        >
          <q-item-section avatar>
            <ProfileAvatar :profile-key="w.winner.key" />
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
import ProfileAvatar from 'src/components/common/ProfileAvatar.vue';
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
    this.htmlContent = `<div>${name}</div><img width="25" heght="25" class="avatar" src="${avatar}" alt="" />`;
  }
}
interface SpinningWheel {
  launchWheel(): void;
  reset(): void;
}
const profileStore = useProfileStore();
const raffleStore = useRaffleDrawStore();
const $q = useQuasar();

const ready = ref(true);
const wheels = ref<SpinningWheel[] | null>(null);
const spinning = ref(false);
const participants = ref<RaffleParticipant[]>([]);
const winners = ref<RaffleWinner[]>([]);
const selected = ref<RaffleParticipant[]>([]);
const presentRaffle = ref<RaffleDraw>();
const duration = ref(68);
const groupCount = ref(1);
function shufflePeople(people: Person[]) {
  const shuffledPeople = [...people];
  for (let i = shuffledPeople.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPeople[i], shuffledPeople[j]] = [
      shuffledPeople[j],
      shuffledPeople[i],
    ];
  }
  return shuffledPeople;
}
const groupings = computed(() => {
  const people = shufflePeople(
    participants.value.map(
      (p) =>
        new Person(p.participant.name, p.participant.key, p.participant.avatar)
    )
  );

  const memberCount = Math.max(Math.ceil(people.length / groupCount.value), 4);
  const parts: Person[][] = [];
  while (people.length) {
    parts.push(people.splice(0, memberCount));
  }
  return parts;
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
const canManageDraw = computed(() => {
  if (
    presentRaffle.value &&
    presentRaffle.value.status == 'running' &&
    profileStore.theUser?.key !== presentRaffle.value.managedBy
  ) {
    return false;
  }
  return /^(admin|moderator)$/.test(profileStore.theUser?.role || '');
});
let participantSub: Subscription;
let presentSub: Subscription;
let winnesSub: Subscription;

async function load() {
  const raffleId = String($route.params.draw || '');
  presentRaffle.value = await raffleStore.getRaffleDraw(raffleId);
  if (presentRaffle.value) {
    if (canManageDraw.value) {
      participantSub = raffleStore
        .streamRaffleParticipants(presentRaffle.value)
        .subscribe({
          next(value) {
            if (!presentRaffle.value?.spinning) {
              participants.value = value.filter((p) => !p.won);
              if (groupCount.value == 1 && value.length >= 32) {
                groupCount.value = 2;
              } else if (participants.value.length < 8) {
                groupCount.value = 1;
              }
            }
          },
        });
      await raffleStore.updateRaffleDraw(
        presentRaffle.value.key,
        ['status', 'managedBy'],
        {
          status: 'running',
          managedBy: profileStore.theUser?.key,
        }
      );
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
              actions: presentRaffle.value?.defaultPrices.length
                ? [
                    {
                      icon: 'reddem',
                      label: 'Redeem',
                      to: { name: 'prices' },
                    },
                  ]
                : [],
            });
          } else {
            if (canManageDraw.value) {
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
        let spinnedRemotely =
          presentRaffle.value && !presentRaffle.value.spinning;
        presentRaffle.value = value[0] || presentRaffle.value;
        spinnedRemotely = spinnedRemotely && !!presentRaffle.value?.spinning;
        if (spinnedRemotely) {
          launchWheel();
          ready.value = true;
        }
      },
    });
    winnesSub = raffleStore.streamRaffleWinners(presentRaffle.value).subscribe({
      next(list) {
        winners.value = list || winners.value;
        participants.value = participants.value.filter(
          (p) =>
            !p.won &&
            !winners.value.find((w) => w.winner.key == p.participant.key)
        );
        if (participants.value.length <= 4) {
          groupCount.value = 1;
        }
      },
    });
  }
}
onMounted(async () => {
  await load();
});
onUnmounted(async () => {
  participantSub?.unsubscribe();
  presentSub?.unsubscribe();
  winnesSub?.unsubscribe();
  if (presentRaffle.value?.status == 'running' && canManageDraw.value) {
    await raffleStore.updateRaffleDraw(presentRaffle.value.key, ['status'], {
      status: 'open',
    });
  }
});

async function launchWheel() {
  if (!canManageDraw.value) {
    return;
  }
  spinning.value = true;
  selected.value = [];
  //duration.value = Math.round(Math.random() * 50) + 50;
  if (!wheels.value) return;
  wheels.value.forEach((wheel) => wheel.launchWheel());
  if (presentRaffle.value && !presentRaffle.value?.spinning) {
    await raffleStore.updateRaffleDrawProp(
      presentRaffle.value.key,
      'spinning',
      true
    );
    presentRaffle.value.spinning = true;
  }
}
async function wheelEnded(wheel: SpinningWheel | null, winner: Person) {
  spinning.value = false;
  const winningParticipant = participants.value.find(
    (p) => p.participant.key == winner.id
  );
  if (!winningParticipant) return;
  selected.value.push(winningParticipant);
  if (presentRaffle.value) {
    await raffleStore.setRaffleWinner(presentRaffle.value, winningParticipant);
  }
  if (presentRaffle.value && selected.value.length >= groupCount.value) {
    await raffleStore.updateRaffleDrawProp(
      presentRaffle.value.key,
      'spinning',
      false
    );
    presentRaffle.value.spinning = false;
  }
}
function nextRound() {
  selected.value = [];
  ready.value = true;
}
</script>
<style lang="css">
.flex {
  display: flex;
}

.flex.col {
  flex-direction: column;
}

.flex.center {
  justify-content: center;
  align-items: center;
}
.wheel {
  user-select: none;
}

.wheel-container::after {
  content: '';
  height: 210px;
  width: 2px;
  position: absolute;
  border: 1px solid rgba(0, 0, 0, 0.25);
  top: 0;
  left: calc(50% - 2px);
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.wheel:not(.wheel-container)::after {
  content: '';
  background-image: url(/icons/favicon-128x128.png);
  width: 64px;
  height: 64px;
  position: absolute;
  top: 50%;
  left: 50%;
  background-size: contain;
  z-index: 5;
  transform: translate(-50%, -50%);
}

.wheel .wheel-item:nth-child(odd) {
  background: linear-gradient(90deg, #2cbd9a 0%, #65c86d);
}

.wheel .wheel-item:nth-child(even) {
  background: linear-gradient(to right, #ffa246, #e14a53);
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  box-shadow: 4px 4px 10px black;
}
</style>
