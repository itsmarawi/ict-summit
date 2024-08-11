import {
  ITableUIElements,
  SpeakerEvents,
  SponsorEvents,
  SummitEvents,
  TopicEvents,
} from './table.interface';

export const propsSummitTableActionRight: ITableUIElements<SummitEvents>[] = [
  {
    event: 'onEditSummit',
    label: 'Edit',
    icon: 'edit',
  },
];

export const propsSpeakerTableActionRight: ITableUIElements<SpeakerEvents>[] = [
  {
    event: 'onEditSpeaker',
    label: 'Edit',
    icon: 'edit',
  },
];

export const propsTopicTableActionRight: ITableUIElements<TopicEvents>[] = [
  {
    event: 'onEditTopic',
    label: 'Edit',
    icon: 'edit',
  },
];

export const propsSponsorTableActionRight: ITableUIElements<SponsorEvents>[] = [
  {
    event: 'onEditSponsor',
    label: 'Edit',
    icon: 'edit',
  },
];
