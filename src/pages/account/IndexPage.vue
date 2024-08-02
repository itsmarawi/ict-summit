<template>
  <q-page class="q-mt-md">
    <AccountTable />
    <AccountRoleDialog />
  </q-page>
</template>
<script setup lang="ts">
import AccountRoleDialog from 'src/pages/account/ui-components/dialog/components/AccountRoleDialog.vue';
import AccountTable from 'src/pages/account/ui-components/table/AccountTable.vue';
</script>
