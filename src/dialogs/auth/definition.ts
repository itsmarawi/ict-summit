import { BusStruct } from 'src/bus.struct';

export type Auth =
  | BusStruct<
      'forgetPwDialog',
      {
        done?: VoidCallback;
        error?: ErrorCallback;
      }
    >
  | BusStruct<'logoutDialog'>;
