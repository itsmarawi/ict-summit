import { theBus } from 'src/the.bus';
import { ToEmit, ToType } from 'src/bus.struct';
import { Profiles } from './profiles/definition';
import { Auths } from './auths/definition';
import { Media } from './media/definition';
import { DeferredPromise } from 'src/resources/localbase';

type WorkflowStructs = Profiles | Auths | Media;

type WorkflowEvents = ToEmit<WorkflowStructs, WorkflowStructs>;
export type WorkflowTypes = ToType<WorkflowStructs, WorkflowStructs>;
const deferred = new DeferredPromise<true>();
export const theWorkflows = {
  ready: deferred.resolve,
  on(desc: WorkflowEvents) {
    theBus.off(desc.type, desc.cb as VoidFunction);
    theBus.off(desc.type);
    theBus.on(desc.type, desc.cb as VoidFunction);
  },
  async emit(desc: WorkflowStructs) {
    theBus.emit(desc.type, desc.arg);
  },
  /**
   * Requires done and error Callbacks to defined
   * use done callback to resolve promise and error callback to reject
   */
  emitPromised<T = void>(desc: WorkflowStructs) {
    const deferred = new DeferredPromise<T>();
    const promised = {
      type: desc.type,
      arg: {
        ...desc.arg,
        done: deferred.resolve,
        error: deferred.reject,
      },
      overridePermissions: desc.overridePermissions,
    } as WorkflowStructs;
    this.emit(promised);
    return deferred.promise;
  },
};
