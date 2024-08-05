import { BusStruct } from 'src/bus.struct';
import {
  RaffleDraw,
  RaffleDrawWithParticipants,
  RafflePrice,
} from 'src/entities';

export type Raffle =
  | BusStruct<
      'addRaffle',
      {
        payload?: RaffleDraw;
        done?: (raffle: RaffleDraw) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'editRaffle',
      {
        payload: RaffleDraw;
        done?: (raffle: RaffleDraw) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'cloneRaffleParticipants',
      {
        payload: RaffleDraw;
        done?: (raffle: RaffleDrawWithParticipants) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'viewRafflePriceQr',
      {
        payload: RafflePrice;
        done?: (raffle: RafflePrice) => void;
        error?: ErrorCallback;
      }
    >;
