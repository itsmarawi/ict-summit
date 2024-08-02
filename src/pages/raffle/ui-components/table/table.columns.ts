import { QTableColumn } from 'quasar';
import { RaffleDraw } from 'src/entities';

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
