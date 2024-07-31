<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

defineOptions({
  name: 'App',
});
const $q = useQuasar();
$q.dark.set(true);
</script>
