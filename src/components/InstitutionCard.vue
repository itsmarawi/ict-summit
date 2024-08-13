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
        <q-tooltip v-if="name">{{ name }}</q-tooltip>
      </q-card-section>
    </q-card>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  logo: string;
  name?: string;
  bg?: string;
}>();
</script>
