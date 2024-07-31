<template>
  <q-td class="bg-primary" auto-width>
    <div class="q-gutter-x-xs">
      <template v-for="(elem, idx) in actions" :key="idx">
        <q-btn
          :color="elem.color"
          :icon="elem.icon"
          :disable="elem.disable"
          :loading="elem.loading"
          size="12px"
          round
          dense
          @click="elem.cb && elem.cb(row)"
        >
          <q-tooltip>{{ elem.toolTip || elem.label }}</q-tooltip>
        </q-btn>
      </template>
    </div>
  </q-td>
</template>
<script setup lang="ts" generic="E, U extends IBaseEntity">
import { IPropsTableElements } from '../table.interface';
import { IBaseEntity } from 'src/entities/base.entity';
defineProps<IPropsTableElements<E, U>>();
defineEmits<{
  (event: E, payload?: U): void;
}>();
</script>
