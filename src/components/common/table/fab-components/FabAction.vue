<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-fab
      icon="more_vert"
      direction="up"
      color="secondary"
      external-label
      label-position="left"
      label="Actions"
    >
      <template v-for="(elem) in actions" :key="elem.event">
        <q-fab-action
          v-if="elem.isShowBtn"
          :color="elem.color"
          :icon="elem.icon"
          :label="elem.toolTip || elem.label"
          :disable="elem.disable"
          label-position="left"
          external-label
          @click="elem.cb && elem.cb()"
        >
        </q-fab-action>
      </template>
    </q-fab>
  </q-page-sticky>
</template>
<script setup lang="ts" generic="E extends string">
import { IPropsTableElements } from '../table.interface';

defineProps<IPropsTableElements<E>>();
defineEmits<{
  (event: E): void;
}>();
</script>
