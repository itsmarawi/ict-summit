import { QTableColumn } from 'quasar';

export const accountColumns = [
  {
    name: 'avatar',
    field: 'avatar',
    label: ' ',
    align: 'left',
    headerStyle: 'width: 40px',
  },
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
    name: 'email',
    field: 'email',
    label: 'Email',
    align: 'left',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'institution',
    field: 'institution',
    label: 'Institution',
    align: 'center',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'role',
    field: 'role',
    label: 'Role',
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
] as QTableColumn[];
