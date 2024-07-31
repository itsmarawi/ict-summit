import { BusStruct } from 'src/bus.struct';

export type Auth =
  | BusStruct<'forgetPwDialog', {
    done?: VoidCallback;
    error?: ErrorCallback;
  }>
  | BusStruct<'logoutDialog'>
  | BusStruct<'requireSignUpCode', {
    done(code: string): void;
    cancel(): void;
  }>;
