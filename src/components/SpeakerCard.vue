<template>
  <div style="width: 200px">
    <q-card class="bg-white q-pt-xl full-width">
      <q-card-section>
        <div class="absolute" style="right: 5px; top: -80px">
          <q-avatar size="90px" color="grey">
            <img :src="avatar" />
          </q-avatar>
        </div>
        <q-img :src="companyLogo" />
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
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  fullName: string;
  avatar: string;
  companyLogo: string;
  position: string;
  expertise: string;
}>();
</script>
