import { BusStruct } from 'src/bus.struct';
import { IProfile } from 'src/entities';

export type Profile = BusStruct<
  'setAccountRoleDialog',
  {
    profile: IProfile;
    done?: (profile: IProfile) => void;
    error?: ErrorCallback;
  }
>;
