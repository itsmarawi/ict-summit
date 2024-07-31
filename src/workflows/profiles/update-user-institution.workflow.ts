import { useProfileStore } from 'src/stores/profile-store';
import { theWorkflows } from '../the.workflows';

theWorkflows.on({
  type: 'updateUserInstitution',
  info: { module: 'profiles', icon: 'groups' },
  async cb(e) {
    const profileStore = useProfileStore();
    if (e.instKey) {
      await profileStore.updateProfileProp(e.userKey, 'institution', e.instKey);
      e.done && e.done();
    } else if (e.error) {
      e.error(new Error('Invalid Institution Key'));
    } else {
      throw new Error('Invalid Institution Key');
    }
  },
});
