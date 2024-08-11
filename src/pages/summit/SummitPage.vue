<template>
  <q-page>
    <q-toolbar>
      <q-toolbar-title></q-toolbar-title>
    </q-toolbar>
    <q-tabs v-model="activeTab">
      <q-route-tab
        :to="{ name: 'summit-mgt', params: { tab: 'speakers' } }"
        name="speakers"
        >Speakers</q-route-tab
      >
      <q-route-tab
        :to="{ name: 'summit-mgt', params: { tab: 'topics' } }"
        name="topics"
        >Topics</q-route-tab
      >
      <q-route-tab
        :to="{ name: 'summit-mgt', params: { tab: 'sponsors' } }"
        name="sponsors"
        >Sponsors</q-route-tab
      >
    </q-tabs>
    <q-tab-panels v-model="activeTab" v-if="activeSummit">
      <q-tab-panel name="speakers">
        <SpeakersTable :summit="activeSummit" />
      </q-tab-panel>
      <q-tab-panel name="topics">
        <TopicsTable :summit="activeSummit" />
      </q-tab-panel>
      <q-tab-panel name="sponsors">
        <SponsorsTable :summit="activeSummit" />
      </q-tab-panel>
    </q-tab-panels>
    <HandleSpeakerDialog />
    <HandleTopicDialog />
    <HandleSponsorDialog />
  </q-page>
</template>
<script lang="ts" setup>
import { ISummit } from 'src/entities';
import { useSummitStore } from 'src/stores/summit-store';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SpeakersTable from './ui-components/table/SpeakersTable.vue';
import HandleSpeakerDialog from './ui-components/dialogs/components/HandleSpeakerDialog.vue';
import TopicsTable from './ui-components/table/TopicsTable.vue';
import HandleTopicDialog from './ui-components/dialogs/components/HandleTopicDialog.vue';
import HandleSponsorDialog from './ui-components/dialogs/components/HandleSponsorDialog.vue';
import SponsorsTable from './ui-components/table/SponsorsTable.vue';
const summitStore = useSummitStore();
const $route = useRoute();
const activeSummit = ref<ISummit>();
const activeTab = ref('speakers');
onMounted(async () => {
  activeSummit.value = await summitStore.getSummit(
    new Date().getFullYear().toString()
  );
  if (typeof $route.params.tab == 'string') {
    activeTab.value = $route.params.tab;
  }
});
</script>
