<template>
  <BaseTable row-key="name" :columns="columns" :rows="filteredPrices" flat>
    <!-- Table -->
    <template #tableTop>
      <TableTop @onSearch="onSearchRecords" :elements="[]" />
    </template>
    <template #tableBodyCustomColumn="{ props, col }">
      <TableBodyPriceColumn
        :col="col"
        :identity="props.row.key"
        @on-toggle-status="releaseRafflePrice(props.row)"
        @on-view-price-qr="viewRafflePrice(props.row)"
      />
    </template>
    <template #tableHeaderRight>
      <q-th style="font-size: 20px">Action</q-th>
    </template>
    <template #tableBodyRight="{ props }">
      <TableBodyRight
        :elements="actionRight"
        @on-release-price="releaseRafflePrice(props.row)"
        @on-unclaim-price="unClaimedRafflePrice(props.row)"
        @on-claim-price="viewRafflePrice(props.row)"
      />
    </template>
    <!-- Table -->
    <!-- Card -->
    <template #cardItemRight="{ props }">
      <CardItemRight
        :elements="actionRight"
        @on-release-price="releaseRafflePrice(props.row)"
        @on-unclaim-price="unClaimedRafflePrice(props.row)"
        @on-claim-price="viewRafflePrice(props.row)"
      />
    </template>
    <template #cardItemCustomSection="{ props, col }">
      <CardItemPriceSection :col="col" :identity="props.row.key" />
    </template>

    <!-- Card -->
  </BaseTable>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RaffleDraw, RafflePrice } from 'src/entities';
import BaseTable from 'src/components/base/BaseTable.vue';
import {
  propsTablePriceModeratorActionRight,
  propsTablePriceRecipientActionRight,
} from './table.elements';
import { rafflePriceColumns } from './table.columns';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { Subscription } from 'rxjs';
import TableTop from './table-components/TableTop.vue';
import TableBodyRight from './table-components/TableBodyRight.vue';
import CardItemRight from './card-components/CardItemRight.vue';
import { useRoute } from 'vue-router';
import { useProfileStore } from 'src/stores/profile-store';
import TableBodyPriceColumn from './table-components/TableBodyPriceColumn.vue';
import { theDialogs } from 'src/dialogs';
import CardItemPriceSection from './card-components/CardItemPriceSection.vue';

const $q = useQuasar();
const $route = useRoute();
const profileStore = useProfileStore();
const raffleDrawStore = useRaffleDrawStore();
const columns = ref(rafflePriceColumns);
const activeRaffle = ref<RaffleDraw>();
const rafflePrices = ref<RafflePrice[]>([]);
const search = ref('');

onMounted(async () => {
  if (typeof $route.params.draw == 'string') {
    activeRaffle.value = await raffleDrawStore.getRaffleDraw(
      $route.params.draw
    );
  } else {
    activeRaffle.value = undefined;
  }
  streamPrices();
});
let sub: Subscription;
onUnmounted(() => {
  if (sub) {
    sub.unsubscribe();
  }
});
const actionRight = computed(() => {
  return !activeRaffle.value
    ? propsTablePriceRecipientActionRight
    : propsTablePriceModeratorActionRight;
});
async function onSearchRecords(term: string) {
  search.value = term;
}
const filteredPrices = computed(() => {
  if (search.value) {
    return rafflePrices.value.filter((r) =>
      new RegExp(search.value, 'i').test(
        r.recipient.name + ':' + r.price + ':' + r.draw + ':' + r.key
      )
    );
  }
  return rafflePrices.value;
});

function streamPrices() {
  if (activeRaffle.value) {
    sub = raffleDrawStore.streamRafflePrices(activeRaffle.value).subscribe({
      next(list) {
        rafflePrices.value = list;
      },
    });
  } else if (profileStore.theUser) {
    sub = raffleDrawStore
      .streamParticipantPrices(profileStore.theUser)
      .subscribe({
        next(list) {
          rafflePrices.value = list;
        },
      });
  }
}

function releaseRafflePrice(price: RafflePrice) {
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
    await raffleDrawStore.updateRafflePrice(
      price.key,
      ['status', 'releasedBy'],
      {
        status: 'released',
        releasedBy: profileStore.theUser,
      }
    );
  });
}
function unClaimedRafflePrice(price: RafflePrice) {
  if (price.status !== 'ready') {
    $q.notify({
      message: `Price is already ${price.status}`,
      icon: 'info',
      position: 'center',
    });
    return;
  }
  const msg = 'Un-Claimed Raffle Price';
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: 'warning',
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true, label: msg },
    persistent: true,
    html: true,
  }).onOk(async () => {
    await raffleDrawStore.updateRafflePriceProp(
      price.key,
      'status',
      'unclaimed'
    );
  });
}

function viewRafflePrice(price: RafflePrice) {
  //show QR Code
  theDialogs.emit({
    type: 'viewRafflePriceQr',
    arg: {
      payload: price,
    },
  });
}
</script>
