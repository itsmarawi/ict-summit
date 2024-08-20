import { BusStruct } from 'src/bus.struct';
import { IProfile, ISummit } from 'src/entities';

export type Profile =
  | BusStruct<
      'setAccountRoleDialog',
      {
        profile: IProfile;
        done?: (profile: IProfile) => void;
        error?: ErrorCallback;
      }
    >
  | BusStruct<
      'generateURoleCouponDialog',
      {
        profile?: IProfile;
        summit: ISummit;
        done?: VoidCallback;
        error?: ErrorCallback;
      }
    >;
