import { BusStruct } from 'src/bus.struct';
import { IProfile } from 'src/entities';

export type Auths =
  | BusStruct<
      'login',
      {
        username?: string;
        password?: string;
        method: 'username/password' | 'google';
        done?: (
          user?: Pick<
            IProfile,
            | 'institution'
            | 'email'
            | 'name'
            | 'status'
            | 'emailVerified'
            | 'role'
            | 'key'
          >
        ) => void;
        error?: (error: unknown) => void;
      }
    >
  | BusStruct<
      'logout',
      {
        done?: VoidCallback;
      }
    >
  | BusStruct<
      'resendEmailVerification',
      {
        done?: VoidCallback;
        error?: ErrorCallback;
      }
    >;
