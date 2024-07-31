<template>
  <q-page :class="$q.screen.lt.md ? '' : '__background flex flex-center'">
    <q-tab-panels
      v-model="tab"
      animated
      :style="$q.screen.lt.md ? '' : 'min-width: 80em; border-radius: 8px;'"
    >
      <q-tab-panel name="login">
        <LoginComponentMobile
          v-if="$q.screen.lt.md"
          @routeToTab="routeToTab"
        ></LoginComponentMobile>
        <LoginComponentDesktop
          v-else
          @routeToTab="routeToTab"
          @onForgetPassword="onForgetPassword"
        ></LoginComponentDesktop>
      </q-tab-panel>

      <q-tab-panel name="signup">
        <SignupComponentMobile
          v-if="$q.screen.lt.md"
          @routeToTab="routeToTab"
        ></SignupComponentMobile>
        <SignupComponentDesktop
          v-else
          @routeToTab="routeToTab"
        ></SignupComponentDesktop>
      </q-tab-panel>
      <q-tab-panel name="register">
        <RegisterComponentDesktop
          @routeToTab="routeToTab"
        ></RegisterComponentDesktop>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoginComponentDesktop from 'src/pages/auth/desktop/LoginComponentDesktop.vue';
import LoginComponentMobile from 'src/pages/auth/mobile/LoginComponentMobile.vue';
import SignupComponentDesktop from 'src/pages/auth/desktop/SignupComponentDesktop.vue';
import SignupComponentMobile from 'src/pages/auth/mobile/SignupComponentMobile.vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import RegisterComponentDesktop from './desktop/RegisterComponentDesktop.vue';

const tab = ref('login');
const persistent = ref(false);
const $route = useRoute();
const updateRoute = () => {
  setTimeout(() => {
    tab.value = ($route.params.action as string) || 'login';
  }, 0);
};
onMounted(updateRoute);

onBeforeRouteUpdate(updateRoute);

function routeToTab(val: string) {
  tab.value = val;
}

function onForgetPassword(val: boolean) {
  persistent.value = val;
}
</script>
<style scoped>
.q-tab-panel {
  padding: 0 !important;
}
</style>
