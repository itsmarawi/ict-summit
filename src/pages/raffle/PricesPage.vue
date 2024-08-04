<template>
  <q-page class="q-mt-md">
    <RafflePricesTable />
    <ViewRafflePriceQrDialog />
  </q-page>
</template>
<script setup lang="ts">
import ViewRafflePriceQrDialog from './ui-components/dialogs/components/ViewRafflePriceQrDialog.vue';
import RafflePricesTable from './ui-components/table/RafflePricesTable.vue';
</script>
