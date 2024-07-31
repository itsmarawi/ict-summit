import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { Profiler } from 'src/utils/profiler';
import { FirebaseError } from 'firebase/app';
import { IAuth, useAuthStore } from 'src/stores/auth-store';

export default function () {
  const router = useRouter();
  const authStore = useAuthStore();
  const $q = useQuasar();
  const signUpCode = ref('');
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
    const instKey = signUpCode.value.replace(/[0-9]/g, '');
    try {
      signingUp.value = true;
      await authStore.signup(payload, instKey);
      await router.replace({ name: 'dashboard' });
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
  function isValidSignUpCode(val?: string) {
    const code = val || signUpCode.value || '';
    const hash = /-?\d+$/.exec(code)?.[0] || '';
    return (
      hash &&
      Number(hash) ==
        Profiler.hashName(code.substring(0, code.length - hash.length))
    );
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
    signUpCode,
    confirmPassword,
    isViewPassword,
    isViewPassword1,
    toggleSubmit,
    isValidSignUpCode,
    signingUp,
    onSignup,
  };
}
