import { BusStruct } from 'src/bus.struct';
import { IProfile, RoleType } from 'src/entities';

export type Profiles =
  | BusStruct<'updateProfile', {
    displayName: string;
    avatarUrl: string;
    done?: VoidCallback
  }>
  | BusStruct<'toggleProfileStatus', {
    profile: string | IProfile;
    done?: (record: IProfile) => void;
  }>
  | BusStruct<'updateUserInstitution', {
    userKey: string;
    instKey: string;
    done?: VoidCallback;
    error?: ErrorCallback;
  }>
  | BusStruct<'assignRole', {
    payload: IProfile;
    role?: RoleType;
    done?: (profile: IProfile) => void;
    error?: ErrorCallback;
  }>;
