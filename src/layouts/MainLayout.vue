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
          round
          icon="ion-logo-github"
          href="https://github.com/itsmarawi/ranao-ict-summit"
        />
        <q-space />
        <q-separator vertical inset />
        <q-btn
          flat
          v-if="!profileStore.theUser"
          color="secondary"
          :to="{ name: 'start', params: { action: 'login' } }"
          >Login</q-btn
        >
        <q-btn
          flat
          v-else-if="!profileStore.theUser.institution"
          color="secondary"
          :to="{ name: 'start', params: { action: 'register' } }"
          >Register</q-btn
        >
        <q-btn flat :to="{ name: 'home', hash: '#topics' }">Topics</q-btn>
        <q-btn flat :to="{ name: 'home', hash: '#speakers' }">Speakers</q-btn>
        <q-btn flat :to="{ name: 'home', hash: '#sponsors' }">Sponsors</q-btn>
        <q-btn
          flat
          v-if="profileStore.theUser"
          color="secondary"
          @click="onLogout"
          >Logout</q-btn
        >
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
        <q-list>
          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item clickable :active="menuItem.label === 'Outbox'" v-ripple>
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
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

defineOptions({
  name: 'MainLayout',
});

const profileStore = useProfileStore();
const $q = useQuasar();
const authStore = useAuthStore();
const $router = useRouter();
const drawer = ref(false);
const menuList = ref([
  {
    icon: 'inbox',
    label: 'Inbox',
    separator: true,
  },
  {
    icon: 'send',
    label: 'Outbox',
    separator: false,
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
