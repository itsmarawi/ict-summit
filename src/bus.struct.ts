import { RoleType } from './entities';

export type BusStruct<S extends string, A = undefined> = {
  type: S;
  arg?: A;
  overridePermissions?: RoleType[];
}

type EmitStruct<T extends { type: string; arg?: A }, A = T['arg']> = {
  type: T['type'];
  permissions?: RoleType[];
  loggable?: 'operation' | 'post-operation' | 'query' | 'console';
  info: {
    module: string;
    icon: string;
    description?:string;
    featured?: boolean;
    color?: string;
  };
  cb: (e: Exclude<A, undefined>) => void;
};

export type ToEmit<T extends { type: string; arg?: unknown }, U> = T extends U
  ? EmitStruct<T>
  : never;
export type ToType<T extends { type: string; arg?: unknown }, U> = T extends U
  ? T['type']
  : never;
