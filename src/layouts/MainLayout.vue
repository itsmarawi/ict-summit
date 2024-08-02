<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          icon="menu"
          v-if="profileStore.theUser?.institution"
          flat
          @click="drawer = !drawer"
        />
        <q-btn
          icon="home"
          dense
          v-if="$route.name !== 'home'"
          flat
          :to="{ name: 'home' }"
        />
        <q-space />

        <q-btn
          flat
          round
          icon="ion-logo-youtube"
          href="https://www.youtube.com/@RanaoICTSummit"
        />
        <q-btn
          flat
          round
          icon="ion-logo-facebook"
          href="https://www.facebook.com/ranaoictsummit"
        />
        <q-btn
          flat
          class="hidden"
          round
          icon="ion-logo-github"
          href="https://github.com/itsmarawi/ranao-ict-summit"
        />
        <q-space />
        <q-separator vertical inset />
        <q-btn
          flat
          v-if="!profileStore.theUser"
          color="positive"
          :to="{ name: 'start', params: { action: 'login' } }"
          :icon="'login'"
          :label="'Login'"
        ></q-btn>
        <q-btn
          flat
          v-else-if="!profileStore.theUser.institution"
          color="secondary"
          :icon="$q.screen.gt.sm ? '' : 'how_to_reg'"
          :label="$q.screen.gt.sm ? 'Register' : ''"
          :to="{ name: 'start', params: { action: 'register' } }"
        />
        <q-btn
          flat
          :to="{ name: 'home', hash: '#topics' }"
          :icon="$q.screen.gt.sm ? '' : 'topic'"
          :label="$q.screen.gt.sm ? 'Topics' : ''"
        />
        <q-btn
          flat
          :to="{ name: 'home', hash: '#speakers' }"
          :icon="$q.screen.gt.sm ? '' : 'mic'"
          :label="$q.screen.gt.sm ? 'Speakers' : ''"
        />
        <q-btn
          flat
          :to="{ name: 'home', hash: '#sponsors' }"
          :icon="$q.screen.gt.sm ? '' : 'volunteer_activism'"
          :label="$q.screen.gt.sm ? 'Sponsors' : ''"
        />
        <q-btn
          flat
          v-if="profileStore.theUser"
          color="dark"
          @click="onLogout"
          :icon="$q.screen.gt.sm ? '' : 'logout'"
          :label="$q.screen.gt.sm ? 'Logout' : ''"
        />
        <q-space />
      </q-toolbar>
    </q-header>
    <q-drawer
      v-if="profileStore.theUser?.institution"
      v-model="drawer"
      :width="200"
      :breakpoint="500"
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit">
        <DrawerItemList :menuList="menuList" />
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useProfileStore } from 'src/stores/profile-store';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DrawerItemList from './DrawerItemList.vue';
import { IDrawerItem } from './drawer.item';

defineOptions({
  name: 'MainLayout',
});

const profileStore = useProfileStore();
const $q = useQuasar();
const authStore = useAuthStore();
const $router = useRouter();
const drawer = ref(false);

const menuList = ref<IDrawerItem[]>([
  {
    icon: 'inbox',
    label: 'Accounts',
    route: { name: 'accounts' },
  },
  {
    label: 'Raffle',
    icon: 'widgets',
    children: [
      {
        icon: 'celebration',
        label: 'Draws',
        route: { name: 'draws' },
      },
      {
        icon: 'military_tech',
        label: 'Winners',
        route: { name: 'winners' },
      },
    ],
  },
]);
function onLogout() {
  $q.dialog({
    title: '<span class="text-primary">Logout</span>',
    message: 'Are you sure you want to Logout?',
    cancel: { outline: true, rounded: true },
    ok: { rounded: true, label: 'Proceed' },
    persistent: true,
    html: true,
  })
    .onOk(async () => {
      await authStore.logout();
      await $router.replace('/');
    })
    .onCancel(() => {
      //
    });
}
</script>
