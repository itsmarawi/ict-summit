import { RouteLocationRaw } from 'vue-router';

export interface IDrawerItem {
  icon: string;
  label: string;
  hide?: boolean;
  requires?: string[];
  route?: string | RouteLocationRaw;
  children?: IDrawerItem[];
}
