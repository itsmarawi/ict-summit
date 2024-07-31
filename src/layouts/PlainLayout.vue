<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <ForgotPasswordDialogMobile v-if="$q.screen.lt.md" />
      <ForgotPasswordDialogDesktop v-else />
      <RegisterInstitutionDialog />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ForgotPasswordDialogDesktop from 'src/dialogs/auth/components/ForgotPasswordDialogDesktop.vue';
import ForgotPasswordDialogMobile from 'src/dialogs/auth/components/ForgotPasswordDialogMobile.vue';
import RegisterInstitutionDialog from 'src/dialogs/registration/components/RegisterInstitutionDialog.vue';
</script>
