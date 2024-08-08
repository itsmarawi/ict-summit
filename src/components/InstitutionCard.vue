<template>
  <div style="width: 200px">
    <q-card
      class="bg-white q-pt-xl full-width column"
      :class="bg ? 'bg-' + bg : ''"
      style="height: 250px"
      :style="bg ? 'background-color:' + bg : ''"
    >
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
  bg?: string;
}>();
</script>
