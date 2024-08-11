import {
  profileResource,
  institutionResource,
  raffleDrawsResource,
  raffleParticipantsResource,
  rafflePricesResource,
} from 'src/resources';
import resourceSynchronizer from './resource.synchronizer';
import { summitsResource } from 'src/resources/summit.resource';
import { speakersResource } from 'src/resources/speaker.resource';
import { topicsResource } from 'src/resources/topic.resource';
import { sponsorsResource } from 'src/resources/sponsor.resource';

resourceSynchronizer.register(profileResource, 'profiles');
resourceSynchronizer.register(institutionResource, 'institutions');
resourceSynchronizer.register(raffleDrawsResource, 'raffle');
resourceSynchronizer.register(raffleParticipantsResource, 'raffle');
resourceSynchronizer.register(rafflePricesResource, 'raffle');
resourceSynchronizer.register(summitsResource, 'summit');
resourceSynchronizer.register(speakersResource, 'summit');
resourceSynchronizer.register(topicsResource, 'summit');
resourceSynchronizer.register(sponsorsResource, 'summit');
