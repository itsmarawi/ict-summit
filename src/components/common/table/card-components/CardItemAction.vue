<template>
  <div class="row justify-end q-gutter-x-sm">
    <q-btn
      v-for="(elem, idx) in actions"
      :key="idx"
      :disable="elem.disable"
      :icon="elem.icon"
      :color="elem.color || 'primary'"
      size="13px"
      dense
      round
      @click="emit(elem.event, row)"
    >
    </q-btn>
  </div>
</template>
<script setup lang="ts" generic="E, U extends IBaseEntity">
import { IPropsTableElements } from '../table.interface';
import { IBaseEntity } from 'src/entities/base.entity';

defineProps<IPropsTableElements<E, U>>();
const emit = defineEmits<{
  (event: E, payload?: U): void;
}>();
</script>
