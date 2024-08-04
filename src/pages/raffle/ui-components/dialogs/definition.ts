import { BusStruct } from 'src/bus.struct';
import { RaffleDraw, RafflePrice } from 'src/entities';

export type Raffle =
  | BusStruct<
      'addRaffle',
      {
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
      'viewRafflePriceQr',
      {
        payload: RafflePrice;
        done?: (raffle: RafflePrice) => void;
        error?: ErrorCallback;
      }
    >;
