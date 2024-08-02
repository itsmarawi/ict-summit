import { IBaseEntity } from './base.entity';
export const Roles = ['admin', 'participant', 'moderator', ''] as const;
export type RoleType = (typeof Roles)[number];
export interface IProfile extends IBaseEntity {
  key: string;
  name: string;
  avatar: string;
  email?: string;
  status?: boolean;
  emailVerified?: boolean;
  mobileNumber?: string;
  institution?: string;
  position?: string;
  gender?: string;
  summit?: string;
  tshirt?: string;
  role?: RoleType;
}
