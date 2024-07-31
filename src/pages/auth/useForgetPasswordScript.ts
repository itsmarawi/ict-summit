import { ref } from 'vue';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
const authStore = useAuthStore();
export default function () {
  const email = ref('');
  const isShow = ref(false);

  async function onForgetPassword() {
    await verifyUserEmail();
    await authStore.forgetPassword(email.value);
    Notify.create({
      message: `Successfully reset password sent to ${email.value}`,
      type: 'positive',
      timeout: 3000,
    });
    isShow.value = false;
  }
  async function verifyUserEmail() {
    const isEmailExist = await authStore.verifyUserEmail(email.value);
    if (!isEmailExist) {
      Notify.create({
        message: 'Email not found',
        type: 'negative',
        timeout: 3000,
      });
    }
  }

  return {
    email,
    isShow,
    onForgetPassword,
  };
}
