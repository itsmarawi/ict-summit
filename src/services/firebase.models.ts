import * as entities from '../entities';

export type Models =
  | entities.IProfile
  | entities.IInstitution
  | entities.IMedia
  | entities.RaffleDraw
  | entities.RaffleParticipant
  | entities.RafflePrice
  | entities.ISummit
  | entities.ISpeaker
  | entities.ITopic
  | entities.ISponsor
  | undefined;
