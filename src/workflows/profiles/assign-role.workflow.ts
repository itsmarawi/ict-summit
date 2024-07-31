import { theWorkflows } from '../the.workflows';
import { useProfileStore } from 'src/stores/profile-store';

theWorkflows.on({
  type: 'assignRole',
  permissions: ['admin'],
  loggable: 'operation',
  info: { module: 'profiles', icon: 'account_circle', featured: true },
  async cb(e) {
    const profileStore = useProfileStore();
    const officerRole = profileStore.theUser?.role || '';
    const role = e.role;
    if (/(admin)/.test(role || '') && officerRole != 'admin') {
      e.error && e.error(new Error('Access denied'));
      return;
    }
    const update = await profileStore.assignOrUnassignRole(e.payload, role);
    update && e.done && e.done(update.data);
  },
});
