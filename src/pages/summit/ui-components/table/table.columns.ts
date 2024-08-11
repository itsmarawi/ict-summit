import { date, QTableColumn } from 'quasar';
import { ISpeaker, ISponsor, ISummit, ITopic } from 'src/entities';

export const summitColumns = [
  {
    headerStyle: 'font-size: 20px',
    name: 'name',
    field: (row: ISummit) =>
      `${row.year} ${date.formatDate(row.dateStart, 'MMM-DD')}`,
    label: 'Name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'theme',
    field: 'theme',
    label: 'Theme',
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
] as QTableColumn[];

export const speakerColumns = [
  {
    headerStyle: 'font-size: 20px',
    name: 'name',
    field: (row: ISpeaker) => row.fullname,
    label: 'Name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'position',
    field: 'position',
    label: 'Position',
    align: 'left',
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'expertise',
    field: 'expertise',
    label: 'Expertise',
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
] as QTableColumn[];

export const topicsColumns = [
  {
    headerStyle: 'font-size: 20px',
    name: 'name',
    field: (row: ITopic) => row.name,
    label: 'Name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'schedule',
    field: 'schedule',
    label: 'Schedule',
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
] as QTableColumn[];

export const sponsorsColumns = [
  {
    headerStyle: 'font-size: 20px',
    name: 'name',
    field: (row: ISponsor) => row.name,
    label: 'Name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    headerStyle: 'font-size: 20px',
    name: 'background',
    field: 'background',
    label: 'Background',
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
] as QTableColumn[];
