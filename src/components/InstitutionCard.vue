<template>
  <div style="width: 200px">
    <q-card class="bg-white q-pt-xl full-width column" style="height: 250px">
      <q-card-section class="q-py-none">
        <q-img :src="logo" />
      </q-card-section>
    </q-card>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  logo: string;
}>();
</script>
