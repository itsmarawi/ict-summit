<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="print-hide">
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
        <q-space v-if="!$q.screen.xs" />

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
        <q-space v-if="!$q.screen.xs" />
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
          :flat="!$q.screen.xs"
          v-else-if="!profileStore.theUser.institution"
          color="dark"
          :style="$q.screen.xs ? 'top: 50px; right: 5px; width: 150px' : ''"
          :class="$q.screen.xs ? 'fixed-top-right' : ''"
          :icon="$q.screen.gt.sm && !$q.screen.lg ? '' : 'how_to_reg'"
          :label="
            $q.screen.gt.sm || $q.screen.xs || $q.screen.xl ? 'Register' : ''
          "
          :to="{ name: 'start', params: { action: 'register' } }"
        />
        <template v-if="!$q.screen.xs">
          <q-btn
            flat
            :to="{ name: 'home', hash: '#topics' }"
            :icon="$q.screen.gt.sm && !$q.screen.lg ? '' : 'topic'"
            :label="$q.screen.gt.sm ? 'Topics' : ''"
          />
          <q-btn
            flat
            :to="{ name: 'home', hash: '#speakers' }"
            :icon="$q.screen.gt.sm && !$q.screen.lg ? '' : 'record_voice_over'"
            :label="$q.screen.gt.sm ? 'Speakers' : ''"
          />
          <q-btn
            flat
            :to="{ name: 'home', hash: '#sponsors' }"
            :icon="$q.screen.gt.sm && !$q.screen.lg ? '' : 'volunteer_activism'"
            :label="$q.screen.gt.sm ? 'Sponsors' : ''"
          />
        </template>
        <q-btn
          flat
          v-if="profileStore.theUser"
          color="dark"
          @click="onLogout"
          :icon="$q.screen.gt.sm && !$q.screen.lg ? '' : 'logout'"
          :label="$q.screen.gt.sm ? 'Logout' : ''"
        />
        <q-space v-if="!$q.screen.xs" />
      </q-toolbar>
    </q-header>
    <q-drawer
      v-if="profileStore.theUser?.institution"
      v-model="drawer"
      class="print-hide"
      :width="200"
      :breakpoint="500"
      bordered
      overlay
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit">
        <DrawerItemList
          :menuList="menuList"
          :role="profileStore.theUser?.role"
        />
        <q-item
          clickable
          v-if="profileStore.theUser"
          flat
          v-close-popup
          @click="onLogout"
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
      <SelectImageDialog />
    </q-page-container>
    <q-footer elevated>
      <q-btn
        class="fixed bg-dark"
        :class="$route.name != 'home' ? 'hidden' : ''"
        color="primary"
        :to="{ name: 'scanner' }"
        size="lg"
        style="
          bottom: 0px;
          margin-left: 50%;
          left: -30px;
          width: 60px;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        "
        icon="qr_code_scanner"
        flat
      />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useProfileStore } from 'src/stores/profile-store';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DrawerItemList from './DrawerItemList.vue';
import { IDrawerItem } from './drawer.item';
import SelectImageDialog from 'src/dialogs/shared/components/SelectImageDialog.vue';
import { useSummitStore } from 'src/stores/summit-store';
import { Subscription } from 'rxjs';
import { ISummit } from 'src/entities';

defineOptions({
  name: 'MainLayout',
});

const profileStore = useProfileStore();
const $q = useQuasar();
const authStore = useAuthStore();
const $router = useRouter();
const summitStore = useSummitStore();
const drawer = ref(false);
const summitList = ref<ISummit[]>();
const canModerate = computed(() => {
  return /^(admin|moderator)$/i.test(profileStore.theUser?.role || '');
});
let sub: Subscription;

const menuList = ref<IDrawerItem[]>([]);
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
onMounted(async () => {
  if (canModerate.value) {
    sub = summitStore.streamSummits().subscribe({
      next(value) {
        summitList.value = value;
        menuList.value = [
          {
            icon: 'home',
            label: 'Home',
            route: { name: 'home' },
          },
          {
            icon: 'person',
            label: 'Registration',
            route: { name: 'start', params: { action: 'register' } },
          },
          {
            icon: 'inbox',
            label: 'Accounts',
            route: { name: 'accounts' },
            requires: ['admin'],
          },
          {
            icon: 'ion-analytics',
            label: 'Dashboard',
            route: { name: 'dashboard' },
            requires: ['admin', 'moderator'],
          },
          {
            icon: 'inbox',
            label: 'Summit Management',
            route: { name: 'summit' },
            requires: ['admin', 'moderator'],
          },
          ...value.map((summit) => ({
            label: summit.name,
            icon: 'settings_applications',
            requires: ['admin', 'moderator'],
            route: {
              name: 'summit-mgt',
              params: { summit: summit.key, tab: 'speakers' },
            },
          })),
          {
            label: 'Raffle',
            icon: 'widgets',
            children: [
              {
                icon: 'celebration',
                label: 'Draws',
                route: { name: 'draws' },
                requires: ['admin', 'moderator'],
              },
              {
                icon: 'military_tech',
                label: 'Prices',
                route: { name: 'prices' },
              },
            ],
          },
          {
            icon: 'qr_code_scanner',
            label: 'Scanner',
            route: { name: 'scanner' },
          },
        ];
      },
    });
  } else {
    menuList.value = [
      {
        icon: 'inbox',
        label: 'Accounts',
        route: { name: 'accounts' },
        requires: ['admin'],
      },
      {
        icon: 'ion-analytics',
        label: 'Dashboard',
        route: { name: 'dashboard' },
        requires: ['admin', 'moderator'],
      },
      {
        icon: 'inbox',
        label: 'Summit Management',
        route: { name: 'summit' },
        requires: ['admin'],
      },
      {
        label: 'Raffle',
        icon: 'widgets',
        children: [
          {
            icon: 'celebration',
            label: 'Draws',
            route: { name: 'draws' },
            requires: ['admin', 'moderator'],
          },
          {
            icon: 'military_tech',
            label: 'Prices',
            route: { name: 'prices' },
          },
        ],
      },
      {
        icon: 'qr_code_scanner',
        label: 'Scanner',
        route: { name: 'scanner' },
      },
    ];
  }
});
onUnmounted(() => {
  sub?.unsubscribe();
});
</script>
