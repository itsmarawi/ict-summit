<template>
  <q-page class="q-mt-md">
    <RaffleDrawTable />
    <AddRaffleDrawDialog />
    <CloneRaffleParticipantsDialog />
  </q-page>
</template>
<script setup lang="ts">
import AddRaffleDrawDialog from './ui-components/dialogs/components/AddRaffleDrawDialog.vue';
import CloneRaffleParticipantsDialog from './ui-components/dialogs/components/CloneRaffleParticipantsDialog.vue';
import RaffleDrawTable from './ui-components/table/RaffleDrawTable.vue';
</script>
