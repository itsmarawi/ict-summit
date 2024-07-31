import { Subject } from 'rxjs';
import { BaseResource, DocStatus } from 'src/resources';
import { DeferredPromise } from 'src/resources/localbase';
type SyncSummary = {
  module: string;
  entity: string;
  total: number;
  synching: number;
  synched: number;
  saved: number;
  updated: number;
  patched: number;
  deleted: number;
  error: number;
  lastSynched?: Date;
  createError?: number;
  updateError?: number;
  patchError?: number;
  deleteError?: number;
};

type StatusChange = {
  subject: string;
  entity?: string;
  module?: string;
  key: string;
  newKey: string;
  status: DocStatus;
  fromStatus: DocStatus;
};

type SyncCb = (
  info:
    | {
      type: 'summary';
      details: SyncSummary;
    }
    | {
      type: 'statusChanged';
      details: StatusChange;
    }
    | {
      type: 'log',
      details: {
        module: string;
        type: string;
        message: string;
      }
    }
) => void;
export type StatusUpdate = {
  subject?: string;
  module: string;
  entity: string;
  status: DocStatus;
  fromStatus?: DocStatus;
  key?: string;
  newKey?: string;
};
class ResourceSynchronizer {
  readonly sub = new Subject<StatusUpdate>();
  private syncingSubs: Record<string, Subject<StatusUpdate>> = {};
  private deferred: Record<
    string,
    {
      counter: number;
      object: DeferredPromise<boolean>;
    }
  > = {};
  private resources: {
    resource: BaseResource<object>;
    busy: boolean;
    moduleName: string;
  }[] = [];

  async clearAllRecords() {
    for (const r of this.resources) {
      await r.resource.deleteAll();
    }
  }
  stopSyncing(timeout?: number) {
    for (const r of this.resources) {
      r.resource.stopSyncing(timeout);
    }
  }
  resumeSyncing(syncOn?: DocStatus[], module?: string, entity?: string) {
    let forSyncing = this.resources;
    if (entity || module) {
      forSyncing = forSyncing.filter(
        (r) =>
          (!module || (module && r.moduleName == module)) &&
          (!entity || (entity && r.resource.entity == entity))
      );
    }
    for (const r of forSyncing) {
      if (!r.busy) {
        r.resource.resumeSyncing(syncOn);
      }
    }
  }
  emitSyncStatus(info: StatusUpdate) {
    const { subject, status } = info;
    const sub = !!subject && this.syncingSubs[subject] || undefined;
    sub?.next(info);
    if (sub && (status == 'synced' || status == 'deleted') && subject) {
      sub.complete();
      delete this.syncingSubs[subject];
    }
    this.syncingSubs['all.subjects']?.next(info);
  }
  subscribe(cb: (info: StatusUpdate) => void) {
    const fullSub = 'all.subjects';
    const sub = this.syncingSubs[fullSub] || new Subject();
    this.syncingSubs[fullSub] = sub;
    return sub.subscribe(cb);
  }
  register(resource: BaseResource<object>, moduleName = '') {
    this.resources.push({
      resource,
      busy: false,
      moduleName: moduleName || resource.entity,
    });
    resource.onSubscribe = (
      subject: string,
      cb: (docStatus: StatusUpdate) => void
    ) => {
      const fullSub = `${moduleName}:${subject}`;
      const sub = this.syncingSubs[fullSub] || new Subject();
      this.syncingSubs[fullSub] = sub;
      sub.subscribe(cb);

    };
    resource.onSyncDelayedCb = (status) => {
      this.sub.next({
        subject: '',
        module: moduleName || resource.entity,
        entity: resource.entity,
        status,
      });
    };
  }
  private async triage(module?: string, entity?: string) {
    const key = `${module || 'all'}.${entity || 'any'}`;
    if (this.deferred[key]) {
      await new Promise((r) => setTimeout(r, 1000));
      this.deferred[key].counter++;
      if (this.deferred[key].counter > 1) {
        return false;
      }
      await this.deferred[key].object.promise;
    }
    this.deferred[key] = {
      counter: 0,
      object: new DeferredPromise(),
    };
    return true;
  }
  private releaseTriage(module?: string, entity?: string, timeout = 1000) {
    const key = `${module || 'all'}.${entity || 'any'}`;
    setTimeout(() => {
      if (this.deferred[key]) {
        this.deferred[key].object.resolve(true);
        this.deferred[key].counter = 0;
      }
    }, timeout);
  }
  async syncResources(cb: SyncCb, module?: string, entity?: string) {
    if (!(await this.triage(module, entity))) {
      return;
    }
    let forSyncing = [...this.resources];
    if (entity || module) {
      forSyncing = forSyncing.filter(
        (r) =>
          (!module || (module && r.moduleName == module)) &&
          (!entity || (entity && r.resource.entity == entity))
      );
    }
    const SPLIT_COUNT = 3;
    const syncCount = forSyncing.length;
    const report = [];
    while (forSyncing.length > 0 && report.length < syncCount) {
      const next = forSyncing.splice(0, SPLIT_COUNT);
      report.push(
        ...(await Promise.all(next.map((r) => this.syncResource(cb, r))))
      );
    }
    if (forSyncing.length == 0 && entity) {
      cb({
        type: 'log',
        details: {
          module: module || entity,
          type: 'Info',
          message: `Resource entity ${entity || ''} of ${module || 'entity'}`
        }
      })
    }
    this.releaseTriage(module, entity);
  }
  async syncResource(
    cb: SyncCb,
    res: {
      moduleName?: string;
      resource: BaseResource<object>;
      busy: boolean;
    }
  ) {
    if (res.busy) {
      return;
    }
    let lastSynced: Date | undefined;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const allDocs = (await res.resource.findAllDoc()).filter(d => d.modifiedDate && d.status != 'syncing');
    const synchingDocs = [...allDocs];
    const forSyncing = synchingDocs.filter((d) => d.status != 'synced');
    postProgress();
    res.busy = forSyncing.length > 0;
    for (const doc of forSyncing) {
      const status = doc.status;
      const key = doc.key;
      try {
        await res.resource.syncDoc(doc);
      } finally {
        const updatedDoc = await res.resource.getDoc(doc.key);
        if (updatedDoc?.lastSynced && (!lastSynced || updatedDoc?.lastSynced > lastSynced)) {
          lastSynced = updatedDoc.lastSynced;
        }
        const updatedStatus = updatedDoc?.status || (doc.status == 'deleted' ? 'synced' : doc.status);
        if (status != updatedStatus) {
          const subject = `${res.moduleName || res.resource.entity}:${res.resource.entity}:${key}`;
          postProgress();
          cb({
            type: 'statusChanged',
            details: {
              subject,
              module: res.moduleName,
              entity: res.resource.entity,
              key: key,
              newKey: doc.key,
              status: updatedStatus || 'error',
              fromStatus: status
            }
          })
        }
      }
    }
    res.busy = false;
    return computeProgress();
    function computeProgress(): Parameters<SyncCb>[0] {
      const stat: SyncSummary = {
        total: allDocs.length,
        synching: synchingDocs.length,
        error: 0,
        entity: res.resource.entity,
        lastSynched: lastSynced,
        module: res.moduleName || '',
        saved: forSyncing.filter((d) => d.status === 'saved').length,
        updated: forSyncing.filter((d) => d.status === 'updated').length,
        patched: forSyncing.filter((d) => d.status === 'patched').length,
        deleted: forSyncing.filter((d) => d.status === 'deleted').length,
        synched:
          allDocs.length -
          forSyncing.filter((d) => d.status != 'synced').length,
        createError: forSyncing.filter((d) => d.status === 'createError')
          .length,
        updateError: forSyncing.filter((d) => d.status === 'updateError')
          .length,
        patchError: forSyncing.filter((d) => d.status === 'patchError')
          .length,
        deleteError: forSyncing.filter((d) => d.status === 'deleteError')
          .length,
      };
      stat.error = (stat.createError || 0) +
        (stat.updateError || 0) +
        (stat.patchError || 0) +
        (stat.deleteError || 0);
      return {
        type: 'summary',
        details: stat,
      };
    }
    function postProgress() {
      cb(computeProgress());
    }
  }
}

const resourceSynchronizer = new ResourceSynchronizer();
export default resourceSynchronizer;
