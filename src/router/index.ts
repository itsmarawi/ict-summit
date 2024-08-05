import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

import { useProfileStore } from 'src/stores/profile-store';
export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;
  const profileStore = useProfileStore();
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });
  Router.beforeEach(async (to, from, next) => {
    const requiresUserRole = to.matched.some(
      (route) => !!route.meta.requires?.length
    );

    const requiresLogin =
      requiresUserRole || to.matched.some((route) => route.meta.requiresLogin);

    const requiresGuest = to.matched.some(
      (route) => !!route.meta.requiresGuest
    );
    await new Promise<void>(async (resolve) => {
      if (!profileStore.theUser) {
        await profileStore.authenticate(() => {
          if (requiresLogin && !profileStore.theUser) {
            Router.replace({
              name: 'start',
              params: { action: 'login' },
              query: { redirect: to.fullPath },
            });
          }
        });
      }
      resolve();
    });

    function isRoleAuthorized(role?: string) {
      if (!role) return false;
      return to.matched.some(
        (route) =>
          role &&
          route.meta.requires &&
          (route.meta.requires?.includes(role) ||
            (route.meta.requires?.includes('member') &&
              ['moderator'].includes(role)))
      );
    }
    const user = await profileStore.getUserAsync(true);

    const emailVerified = user?.emailVerified;
    if (!user && requiresLogin) {
      next({
        name: 'start',
        params: { action: 'login' },
        query: { redirect: to.fullPath },
      });
      return;
    } else if (requiresLogin && !emailVerified && to.name != 'verify') {
      next({
        name: 'verify',
        query: { redirect: to.fullPath },
      });
      return;
    } else if (
      requiresGuest &&
      to.name == 'start' &&
      user &&
      !user?.institution
    ) {
      if (to.params.action == 'register') {
        next();
      } else {
        next({
          name: 'start',
          params: { action: 'register' },
        });
      }
      return;
    } else if (
      requiresUserRole &&
      user &&
      (requiresGuest || !isRoleAuthorized(user.role))
    ) {
      next({
        name: 'home',
      });
      return;
    }
    next();
  });

  return Router;
});
