<template>
  <BaseTable row-key="name" :columns="columns" :rows="filteredPrices" flat>
    <!-- Table -->
    <template #tableTop>
      <TableTop
        @onSearch="onSearchRecords"
        @onAddSpeaker="onAddSpeaker"
        :elements="[
          {
            event: 'onAddSpeaker',
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
        :elements="propsSpeakerTableActionRight"
        @onEditSpeaker="onEditSpeaker(props.row)"
      />
    </template>
    <!-- Table -->
    <!-- Card -->
    <template #cardItemRight="{ props }">
      <CardItemRight
        :elements="propsSpeakerTableActionRight"
        @onEditSpeaker="onEditSpeaker(props.row)"
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
import { ISpeaker, ISummit } from 'src/entities';
import BaseTable from 'src/components/base/BaseTable.vue';
import { speakerColumns } from './table.columns';
import { Subscription } from 'rxjs';
import TableTop from './table-components/TableTop.vue';
import TableBodyRight from './table-components/TableBodyRight.vue';
import CardItemRight from './card-components/CardItemRight.vue';
import { useSummitStore } from 'src/stores/summit-store';
import { propsSpeakerTableActionRight } from './table.elements';
import CardItemCustomSection from './card-components/CardItemCustomSection.vue';
import { useQuasar } from 'quasar';
import TableBodyCustomColumn from 'src/pages/account/ui-components/table/table-components/TableBodyCustomColumn.vue';
import { theDialogs } from 'src/dialogs';

const props = defineProps<{
  summit: ISummit;
}>();

const $q = useQuasar();
const summitStore = useSummitStore();
const columns = ref(speakerColumns);
const activeSummit = ref<ISummit>(props.summit);
const speakers = ref<ISpeaker[]>([]);
const search = ref('');

onMounted(async () => {
  streamSpeakers();
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
    return speakers.value.filter((r) =>
      new RegExp(search.value, 'i').test(
        r.fullname +
          ':' +
          r.position +
          ':' +
          r.expertise +
          ':' +
          r.institution +
          ':' +
          r.key
      )
    );
  }
  return speakers.value;
});

function streamSpeakers() {
  sub = summitStore.streamSpeakers(activeSummit.value.key).subscribe({
    next(list) {
      speakers.value = list;
    },
  });
}
function onToggleStatus(value: ISummit) {
  const msg = !value.status
    ? 'Activate this speaker'
    : 'Deactivate this speaker';
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
      await summitStore.updateSpeakerProp(value.key, 'status', !value.status);
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    });
}
function onAddSpeaker() {
  theDialogs.emit({
    type: 'addSpeaker',
    arg: {
      payload: activeSummit.value,
      done(speaker) {
        $q.notify({
          message: `${speaker.fullname} is registered as speaker`,
          color: 'positive',
          icon: 'info',
        });
      },
    },
  });
}
function onEditSpeaker(speaker: ISpeaker) {
  speaker;
  theDialogs.emit({
    type: 'editSpeaker',
    arg: {
      payload: speaker,
      done(result) {
        $q.notify({
          message: `Speaker ${result.fullname} is updated`,
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
