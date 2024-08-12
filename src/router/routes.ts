import { RouteRecordRaw } from 'vue-router';
import { IRouteMeta } from './route.meta';
import PlainLayout from 'layouts/PlainLayout.vue';
import EmailVerification from 'src/pages/auth/EmailVerificationPage.vue';
import AuthIndexPage from 'src/pages/auth/IndexPage.vue';
import ScannerIndexPage from 'src/pages/scanner/IndexPage.vue';

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {
    description?: string;
    keywords?: string[];
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('pages/account/IndexPage.vue'),
        meta: {
          requires: ['admin', 'moderator'],
        },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/dashboard/DashboardPage.vue'),
        meta: {
          requires: ['admin', 'moderator'],
        },
      },
      {
        path: 'draws',
        name: 'draws',
        component: () => import('pages/raffle/IndexPage.vue'),
        meta: {
          requires: ['admin', 'moderator'],
        },
      },
      {
        path: 'raffle/:draw',
        name: 'raffle',
        component: () => import('pages/raffle/RafflePage.vue'),
        meta: {
          requiresLogin: true,
        },
      },
      {
        path: 'prices/:draw?',
        name: 'prices',
        component: () => import('pages/raffle/PricesPage.vue'),
        meta: {
          requiresLogin: true,
        },
      },
      {
        path: 'summit-management/:summit/:tab',
        name: 'summit-mgt',
        component: () => import('pages/summit/SummitPage.vue'),
        meta: {
          requires: ['admin', 'moderator'],
        },
      },
      {
        path: 'summit/:summit?',
        name: 'summit',
        component: () => import('pages/summit/IndexPage.vue'),
        meta: {
          requires: ['admin'],
        },
      },
      {
        path: 'scanner',
        name: 'scanner',
        component: () => Promise.resolve(ScannerIndexPage),
        meta: {
          requiresLogin: true,
        },
      },
    ],
  },
  {
    path: '/',
    component: () => Promise.resolve(PlainLayout),
    children: [
      {
        path: 'verify',
        name: 'verify',
        component: () => Promise.resolve(EmailVerification),
        meta: {
          requiresLogin: true,
        },
      },
      {
        path: ':action(login|signup|register)',
        name: 'start',
        component: () => Promise.resolve(AuthIndexPage),
        meta: {
          requiresGuest: true,
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
