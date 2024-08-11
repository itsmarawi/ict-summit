<template>
  <div>
    <q-card class="bg-brown q-pt-xl full-width">
      <q-card-section>
        <q-chip
          dense
          color="secondary"
          style="width: 200px; height: 10px; margin-top: -40px"
        >
          <div class="absolute text-h6 text-bold" style="top: -20px" dense>
            {{ date.formatDate(schedule, 'MMM DD') }}
          </div>
        </q-chip>
      </q-card-section>
      <q-card-section>
        <slot></slot>
      </q-card-section>
    </q-card>
  </div>
</template>
<script lang="ts" setup>
import { date } from 'quasar';

defineProps<{
  schedule: string;
}>();
</script>
