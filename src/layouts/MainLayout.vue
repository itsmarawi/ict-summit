<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-space />

        <q-btn
          flat
          round
          icon="ion-logo-youtube"
          href="https://www.youtube.com/@RanaoICTSummit"
        />
        <q-btn
          flat
          round
          icon="ion-logo-facebook"
          href="https://www.facebook.com/ranaoictsummit"
        />
        <q-btn
          flat
          round
          icon="ion-logo-github"
          href="https://github.com/itsmarawi/ranao-ict-summit"
        />
        <q-space />
        <q-separator vertical inset />
        <q-btn color="secondary">Register</q-btn>
        <q-btn>Topics</q-btn>
        <q-btn>Speakers</q-btn>
        <q-btn>Sponsors</q-btn>
        <q-space />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'MainLayout',
});
</script>
