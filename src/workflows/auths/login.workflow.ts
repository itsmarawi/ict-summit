import { useAuthStore } from 'src/stores/auth-store';
import { theWorkflows } from '../the.workflows';
import { useProfileStore } from 'src/stores/profile-store';

theWorkflows.on({
  type: 'login',
  loggable: 'post-operation',
  info: { module: 'auth', icon: 'key' },
  async cb(e) {
    const authStore = useAuthStore();
    try {
      if (e.method == 'username/password' && e.username && e.password) {
        await authStore.login(e.username, e.password);
      } else if (e.method == 'google') {
        await authStore.googleLogin();
      }
    } catch (error) {
      if (e.error) {
        e.error(error);
      } else throw error;
    }
    const profileStore = useProfileStore();
    const user = await profileStore.getUserAsync();
    if (user?.status === false) {
      e.error && e.error('Account deactivated');
      profileStore.authenticate();
      return;
    }
    user &&
      e.done &&
      e.done({
        key: user.key,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        institution: user.institution,
        role: user.role,
        status: user.status,
      });
  },
});
