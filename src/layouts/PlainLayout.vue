<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <ForgotPasswordDialogMobile v-if="$q.screen.lt.md" />
      <ForgotPasswordDialogDesktop v-else />
      <RequireSignUpCodeDialog />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ForgotPasswordDialogDesktop from 'src/dialogs/auth/components/ForgotPasswordDialogDesktop.vue';
import ForgotPasswordDialogMobile from 'src/dialogs/auth/components/ForgotPasswordDialogMobile.vue';
import RequireSignUpCodeDialog from 'src/dialogs/auth/components/RequireSignUpCodeDialog.vue';
</script>
