interface ICol {
  name: string;
  value: string | number | boolean;
}

interface IStyle {
  color?: string;
  name?: string;
  icon?: string;
}

export type TEvents =
  | 'onToggleRole'
  | 'onExportAccounts'
  | 'generateUCoupon'
  | 'onSearch';
export interface ITableUIElements {
  event: TEvents;
  label?: string;
  icon?: string;
  color?: string;
  toolTip?: string;
  loading?: boolean;
  disable?: boolean;
  isShowBtn?: boolean;
}

export interface IPropsTableElements {
  elements: ITableUIElements[];
}

export interface IPropsTableCustom extends IStyle {
  col: ICol;
}

export type ITableBodyRight = IStyle;
