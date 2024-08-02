import { ToEmit, ToType } from 'src/bus.struct';
import { theBus } from 'src/the.bus';
import { Auth } from './auth/definition';
import { Registration } from './registration/definition';
import { Profile } from 'src/pages/account/ui-components/dialog/definition';
import { Raffle } from 'src/pages/raffle/ui-components/dialogs/definition';

export type DialogStructs = Auth | Registration | Profile | Raffle;

type DialogEvents = ToEmit<DialogStructs, DialogStructs>;
export type DialogTypes = ToType<DialogStructs, DialogStructs>;
export const theDialogs = {
  on(desc: DialogEvents) {
    theBus.off(desc.type, desc.cb as VoidFunction);
    theBus.off(desc.type);
    theBus.on(desc.type, desc.cb as VoidFunction);
  },
  off(desc: DialogEvents) {
    theBus.off(desc.type);
  },
  emit(desc: DialogStructs) {
    theBus.emit(desc.type, desc.arg);
  },
};
