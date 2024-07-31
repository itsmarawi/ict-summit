import { useAuthStore } from 'src/stores/auth-store';
import { theWorkflows } from '../the.workflows';
theWorkflows.on({
  type: 'logout',
  loggable: 'console',
  info: { module: 'auth', icon: 'key_off' },
  async cb(e) {
    const authStore = useAuthStore();
    await authStore.logout();
    e.done && e.done();
  },
})
