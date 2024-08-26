<template>
  <q-page id="rafflePage">
    <div
      v-if="
        canManageDraw && (selected.length >= groupCount || !ready) && !spinning
      "
    >
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
          <q-avatar
            v-for="p in participants"
            :key="p.key"
            size="xs"
            color="grey"
          >
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
      <q-banner>
        <div class="text-h6 text-center">
          Welcome to {{ presentRaffle?.name }} with
          {{ participants.length }} Participants
        </div>
        <template #action>
          <div class="print-hide">
            <q-btn
              flat
              v-if="divisible"
              rounded
              icon="safety_divider"
              @click="groupCount++, wheelsResults.push({ value: null })"
              >&nbsp;Split</q-btn
            >
            <q-btn flat rounded icon="qr_code" @click="ready = false"
              >Raffle Qr Code</q-btn
            >
            <q-btn
              flat
              rounded
              icon="fullscreen"
              :label="$q.fullscreen.isActive ? 'Exit Fullscreen' : 'Fullscreen'"
              @click="toggleFullscreen"
            ></q-btn>
          </div>
        </template>
      </q-banner>
      <div
        v-if="
          (participants.length >= 4 && presentRaffle?.winnerPrices?.length) ||
          spinning
        "
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
          :key="group + 1"
          display-indicator
          :duration="5"
          class="wheel"
          ref="wheels"
          easing="bounce"
          :items="groupings[group - 1] || []"
          :size="
            Math.min($q.screen.width / groupCount, $q.screen.height - 150) - 5
          "
          :wheel-result-index="wheelsResults[group - 1]"
          :result-variation="duration"
          @click="confirmLaunchWeels"
          @wheel-end="(winner:Person) => wheelEnded(group-1, winner)"
        >
        </Roulette>
        <div class="col-12 text-h6 text-center q-pb-xl" v-if="winners.length">
          <div>Congratulations!</div>
          <q-chip v-for="winner in winners" :key="winner.key">
            <ProfileAvatar size="sm" :profile-key="winner.participant.key" />
            {{ winner.participant.name }}
          </q-chip>
        </div>
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
            <ProfileAvatar :profile-key="w.participant.key" />
          </q-item-section>
          <q-item-section>{{ w.participant.name }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>
<script lang="ts" setup>
import { Roulette } from 'vue3-roulette';
import QrcodeVue from 'qrcode.vue';

import { RaffleDraw, RaffleParticipant } from 'src/entities';
import { useProfileStore } from 'src/stores/profile-store';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Subscription } from 'rxjs';
import { useQuasar } from 'quasar';
import ProfileAvatar from 'src/components/common/ProfileAvatar.vue';
import { ObjectUtil } from 'src/utils/object.util';
import { DeferredPromise } from 'src/resources/localbase';

function toggleFullscreen() {
  const target = document.getElementById('rafflePage');
  if (target) {
    $q.fullscreen.toggle(target);
  }
}
function generateAvatar(name: string) {
  const initials = name
    .split(' ')
    .map((str) => (str ? str[0].toUpperCase() : ''))
    .splice(0, 2)
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
const wheelsResults = ref<{ value: null | number }[]>([{ value: null }]);
const wheels = ref<SpinningWheel[] | null>(null);
const spinning = ref(false);
const participants = ref<RaffleParticipant[]>([]);
const winners = ref<RaffleParticipant[]>([]);
const selected = ref<RaffleParticipant[]>([]);
const spinningWheels = ref<SpinningWheel[] | null>(null);
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
const divisible = computed(() => {
  const totalCount = participants.value.length;
  const memberCount = Math.max(
    Math.ceil(totalCount / (groupCount.value + 1)),
    4
  );
  const remainder = totalCount - memberCount * groupCount.value;
  return remainder >= 4;
});
const shouldGroupDown = computed(() => {
  const totalCount = participants.value.length;
  const memberCount = Math.max(Math.ceil(totalCount / groupCount.value), 4);
  const remainder = totalCount - memberCount * (groupCount.value - 1);
  return remainder < 4;
});
const $route = useRoute();
const isHosting = computed(() => {
  return (
    presentRaffle.value &&
    (presentRaffle.value.owner.key == profileStore.theUser?.key ||
      presentRaffle.value.managedBy == profileStore.theUser?.key)
  );
});
const qrCodeUrl = computed(() => {
  return location.href;
});
const isManager = computed(() => {
  return /^(admin|moderator)$/.test(profileStore.theUser?.role || '');
});
const canManageDraw = computed(() => {
  if (
    presentRaffle.value &&
    presentRaffle.value.status == 'running' &&
    profileStore.theUser?.key !== presentRaffle.value.managedBy
  ) {
    return false;
  }
  return isManager.value;
});
let participantSub: Subscription;
let presentSub: Subscription;
let winnesSub: Subscription;

async function load() {
  const raffleId = String($route.params.draw || '');
  presentRaffle.value = await raffleStore.getRaffleDraw(raffleId);
  if (presentRaffle.value) {
    participantSub = raffleStore
      .streamRaffleParticipants(presentRaffle.value)
      .subscribe({
        next(list) {
          if (canManageDraw.value) {
            if (!presentRaffle.value?.spinning) {
              participants.value = list.filter((p) => !p.won);
              if (groupCount.value == 1 && list.length >= 32) {
                groupCount.value = 2;
                wheelsResults.value = [{ value: null }, { value: null }];
              }
              while (shouldGroupDown.value && groupCount.value > 2) {
                groupCount.value = groupCount.value - 1;
                wheelsResults.value.pop();
              }
            }
          }
          winners.value =
            list.filter((p) => p.won && !p.default) || winners.value;
          winners.value
            .filter((w) => profileStore.theUser?.key == w.participant.key)
            .forEach((w) => {
              new Notification(
                `Congrats ${
                  w.participant.name
                } you win ${presentRaffle.value?.winnerPrices.join(', ')}`,
                {
                  body: presentRaffle.value?.name,
                  tag: w.key,
                }
              );
            });
        },
      });
    if (canManageDraw.value) {
      await raffleStore.updateRaffleDraw(
        presentRaffle.value.key,
        ['status', 'managedBy'],
        {
          status: 'running',
          managedBy: profileStore.theUser?.key,
        }
      );
    } else if (profileStore.theUser) {
      if (!canManageDraw.value && isManager.value) {
        if (!presentRaffle.value.defaultPrices.length) {
          $q.notify({
            position: 'center',
            icon: 'warning',
            message: 'Admins or Moderators are not qualified to join',
          });
          return;
        }
        if (!(await confirmJoinDraw())) {
          return;
        }
      }
      const result = await raffleStore.joinRaffle(
        presentRaffle.value,
        profileStore.theUser
      );
      if (result) {
        const withPrices =
          Array.isArray(result.prices) && result.prices.length > 0;
        $q.notify({
          position: 'center',
          icon: 'info',
          message: !result.won
            ? `Welcome to ${presentRaffle.value?.name}`
            : 'Already won!',
          caption: withPrices
            ? `Please claim your ${result.prices.length} freebie`
            : '',
          actions: withPrices
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
        $q.notify({
          position: 'center',
          icon: 'warning',
          message: `${presentRaffle.value?.name} is closed for new joiners`,
        });
      }
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
function confirmLaunchWeels() {
  const msg = 'Spin the wheel' + (groupCount.value > 1 ? 's' : '');
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: 'warning',
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true, label: msg, icon: 'ion-play-circle' },
    persistent: true,
    html: true,
  }).onOk(async () => {
    await launchWheel();
  });
}

function confirmJoinDraw() {
  const msg = `Join ${presentRaffle.value?.name || 'Draw'} as ${
    profileStore.theUser?.role || 'participant'
  }`;
  const deferred = new DeferredPromise<boolean>();
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: 'warning',
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true, label: msg, icon: 'ion-play-circle' },
    persistent: true,
    html: true,
  })
    .onOk(() => {
      deferred.resolve(true);
    })
    .onCancel(() => {
      deferred.reject(false);
    });
  return deferred.promise;
}

async function launchWheel() {
  if (!canManageDraw.value) {
    return;
  }
  spinning.value = true;
  selected.value = [];
  spinningWheels.value = [];
  //duration.value = Math.round(Math.random() * 50) + 50;
  if (!wheels.value) return;
  wheels.value.forEach((wheel, index) => {
    setTimeout(() => {
      wheel.launchWheel();
      spinningWheels.value?.push(wheel);
    }, Math.round((index + 1) * Math.random() * 1000));
  });
  if (presentRaffle.value && !presentRaffle.value?.spinning) {
    presentRaffle.value.spinning = true;
    await raffleStore.updateRaffleDrawProp(
      presentRaffle.value.key,
      'spinning',
      true
    );
  }
}
async function wheelEnded(groupIndex: number, winner: Person) {
  const wheel = wheels.value?.[groupIndex];
  const participant = participants.value.find(
    (p) => p.participant.key == winner.id
  );
  if (!participant) {
    return;
  }
  const winningParticipant = ObjectUtil.copyObject(participant);
  if (!winningParticipant) return;
  if (presentRaffle.value) {
    try {
      await raffleStore.setRaffleWinner(
        presentRaffle.value,
        winningParticipant
      );
    } catch (error) {
      console.log('failed', error);
    }
    selected.value.push(winningParticipant);
  }
  const index = spinningWheels.value?.findIndex((w) => wheel == w);
  if (typeof index == 'number' && index >= 0) {
    spinningWheels.value?.splice(index, 1);
  }
  if (presentRaffle.value && !spinningWheels.value?.length) {
    await raffleStore.updateRaffleDrawProp(
      presentRaffle.value.key,
      'spinning',
      false
    );
    presentRaffle.value.spinning = false;
    setTimeout(() => {
      spinning.value = false;
      const list = [...selected.value];
      while (list.length) {
        const par = list.pop();
        const index = participants.value.findIndex(
          (p) => p.participant.key == par?.participant.key
        );
        if (index >= 0) {
          participants.value.splice(index, 1);
        }
      }
    }, 1000);
  }
}
function nextRound() {
  while (shouldGroupDown.value && groupCount.value > 1) {
    groupCount.value = groupCount.value - 1;
    wheelsResults.value.pop();
  }
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
