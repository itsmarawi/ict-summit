<template>
  <div style="width: 200px">
    <q-card
      class="bg-white q-pt-xl full-width column"
      :class="bg ? 'bg-' + bg : ''"
      style="height: 250px"
      :style="bg ? 'background-color:' + bg : ''"
    >
      <q-btn color="dark" :href="website" flat dense
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
      <q-card>
        <q-card-section>
          <div class="text-bold">About:</div>
          <q-card class="bg-black" flat>
            <pre style="overflow: auto; word-wrap: normal">{{
              description || '&nbsp;'
            }}</pre>
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
