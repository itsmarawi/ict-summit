<template>
  <div style="width: 205px">
    <q-card class="bg-white q-pt-xl full-width" style="height: 250px">
      <q-card-section>
        <div class="absolute" style="right: 5px; top: -80px">
          <q-avatar size="90px" color="grey">
            <img :src="avatar" />
          </q-avatar>
        </div>
        <q-img :src="companyLogo" />
        <q-icon
          name="info"
          color="grey"
          size="sm"
          class="q-mb-sm q-mr-sm cursor-pointer absolute-bottom-right"
          @click="showDialog = true"
        >
        </q-icon>
      </q-card-section>
    </q-card>
    <div
      class="text-bold text-subtitle2 q-mt-md"
      style="border-left: 5px solid green; padding-left: 5px"
    >
      {{ fullName }}
    </div>
    <div class="text-bold q-pl-sm">{{ position }}</div>
    <div class="text-bold q-pl-sm">[ {{ expertise }} ]</div>
    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section>
          <div
            class="text-bold text-subtitle2 q-mt-md"
            style="border-left: 5px solid green; padding-left: 5px"
          >
            {{ fullName }}
          </div>
          <div class="text-bold q-pl-sm">{{ position }}</div>
          <div class="text-bold q-pl-sm">[ {{ expertise }} ]</div>
        </q-card-section>
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
  fullName: string;
  avatar: string;
  companyLogo: string;
  position: string;
  expertise: string;
  description?: string;
}>();
</script>
