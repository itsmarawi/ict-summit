import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { FirebaseError } from 'firebase/app';
import { theWorkflows } from 'src/workflows/the.workflows';
import { useProfileStore } from 'src/stores/profile-store';

export default function () {
  const $router = useRouter();
  const $route = useRoute();
  const $q = useQuasar();
  const profileStore = useProfileStore();
  const persistent = ref(false);
  const isPwd = ref(true);
  const email = ref('');
  const password = ref('');
  const right = ref(false);
  const emailAdd = ref('');
  const isLoadingLogin = ref(false);
  const isLoadingGoogleLogin = ref(false);

  async function onLogin() {
    isLoadingLogin.value = true;
    theWorkflows.emit({
      type: 'login',
      arg: {
        method: 'username/password',
        username: email.value,
        password: password.value,
        done() {
          if (!profileStore.theUser?.emailVerified) {
            $router.replace({ name: 'verify' });
          } else if (
            $route.query?.redirect &&
            profileStore.theUser?.institution
          ) {
            $router.replace($route.query?.redirect as string);
          } else if (profileStore.theUser?.institution) {
            $router.replace({ name: 'home' });
          } else if (profileStore.theUser) {
            $router.replace({
              name: 'start',
              params: { action: 'register' },
              query: $route.query,
            });
          }
          isLoadingLogin.value = false;
        },
        error(error) {
          if (error instanceof FirebaseError) {
            switch (error.code) {
              case 'auth/wrong-password':
                $q.notify({
                  icon: 'error',
                  message: 'Wrong Password',
                  color: 'negative',
                });
                break;
              case 'auth/invalid-email':
                $q.notify({
                  icon: 'error',
                  message: 'Invalid Email',
                  color: 'negative',
                });
                break;
              case 'auth/invalid-login-credentials':
                $q.notify({
                  icon: 'error',
                  message: 'Invalid Login Credentials',
                  color: 'negative',
                });
                break;
              case 'auth/user-not-found':
                $q.notify({
                  message: 'User not found',
                  icon: 'error',
                  color: 'negative',
                });
                break;
              default:
            }
          } else {
            $q.notify({
              message: 'Sign-in failed:' + String(error),
              icon: 'error',
              color: 'negative',
            });
          }
          isLoadingLogin.value = false;
        },
      },
    });
  }

  async function onGoogleLogin() {
    isLoadingGoogleLogin.value = true;
    theWorkflows.emit({
      type: 'login',
      arg: {
        method: $q.platform.is.ios ? 'googleRedirect' : 'google',
        done() {
          if ($route.query?.redirect && profileStore.theUser?.institution) {
            $router.replace($route.query?.redirect as string);
          } else if (profileStore.theUser?.institution) {
            $router.replace({ name: 'home' });
          } else if (profileStore.theUser) {
            $router.replace({
              name: 'start',
              params: { action: 'register' },
              query: $route.query,
            });
          }
          isLoadingGoogleLogin.value = false;
        },
        error(error) {
          if (error instanceof FirebaseError) {
            switch (error.code) {
              case 'auth/cancelled-popup-request':
                $q.notify({
                  message: 'Sign-in Popup was cancelled',
                  icon: 'error',
                  color: 'negative',
                });
                break;
              case 'auth/popup-blocked':
                $q.notify({
                  message: 'Sign-in Popup was blocked',
                  icon: 'error',
                  color: 'negative',
                });
                break;
              default:
                $q.notify({
                  message: 'Sign-in failed',
                  icon: 'error',
                  color: 'negative',
                });
                break;
            }
          } else {
            $q.notify({
              message: 'Sign-in failed:' + String(error),
              icon: 'error',
              color: 'negative',
            });
          }
          isLoadingGoogleLogin.value = false;
        },
      },
    });
  }

  return {
    isPwd,
    email,
    emailAdd,
    password,
    right,
    persistent,
    isLoadingLogin,
    isLoadingGoogleLogin,
    onLogin,
    onGoogleLogin,
  };
}
