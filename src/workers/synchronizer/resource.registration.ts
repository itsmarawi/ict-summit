import { profileResource, institutionResource } from 'src/resources';
import resourceSynchronizer from './resource.synchronizer';

resourceSynchronizer.register(profileResource, 'profiles');
resourceSynchronizer.register(institutionResource, 'institutions');
