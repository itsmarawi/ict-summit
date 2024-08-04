<template>
  <BaseTable row-key="name" :columns="columns" :rows="filteredDraws" flat>
    <!-- Table -->
    <template #tableTop>
      <TableTop
        @onSearch="onSearchRecords"
        @on-add-raffle="onAddRaffle"
        :elements="[{ event: 'onAddRaffle', icon: 'add', label: 'Create' }]"
      />
    </template>
    <template #tableBodyCustomColumn="{ props, col }">
      <TableBodyDrawColumn
        @onToggleStatus="onToggleStatus(props.row)"
        :color="translateStatus(col.value).color"
        :name="translateStatus(col.value).name"
        :col="col"
        :identity="props.row.key"
      />
    </template>
    <template #tableHeaderRight>
      <q-th style="font-size: 20px">Action</q-th>
    </template>
    <template #tableBodyRight="{ props }">
      <TableBodyRight
        @on-delete-raffle="deleteRaffle(props.row)"
        @on-edit-raffle="onEditRaffle(props.row)"
        @open-raffle="runRaffle(props.row)"
        @on-view-raffle-prices="viewPrices(props.row)"
        :elements="propsTableActionRight"
      />
    </template>
    <!-- Table -->

    <!-- Card -->
    <template #cardItemRight="{ props }">
      <CardItemRight
        @on-delete-raffle="deleteRaffle(props.row)"
        @on-edit-raffle="onEditRaffle(props.row)"
        @open-raffle="runRaffle(props.row)"
        @on-view-raffle-prices="viewPrices(props.row)"
        :elements="propsTableActionRight"
      />
    </template>
    <template #cardItemCustomSection="{ props, col }">
      <CardItemCustomSection
        @onToggleStatus="onToggleStatus(props.row)"
        :color="translateStatus(col.value).color"
        :col="col"
        :identity="props.row.key"
      />
    </template>
    <template #fabAction>
      <FabAction
        :actions="[
          {
            event: 'onAddRaffle',
            icon: 'add',
            label: 'Create Raffle',
            isShowBtn: true,
            cb: onAddRaffle,
          },
        ]"
      />
    </template>
    <!-- Card -->
  </BaseTable>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RaffleDraw } from 'src/entities';
import BaseTable from 'src/components/base/BaseTable.vue';
import { propsTableActionRight } from './table.elements';
import { raffleDrawColumns } from './table.columns';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { Subscription } from 'rxjs';
import TableTop from './table-components/TableTop.vue';

import TableBodyRight from './table-components/TableBodyRight.vue';
import CardItemRight from './card-components/CardItemRight.vue';
import { theDialogs } from 'src/dialogs';
import { useRouter } from 'vue-router';
import TableBodyDrawColumn from './table-components/TableBodyDrawColumn.vue';
import FabAction from 'src/components/common/table/fab-components/FabAction.vue';
import CardItemCustomSection from './card-components/CardItemCustomSection.vue';

const $q = useQuasar();
const $router = useRouter();
const raffleDrawStore = useRaffleDrawStore();
const columns = ref(raffleDrawColumns);
const raffleDraws = ref<RaffleDraw[]>([]);
const search = ref('');

onMounted(() => {
  onStreamAllDrawsOfSummit();
});
let sub: Subscription;
onUnmounted(() => {
  if (sub) {
    sub.unsubscribe();
  }
});

async function onSearchRecords(term: string) {
  search.value = term;
}
const filteredDraws = computed(() => {
  if (search.value) {
    return raffleDraws.value.filter((r) =>
      new RegExp(search.value, 'i').test(
        r.name + ':' + r.owner.name + ':' + r.summit
      )
    );
  }
  return raffleDraws.value;
});

function onStreamAllDrawsOfSummit() {
  sub = raffleDrawStore
    .streamAll({
      summit: new Date().getFullYear().toString(),
    })
    .subscribe({
      next(list) {
        raffleDraws.value = list;
      },
    });
}

function translateStatus(val: boolean) {
  return val
    ? { name: 'Open', color: 'positive' }
    : { name: 'Closed', color: 'warning' };
}
function viewPrices(raffle: RaffleDraw) {
  $router.replace({
    name: 'prices',
    params: {
      draw: raffle.key,
    },
  });
}
function deleteRaffle(raffle: RaffleDraw) {
  const msg = 'Delete Raffle';
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: 'warning',
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true, label: msg },
    persistent: true,
    html: true,
  }).onOk(async () => {
    await raffleDrawStore.deleteRaffle(raffle.key);
  });
}
function onToggleStatus(value: RaffleDraw) {
  const isOpen = value.status !== 'closed';
  const msg = !isOpen ? 'Reopen this draw' : 'Closed this draw';
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: value.status ? 'warning' : undefined,
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true, label: msg },
    persistent: true,
    html: true,
  })
    .onOk(async () => {
      await raffleDrawStore.updateRaffleDraw(
        value.key,
        ['status', 'spinning'],
        {
          status: !isOpen ? 'open' : 'closed',
          spinning: false,
        }
      );
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    });
}
function onAddRaffle() {
  theDialogs.emit({
    type: 'addRaffle',
    arg: {
      done(raffle) {
        $q.notify({
          message: `Created raffle draw ${raffle.name}`,
          icon: 'info',
          color: 'positive',
        });
      },
      error(err) {
        $q.notify({
          message: String(err),
          icon: 'error',
          color: 'negative',
        });
      },
    },
  });
}
function onEditRaffle(raffle: RaffleDraw) {
  theDialogs.emit({
    type: 'editRaffle',
    arg: {
      payload: raffle,
      done(result) {
        $q.notify({
          message: `Updated raffle draw ${result.name}`,
          icon: 'info',
          color: 'positive',
        });
      },
      error(err) {
        $q.notify({
          message: String(err),
          icon: 'error',
          color: 'negative',
        });
      },
    },
  });
}
function runRaffle(raffle: RaffleDraw) {
  if (raffle.status == 'open') {
    $router.replace({
      name: 'raffle',
      params: {
        draw: raffle.key,
      },
    });
  } else if (raffle.status == 'running') {
    const msg = 'Spin the wheels';
    $q.dialog({
      title: `<span class="text-negative">${msg}</span>`,
      message: `Are you sure you want to ${msg}?`,
      cancel: { outline: true, rounded: true, color: 'negative' },
      ok: { rounded: true, label: msg },
      persistent: true,
      html: true,
    })
      .onOk(async () => {
        await raffleDrawStore.updateRaffleDrawProp(
          raffle.key,
          'spinning',
          true
        );
      })
      .onCancel(() => {
        // console.log('>>>> Cancel')
      });
  }
}
</script>
