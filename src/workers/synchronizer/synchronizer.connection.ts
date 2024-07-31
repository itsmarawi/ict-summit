import SynchronizerWorker from './synchronizer.worker?worker';
import { SynchronizerMessageEvent, SynchronizerRequestEventNames } from './message.event';
import './resource.registration';
import resourceSynchronizer from './resource.synchronizer';
import { DocStatus } from 'src/resources';
import { webStatusService } from 'src/services/web-status.service';
import { AccessStatus, firebaseService } from 'src/services/firebase.service';

const synchronizerWorker = new SynchronizerWorker();

function postMessage(event: SynchronizerRequestEventNames, data?: unknown) {
  synchronizerWorker.postMessage({
    event: event,
    data: data,
  });
}

class SynchronizerConnection {
  resumeSynching(module?: string, entity?: string) {
    postMessage('resumeSynching', { module, entity });
  }
  stopSynching(timeout?: number) {
    postMessage('stopSynching', timeout);
  }
  clearAll() {
    postMessage('clearAll');
  }
  syncResource(module?: string, entity?: string) {
    postMessage('syncResource', { module, entity });
  }
  syncUpStream() {
    postMessage('syncUpStream');
  }
  retrySynching(info?: { module?: string; entity?: string }) {
    postMessage('retrySynching', info);
    postMessage('syncResource', info);
  }
  setUserKey(userKey: string) {
    postMessage('setUserKey', userKey);
  }
}
export const synchronizerConnection = new SynchronizerConnection();
synchronizerWorker.addEventListener(
  'message',
  (ev: MessageEvent<SynchronizerMessageEvent>) => {
    const message = ev.data;
    if (message.event == 'log') {
      // $store.ref?.dispatch('logs/logMessage', {
      //   ...message.data,
      //   from: 'synchronizer',
      // });
    } else if (message.event == 'syncStatus') {
      //$store.ref.commit('synchronizer/setStatusOf', message.data);
    } else if (message.event == 'docStatusChanged') {
      const info = message.data as {
        subject: string;
        module: string;
        entity: string;
        status: DocStatus;
        fromStatus?: DocStatus;
        key: string;
      };
      resourceSynchronizer.emitSyncStatus(info);
    }
  }
);

webStatusService.subscribe((status) => {
  if (status?.isOnline && status?.isAuth) {
    synchronizerConnection.syncUpStream();
    synchronizerConnection.syncResource();
  } else if (status?.isAuth === false) {
    synchronizerConnection.stopSynching();
  }
});
firebaseService.subscribe((status) => {
  if (status & AccessStatus.authorized) {
    resourceSynchronizer.resumeSyncing(['synced']);
    synchronizerConnection.syncUpStream();
    synchronizerConnection.syncResource();
  } else {
    synchronizerConnection.stopSynching();
    if ((status & AccessStatus.unAuthorized)) {
      resourceSynchronizer.stopSyncing();
      if (!(status & AccessStatus.expired)) {
        synchronizerConnection.clearAll();
      }
    }
  }
});

resourceSynchronizer.sub.subscribe((info) => {
  synchronizerConnection.syncResource(
    info.module, info.entity
  );
})
