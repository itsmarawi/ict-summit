import { BusStruct } from 'src/bus.struct';
import { ISpeaker, ISponsor, ISummit, ITopic } from 'src/entities';

export type Summit =
  | BusStruct<
      'editSummit',
      {
        payload: ISummit;
        done?: (summit: ISummit) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'addSpeaker',
      {
        payload: ISummit;
        done?: (speaker: ISpeaker) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'editSpeaker',
      {
        payload: ISpeaker;
        done?: (speaker: ISpeaker) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'addTopic',
      {
        payload: ISummit;
        done?: (topic: ITopic) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'editTopic',
      {
        payload: ITopic;
        done?: (topic: ITopic) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'addSponsor',
      {
        payload: ISummit;
        done?: (sponsor: ISponsor) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'editSponsor',
      {
        payload: ISponsor;
        done?: (sponsor: ISponsor) => void;
        error?: ErrorCallback;
      }
    >;
