<template>
  <q-page>
    <SummitsTable />
    <EditSummitDialog />
  </q-page>
</template>
<script lang="ts" setup>
import EditSummitDialog from './ui-components/dialogs/components/EditSummitDialog.vue';
import SummitsTable from './ui-components/table/SummitsTable.vue';
</script>
