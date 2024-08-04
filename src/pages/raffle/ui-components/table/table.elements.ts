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
  {
    event: 'openRaffle',
    label: 'Run Raffle',
    icon: 'flag',
  },
  {
    event: 'onViewRafflePrices',
    label: 'View Prices',
    icon: 'gift',
  },
];

export const propsTablePriceModeratorActionRight: ITableUIElements[] = [
  {
    event: 'onReleasePrice',
    icon: 'volunteer_activism',
    label: 'Release Price',
  },
];

export const propsTablePriceRecipientActionRight: ITableUIElements[] = [
  {
    event: 'onClaimPrice',
    icon: 'volunteer_activism',
    label: 'Redeem Price',
  },
];
