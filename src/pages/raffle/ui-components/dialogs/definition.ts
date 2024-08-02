import { BusStruct } from 'src/bus.struct';
import { RaffleDraw } from 'src/entities';

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
    >;
