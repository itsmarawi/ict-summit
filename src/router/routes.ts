import { RouteRecordRaw } from 'vue-router';
import { IRouteMeta } from './route.meta';
import PlainLayout from 'layouts/PlainLayout.vue';
import SignUpRevalidation from 'src/pages/auth/SignUpRevalidation.vue';
import EmailVerification from 'src/pages/auth/EmailVerificationPage.vue';
import AuthIndexPage from 'src/pages/auth/IndexPage.vue';

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
    ],
  },
  {
    path: '/',
    component: () => Promise.resolve(PlainLayout),
    children: [
      {
        path: 'sign-code',
        name: 'sign-code',
        component: () => Promise.resolve(SignUpRevalidation),
        meta: {
          requiresLogin: true,
        },
      },
      {
        path: 'verify',
        name: 'verify',
        component: () => Promise.resolve(EmailVerification),
        meta: {
          requiresLogin: true,
        },
      },
      {
        path: ':action(login|signup)',
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
