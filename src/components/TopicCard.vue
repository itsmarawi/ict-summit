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
            {{ date.formatDate(schedule, 'MMM DD hh:mm A') }}
            [
            <span v-if="(duration || 0) >= 60">
              {{ Math.round((duration || 0) / 60) }} hr &nbsp;
            </span>
            <span v-if="(duration || 0) % 60 || !duration">
              {{ (duration || 0) % 60 }} min
            </span>
            ]
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
  duration?: number;
}>();
</script>
