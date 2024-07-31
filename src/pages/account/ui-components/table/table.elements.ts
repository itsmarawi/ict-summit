import { ITableUIElements } from './table.interface';

export const propsTableActionRight: ITableUIElements[] = [
  {
    event: 'onToggleRole',
    color: 'warning',
    icon: 'manage_accounts',
    label: 'Assign Role',
  },
  {
    event: 'onNominateSubscriptionRole',
    color: 'positive',
    icon: 'class',
    label: 'Nominate Subscription Role',
  },
  {
    event: 'onAddQrEdits',
    color: 'positive',
    icon: 'add',
    label: 'Add Qredits',
  }
];
