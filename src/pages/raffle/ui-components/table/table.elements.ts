import { ITableUIElements } from './table.interface';

export const propsTableActionRight: ITableUIElements[] = [
  {
    event: 'onDeleteRaffle',
    color: 'warning',
    icon: 'delete',
    label: 'Delete Raffle',
  },
  {
    event: 'onEditRaffle',
    label: 'Edit Raffle',
    icon: 'edit',
  },
];
