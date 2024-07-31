import { BusStruct } from 'src/bus.struct';
import { IInstitution } from 'src/entities';

export type Registration = BusStruct<
  'registerInstitution',
  {
    done?: (institution: IInstitution) => void;
    error?: ErrorCallback;
  }
>;
