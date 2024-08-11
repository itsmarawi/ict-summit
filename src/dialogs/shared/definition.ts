import { BusStruct } from 'src/bus.struct';

export type Shared = BusStruct<
  'select-image',
  {
    path?: string;
    done?: (url: string) => void;
    error?: ErrorCallback;
  }
>;
