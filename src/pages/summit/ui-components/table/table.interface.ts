interface ICol {
  name: string;
  value: string | number | boolean;
}

interface IStyle {
  color?: string;
  name?: string;
  icon?: string;
}

export type SummitEvents =
  | 'onToggleStatus'
  | 'onAddSummit'
  | 'onSearch'
  | 'onEditSummit';

export type SpeakerEvents =
  | 'onToggleStatus'
  | 'onAddSpeaker'
  | 'onSearch'
  | 'onEditSpeaker';

export type TopicEvents =
  | 'onToggleStatus'
  | 'onAddTopic'
  | 'onSearch'
  | 'onEditTopic';

export type SponsorEvents =
  | 'onToggleStatus'
  | 'onAddSponsor'
  | 'onSearch'
  | 'onEditSponsor';

export interface ITableUIElements<E> {
  event: E;
  label?: string;
  icon?: string;
  color?: string;
  toolTip?: string;
  loading?: boolean;
  disable?: boolean;
  isShowBtn?: boolean;
}

export interface IPropsTableElements<E> {
  elements: ITableUIElements<E>[];
}

export interface IPropsTableCustom extends IStyle {
  col: ICol;
  identity?: string;
}

export type ITableBodyRight = IStyle;
