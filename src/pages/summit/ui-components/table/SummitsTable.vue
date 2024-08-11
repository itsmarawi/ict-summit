<template>
  <BaseTable row-key="name" :columns="columns" :rows="filteredPrices" flat>
    <!-- Table -->
    <template #tableTop>
      <TableTop @onSearch="onSearchRecords" :elements="[]" />
    </template>
    <template #tableBodyCustomColumn="{ props, col }">
      <TableBodySummitColumn
        :col="col"
        :identity="props.row.key"
        @on-toggle-status="onToggleStatus(props.row)"
      />
    </template>
    <template #tableHeaderRight>
      <q-th style="font-size: 20px">Action</q-th>
    </template>
    <template #tableBodyRight="{ props }">
      <TableBodyRight
        :elements="propsSummitTableActionRight"
        @onEditSummit="onEditSummit(props.row)"
      />
    </template>
    <!-- Table -->
    <!-- Card -->
    <template #cardItemRight="{ props }">
      <CardItemRight
        :elements="propsSummitTableActionRight"
        @onEditSummit="onEditSummit(props.row)"
      />
    </template>
    <template #cardItemCustomSection="{ props, col }">
      <CardItemCustomSection :col="col" :identity="props.row.recipient.key" />
    </template>

    <!-- Card -->
  </BaseTable>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ISummit } from 'src/entities';
import BaseTable from 'src/components/base/BaseTable.vue';
import { summitColumns } from './table.columns';
import { Subscription } from 'rxjs';
import TableTop from './table-components/TableTop.vue';
import TableBodyRight from './table-components/TableBodyRight.vue';
import CardItemRight from './card-components/CardItemRight.vue';
import { useRoute } from 'vue-router';
import { useSummitStore } from 'src/stores/summit-store';
import TableBodySummitColumn from './table-components/TableBodySummitColumn.vue';
import { propsSummitTableActionRight } from './table.elements';
import CardItemCustomSection from './card-components/CardItemCustomSection.vue';
import { useQuasar } from 'quasar';
import { theDialogs } from 'src/dialogs';

const $route = useRoute();
const $q = useQuasar();
const summitStore = useSummitStore();
const columns = ref(summitColumns);
const activeSummit = ref<ISummit>();
const summits = ref<ISummit[]>([]);
const search = ref('');

onMounted(async () => {
  if (typeof $route.params.summit == 'string') {
    activeSummit.value = await summitStore.getSummit($route.params.summit);
  } else {
    activeSummit.value = await summitStore.getSummit(
      new Date().getFullYear().toString()
    );
    if (!activeSummit.value) {
      activeSummit.value = await summitStore.createSummit({
        key: '',
        name: '',
        year: new Date().getFullYear().toString(),
        dateStart: '',
        dateEnd: '',
        status: true,
        slots: 300,
        theme: 'ICT Inovation',
      });
    }
  }
  streamSummits();
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
const filteredPrices = computed(() => {
  if (search.value) {
    return summits.value.filter((r) =>
      new RegExp(search.value, 'i').test(
        r.theme + ':' + r.dateStart + ':' + r.year + ':' + r.key
      )
    );
  }
  return summits.value;
});

function streamSummits() {
  sub = summitStore.streamSummits().subscribe({
    next(list) {
      summits.value = list;
    },
  });
}
function onToggleStatus(value: ISummit) {
  const msg = !value.status ? 'Activate this summit' : 'Deactivate this summit';
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: value.status ? 'warning' : undefined,
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true },
    persistent: true,
    html: true,
  })
    .onOk(async () => {
      await summitStore.updateSummitProp(value.key, 'status', !value.status);
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    });
}
function onEditSummit(summit: ISummit) {
  theDialogs.emit({
    type: 'editSummit',
    arg: {
      payload: summit,
      done(summit) {
        $q.notify({
          message: `${summit.year} Summit is updated`,
          color: 'positive',
          icon: 'info',
        });
      },
      error(err) {
        $q.notify({
          message: 'Error:' + String(err),
          color: 'negative',
          icon: 'error',
        });
      },
    },
  });
}
</script>
