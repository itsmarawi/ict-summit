import { QTableColumn } from 'quasar';
import { RaffleDraw, RafflePrice } from 'src/entities';

export const raffleDrawColumns = [
  {
    headerStyle: 'font-size: 20px',
    name: 'name',
    field: (row: { name: string }) => row.name,
    label: 'Name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'owner',
    field: (row: RaffleDraw) => row.owner.name,
    label: 'Owner',
    align: 'left',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'summit',
    field: 'summit',
    label: 'Summit',
    align: 'center',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'status',
    field: 'status',
    label: 'Status',
    align: 'center',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'spinning',
    field: 'spinning',
    label: 'Spinning',
    align: 'center',
    sortable: true,
  },
] as QTableColumn[];

export const rafflePriceColumns = [
  {
    headerStyle: 'font-size: 20px',
    name: 'name',
    field: (row: RafflePrice) => row.price,
    label: 'Name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'owner',
    field: (row: RafflePrice) => row.recipient.name,
    label: 'Owner',
    align: 'left',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'status',
    field: 'status',
    label: 'Status',
    align: 'center',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'releasedBy',
    field: (row: RafflePrice) => row.releasedBy?.name || 'Not released',
    label: 'Released by',
    align: 'left',
    sortable: true,
  },
] as QTableColumn[];
