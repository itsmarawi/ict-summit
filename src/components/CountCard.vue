<template>
  <q-card
    class="text-center q-pa-md"
    :class="color ? 'text-' + color : ''"
    flat
  >
    <div class="text-h3 text-bold">{{ count }}</div>
    <div class="text-h6">{{ description }}</div>
  </q-card>
</template>
<script lang="ts" setup>
defineProps<{
  count: string;
  description: string;
  color?: string;
}>();
</script>
