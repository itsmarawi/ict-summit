export type SynchronizerEventNames =
  | 'log'
  | 'getAccessToken'
  | 'syncStatus'
  | 'docStatusChanged';
export type SynchronizerMessageEvent = {
  event: SynchronizerEventNames;
  data: unknown;
};

export type SynchronizerRequestEventNames =
  | 'setAccessToken'
  | 'setUserKey'
  | 'syncResource'
  | 'syncUpStream'
  | 'retrySynching'
  | 'stopSynching'
  | 'resumeSynching'
  | 'clearAll';
export type SynchronizerRequestEvent = {
  event: SynchronizerRequestEventNames;
  data: unknown;
};
