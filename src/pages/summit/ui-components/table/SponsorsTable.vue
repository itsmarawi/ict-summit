<template>
  <BaseTable row-key="name" :columns="columns" :rows="filteredRecords" flat>
    <!-- Table -->
    <template #tableTop>
      <TableTop
        @onSearch="onSearchRecords"
        @onAddSponsor="onAddSponsor"
        :elements="[
          {
            event: 'onAddSponsor',
            icon: 'add',
          },
        ]"
      />
    </template>
    <template #tableBodyCustomColumn="{ props, col }">
      <TableBodyCustomColumn
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
        :elements="propsSponsorTableActionRight"
        @onEditSponsor="onEditSponsor(props.row)"
      />
    </template>
    <!-- Table -->
    <!-- Card -->
    <template #cardItemRight="{ props }">
      <CardItemRight
        :elements="propsSponsorTableActionRight"
        @onEditSponsor="onEditSponsor(props.row)"
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
import { ISponsor, ISummit } from 'src/entities';
import BaseTable from 'src/components/base/BaseTable.vue';
import { sponsorsColumns } from './table.columns';
import { Subscription } from 'rxjs';
import TableTop from './table-components/TableTop.vue';
import TableBodyRight from './table-components/TableBodyRight.vue';
import CardItemRight from './card-components/CardItemRight.vue';
import { useSummitStore } from 'src/stores/summit-store';
import { propsSponsorTableActionRight } from './table.elements';
import CardItemCustomSection from './card-components/CardItemCustomSection.vue';
import { useQuasar } from 'quasar';
import TableBodyCustomColumn from 'src/pages/account/ui-components/table/table-components/TableBodyCustomColumn.vue';
import { theDialogs } from 'src/dialogs';

const props = defineProps<{
  summit: ISummit;
}>();

const $q = useQuasar();
const summitStore = useSummitStore();
const columns = ref(sponsorsColumns);
const activeSummit = ref<ISummit>(props.summit);
const sponsors = ref<ISponsor[]>([]);
const search = ref('');

onMounted(async () => {
  streamSponsors();
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
const filteredRecords = computed(() => {
  if (search.value) {
    return sponsors.value.filter((r) =>
      new RegExp(search.value, 'i').test(r.name + ':' + r.summit + ':' + r.key)
    );
  }
  return sponsors.value;
});

function streamSponsors() {
  sub = summitStore.streamSponsors(activeSummit.value.key).subscribe({
    next(list) {
      sponsors.value = list;
    },
  });
}
function onToggleStatus(value: ISummit) {
  const msg = !value.status
    ? 'Activate this sponsors'
    : 'Deactivate this sponsors';
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
      await summitStore.updateSponsorProp(value.key, 'status', !value.status);
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    });
}
function onAddSponsor() {
  theDialogs.emit({
    type: 'addSponsor',
    arg: {
      payload: activeSummit.value,
      done(sponsor) {
        $q.notify({
          message: `${sponsor.name} is registered as new Sponsor`,
          color: 'positive',
          icon: 'info',
        });
      },
    },
  });
}
function onEditSponsor(sponsor: ISponsor) {
  sponsor;
  theDialogs.emit({
    type: 'editSponsor',
    arg: {
      payload: sponsor,
      done(result) {
        $q.notify({
          message: `Sponsor ${result.name} is updated`,
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
