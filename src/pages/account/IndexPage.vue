<template>
  <q-page class="q-mt-md">
    <AccountTable />
    <AccountRoleDialog />
    <GenerateUniqueRoleCouponDialog />
  </q-page>
</template>
<script setup lang="ts">
import AccountRoleDialog from 'src/pages/account/ui-components/dialog/components/AccountRoleDialog.vue';
import AccountTable from 'src/pages/account/ui-components/table/AccountTable.vue';
import GenerateUniqueRoleCouponDialog from './ui-components/dialog/components/GenerateUniqueRoleCouponDialog.vue';
</script>
