import Phrases from 'src/i18n/en-US';

type PhraseKey = keyof typeof Phrases;
export interface IRouteMeta {
  title?: PhraseKey;
  requires?: string[];
  requiresGuest?: true;
  requiresLogin?: true;
  requiresInstitution?: true;
  requirePin?: true;
};
