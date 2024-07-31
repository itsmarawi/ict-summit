import { useProfileStore } from 'src/stores/profile-store';
import { theWorkflows } from '../the.workflows';
import { IProfile } from 'src/entities';

theWorkflows.on({
  type: 'updateProfile',
  info: { module: 'profiles', icon: 'manage_accounts' },
  async cb(e) {
    const profileStore = useProfileStore();
    await profileStore.updateProfile({
      name: e.displayName,
      avatar: e.avatarUrl,
    } as IProfile);
    e.done && e.done();
  },
});
