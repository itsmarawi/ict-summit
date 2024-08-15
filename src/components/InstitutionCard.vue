<template>
  <div style="width: 200px">
    <q-card
      class="bg-white q-pt-xl full-width column"
      :class="bg ? 'bg-' + bg : ''"
      style="height: 250px"
      :style="bg ? 'background-color:' + bg : ''"
    >
      <q-btn class="q-pa-md" color="dark" :href="website" flat dense
        ><q-img :src="logo" />
        <q-tooltip v-if="name">{{ name }}</q-tooltip>
      </q-btn>

      <q-icon
        name="info"
        color="grey"
        size="sm"
        class="q-mb-sm q-mr-sm cursor-pointer absolute-bottom-right"
        @click="showDialog = true"
      >
      </q-icon>
    </q-card>
    <slot></slot>
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 300px">
        <q-toolbar
          ><q-space /> <q-btn icon="close" dense round flat v-close-popup />
        </q-toolbar>
        <q-card-section class="text-center bg-white">
          <div>
            <q-btn class="q-pa-md" color="dark" :href="website" flat dense
              ><q-img width="100px" :src="logo" />
              <q-tooltip v-if="name">{{ name }}</q-tooltip>
            </q-btn>
          </div>
          <div class="text-dark">{{ website }}</div>
          <div class="text-h4">
            <q-chip>{{ name }}</q-chip>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-bold">About:</div>
          <q-card class="bg-black q-pa-sm" flat>
            <p v-for="(p, i) in (description || '&nbsp;').split('\n')" :key="i">
              {{ p }}
            </p>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const showDialog = ref(false);
defineProps<{
  logo: string;
  name?: string;
  website?: string;
  bg?: string;
  description?: string;
}>();
</script>
