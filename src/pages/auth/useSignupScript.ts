import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { FirebaseError } from 'firebase/app';
import { IAuth, useAuthStore } from 'src/stores/auth-store';
import { useProfileStore } from 'src/stores/profile-store';

export default function () {
  const router = useRouter();
  const authStore = useAuthStore();
  const profileStore = useProfileStore();
  const $q = useQuasar();
  onMounted(() => {
    if (!profileStore.theUser) {
      router.replace({ name: 'start', params: { action: 'signup' } });
    }
  });

  const email = ref('');
  const username = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const agreed = ref(false);
  const showTerms = ref(false);
  const isViewPassword = ref(true);
  const isViewPassword1 = ref(true);
  const disabledSubmit = ref(true);
  const terms = ref(true);
  const signingUp = ref(false);

  async function onSignup() {
    const payload: IAuth = {
      email: email.value,
      password: password.value,
      name: username.value,
      avatar: '',
    };
    try {
      signingUp.value = true;
      await authStore.signup(payload, '');
      await router.replace({ name: 'start', params: { action: 'register' } });
    } catch (error) {
      if (error == 'synching timeout') {
        $q.notify({
          icon: 'error',
          color: 'negative',
          message: 'Failed to sync profile with the institution',
        });
      } else if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            $q.notify({
              icon: 'error',
              message: 'Email is already in use',
              color: 'negative',
            });
            break;
          case 'auth/invalid-email':
            $q.notify({
              message: 'Invalid Email',
              icon: 'error',
              color: 'negative',
            });
            break;
          case 'auth/weak-password':
            $q.notify({
              message: 'Week password',
              icon: 'error',
              color: 'negative',
            });
            break;
          default:
            $q.notify({
              icon: 'error',
              color: 'negative',
              message: 'Opeation is not allowed',
              caption: String(error),
            });
        }
      } else {
        $q.notify({
          icon: 'error',
          color: 'negative',
          message: String(error),
        });
      }
      await authStore.logout();
      await router.replace('/');
    }
    signingUp.value = false;
  }

  function toggleSubmit() {
    if (terms.value === false) {
      disabledSubmit.value = !disabledSubmit.value;
    }
  }

  return {
    agreed,
    showTerms,
    terms,
    disabledSubmit,
    email,
    username,
    password,

    confirmPassword,
    isViewPassword,
    isViewPassword1,
    toggleSubmit,
    signingUp,
    onSignup,
  };
}
