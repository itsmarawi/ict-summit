import { useAuthStore } from 'src/stores/auth-store';
import { theWorkflows } from '../the.workflows';
theWorkflows.on({
  type: 'resendEmailVerification',
  loggable: 'console',
  info: { module: 'auth', icon: 'email' },
  async cb(e) {
    const authStore = useAuthStore();
    try {
      await authStore.resendEmailVerification();
      e.done && e.done();
    } catch (error) {
      e.error && e.error(error as Error);
    }
  },
})
