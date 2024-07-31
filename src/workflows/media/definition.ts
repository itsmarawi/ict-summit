import { BusStruct } from 'src/bus.struct';

export type Media = BusStruct<'uploadImage', {
  payload: File;
  path: string;
  done?: (url: string) => void;
  error?: ErrorCallback;
}>;
