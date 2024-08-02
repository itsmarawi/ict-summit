<template>
  <q-page class="q-mt-md">
    <RaffleDrawTable />
    <AddRaffleDrawDialog />
  </q-page>
</template>
<script setup lang="ts">
import AddRaffleDrawDialog from './ui-components/dialogs/components/AddRaffleDrawDialog.vue';
import RaffleDrawTable from './ui-components/table/RaffleDrawTable.vue';
</script>
