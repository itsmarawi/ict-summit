<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-space />

        <q-btn flat round icon="ion-logo-youtube" />
        <q-btn flat round icon="facebook" />
        <q-btn flat round icon="ion-logo-github" />
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
