import { useProfileStore } from 'src/stores/profile-store';
import { theWorkflows } from '../the.workflows';

theWorkflows.on({
  type: 'toggleProfileStatus',
  permissions: ['admin'],
  info: { module: 'profiles', icon: 'manage_accounts', featured: true },
  async cb(e) {
    const profileStore = useProfileStore();
    const profile =
      typeof e.profile == 'string'
        ? await profileStore.getProfile(e.profile)
        : e.profile;
    if (profile) {
      await profileStore.toggleProfileStatus(profile);
      e.done && e.done(profile);
    }
  },
});
