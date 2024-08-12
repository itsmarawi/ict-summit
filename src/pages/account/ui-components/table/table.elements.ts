import { ITableUIElements } from './table.interface';

export const propsTableActionRight: ITableUIElements[] = [
  {
    event: 'onToggleRole',
    color: 'warning',
    icon: 'manage_accounts',
    label: 'Assign Role',
  },
  {
    event: 'generateUCoupon',
    color: 'positive',
    icon: 'sell',
    label: 'Generate Unique Coupon',
  },
];
