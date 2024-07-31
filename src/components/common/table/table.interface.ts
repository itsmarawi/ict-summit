import { IBaseEntity } from 'src/entities/base.entity';

interface ICol {
  name: string;
  value: string | number | boolean;
}

interface IStyle {
  color?: string;
  name?: string;
  icon?: string;
}

export interface ITableUIElements<E, R extends IBaseEntity> {
  event: E;
  label?: string;
  icon?: string;
  color?: string;
  toolTip?: string;
  loading?: boolean;
  disable?: boolean;
  isShowBtn?: boolean;
  cb?: (row: R) => void;
}

export interface IPropsTableElements<E, R extends IBaseEntity = IBaseEntity> {
  actions: ITableUIElements<E, R>[];
  row?: R
}

export interface IPropsTableCustom<R extends IBaseEntity> extends IStyle {
  col: ICol;
  props: {
    row: R;
  };
}
export function emitOn<E, R extends IBaseEntity = IBaseEntity>(event: E, cb: ((row: R) => void), actions: ITableUIElements<E,R>[]) {
  const action = actions.find(a => a.event === event);
  if (action) {
    action.cb = cb;
  }
}
