<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';
import { theWorkflows } from './workflows/the.workflows';

defineOptions({
  name: 'App',
});
const $q = useQuasar();
$q.dark.set(true);
onMounted(async () => {
  await import('src/workflows');
  theWorkflows.ready(true);
});
</script>
