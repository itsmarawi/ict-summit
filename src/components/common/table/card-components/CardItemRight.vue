<template>
  <q-btn size="12px" flat dense round icon="more_vert">
    <q-menu class="bg-primary text-white">
      <q-list
        dense
        style="min-width: 30vw"
        v-for="(elem, idx) in actions"
        :key="idx"
        bordered
        separator
        dark
      >
        <q-item
          :disable="elem.disable"
          clickable
          v-close-popup
          @click="elem.cb && elem.cb(row)"
        >
          <q-item-section avatar><q-icon :name="elem.icon" /></q-item-section>
          <q-item-section>{{ elem.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script setup lang="ts" generic="E, U extends IBaseEntity">
import { IPropsTableElements } from '../table.interface';
import { IBaseEntity } from 'src/entities/base.entity';

defineProps<IPropsTableElements<E, U>>();
defineEmits<{
  (event: E, payload?: U): void;
}>();
</script>
