import {
  profileResource,
  institutionResource,
  raffleDrawsResource,
  raffleParticipantsResource,
  rafflePricesResource,
} from 'src/resources';
import resourceSynchronizer from './resource.synchronizer';

resourceSynchronizer.register(profileResource, 'profiles');
resourceSynchronizer.register(institutionResource, 'institutions');
resourceSynchronizer.register(raffleDrawsResource, 'raffle');
resourceSynchronizer.register(raffleParticipantsResource, 'raffle');
resourceSynchronizer.register(rafflePricesResource, 'raffle');
