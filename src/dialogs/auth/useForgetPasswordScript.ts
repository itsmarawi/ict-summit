import { ref } from 'vue';
import { Notify } from 'quasar';
import { theDialogs } from '..';
import { useAuthStore } from 'src/stores/auth-store';
import { useRouter } from 'vue-router';

export default function () {
  const router = useRouter();
  const authStore = useAuthStore();
  const email = ref('');
  const isLoading = ref(false);
  const isShow = ref(false);

  function goToSignup() {
    isShow.value = false;
    router.replace('/signup');
  }

  async function onForgetPassword() {
    isLoading.value = true;
    try {
      // await verifyUserEmail();
      await authStore.forgetPassword(email.value);
      Notify.create({
        message: `Successfully reset password sent to ${email.value}`,
        type: 'positive',
        timeout: 3000,
      });
      isShow.value = false;
      email.value = '';
    } catch (error) {
      Notify.create({
        message: String(error),
        timeout: 3000,
      });
    }
    isLoading.value = false;
  }

  theDialogs.on({
    type: 'forgetPwDialog',
    info: { module: 'auth', icon: 'password' },
    cb() {
      isShow.value = true;
    },
  });
  return {
    email,
    isShow,
    isLoading,
    onForgetPassword,
    goToSignup,
  };
}
