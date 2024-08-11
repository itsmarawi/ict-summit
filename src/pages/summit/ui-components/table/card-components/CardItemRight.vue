<template>
  <q-btn size="12px" flat dense round icon="more_vert">
    <q-menu class="bg-primary text-white">
      <q-list
        dense
        style="min-width: 30vw"
        v-for="(elem, idx) in elements"
        :key="idx"
        bordered
        separator
        dark
      >
        <q-item
          :disable="elem.disable"
          clickable
          v-close-popup
          @click="$emit(elem.event)"
        >
          <q-item-section>{{ elem.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script setup lang="ts" generic="T">
import { IPropsTableElements } from '../table.interface';

defineProps<IPropsTableElements<T>>();
defineEmits<{
  (event: T): void;
}>();
</script>
