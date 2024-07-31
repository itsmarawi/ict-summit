/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { DeferredPromise } from './deferred.promise';
import { KeyValue } from './key-value.storage';
export type EntityValue = number | string | boolean | Entity | unknown | EntityValue[];
export type Entity = {
  [prop: string]: EntityValue;
}
export type FilterPart = {
  [prop: string]: EntityValue;
};
export type FilterFn<T> = (row: T) => boolean;
export type FilterFn2 = () => object | unknown;
export type Filters<T = Entity> = FilterPart | FilterFn<T> | FilterFn2;
export type Pagination<T> = {
  /**
   * page size
   */
  rowsPerPage: number;
  /**
   * page index from 0
   */
  page: number;
  contents?: T[];
  rowsNumber?: number;
}

export interface ITableInfo {
  tableName: string;
  primaryKey: string;
}
export let IndexDb: IDBFactory;
if (typeof window !== 'undefined') {
  IndexDb = window.indexedDB;
} else if (typeof self !== 'undefined') {
  IndexDb = self.indexedDB;
}
export class StateDBController {
  private db?: IDBDatabase;
  private openPromise: Promise<IDBDatabase | undefined> = Promise.resolve(undefined);
  constructor(public dbName: string, public tableSchema: ITableInfo[], private version?: number) { }
  private initDB(): Promise<IDBDatabase | undefined> {
    const deferred = new DeferredPromise<IDBDatabase>();
    this.openPromise = deferred.promise;

    if (typeof IndexDb === 'undefined' || !IndexDb.open) {
      return Promise.resolve(undefined);
    }
    const req = IndexDb.open(this.dbName, this.version);
    req.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
      this.db = (ev.target as unknown as { result: IDBDatabase })['result'];
      this.initSchema(ev);
    };
    req.onsuccess = (e: Event) => {
      this.db = (e.target as unknown as { result: IDBDatabase }).result;
      deferred.resolve(this.db);
    }
    req.onerror = (e: Event) => {
      deferred.reject(e);
    }
    return deferred.promise;
  }
  initSchema(e: IDBVersionChangeEvent) {
    const db = (e.currentTarget as unknown as { result: IDBDatabase })['result'];
    for (const tInfo of this.tableSchema) {
      const storeArg = { keyPath: tInfo.primaryKey, autoIncrement: true };
      const tblLocal = db.createObjectStore(tInfo.tableName, storeArg);
      tblLocal.createIndex(tInfo.primaryKey, 'keyPath');
    }
  }
  async reset() {
    const db = await this.openPromise;
    db?.close();
    IndexDb.deleteDatabase(this.dbName);
    return this.initDB();
  }

  async transact<T>(tableInfo: ITableInfo): Promise<StateTableController<T> | undefined> {
    let db = await this.openPromise;
    if (!db) {
      db = await this.initDB();
      db = this.db || db;
    }
    if (db) {
      return new StateTableController(tableInfo, db, () => {
        this.close().catch(console.error);
      });
    }
  }
  async close() {
    const db = await this.openPromise;
    if (db) {
      this.openPromise = Promise.resolve(undefined);
    }
    this.db = undefined;
  }
}

export class StateTableController<T>{
  constructor(private tableInfo: ITableInfo, private db: IDBDatabase, private onCloseCb?: () => void) { }
  CreateRow(data: T): Promise<T> {
    const deferred = new DeferredPromise<T>();
    const trans = this.db.transaction([this.tableInfo.tableName], 'readwrite');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const addRequest = objStore.add(data);
    addRequest.onsuccess = this.closeDbOnEvent(() => {
      deferred.resolve(data);
    });
    addRequest.onerror = this.closeDbOnEvent((ev) => {
      deferred.reject(ev);
    });
    return deferred.promise;
  }
  isFiltered(cursor: IDBCursorWithValue, filters: Filters) {
    if (typeof filters == 'function') {
      const withParamFilterFunc = !(/^\w*\s*\(\s*\)/.test(filters.toString()));
      return !withParamFilterFunc || filters(cursor.value as Entity);
    } else {
      return Object.keys(filters).reduce((prev: boolean, cur) => {
        const keyValue = (cursor as unknown as { value: KeyValue<FilterPart> })['value'];
        const propH = cur.split('.');
        if (propH.length == 1) {
          return prev && (typeof filters[cur] == 'undefined' || (keyValue.value)[cur] == filters[cur]);
        } else {
          let ref = keyValue.value;
          for (let index = 0; index < propH.length && typeof ref == 'object'; index++) {
            const prop = propH[index];
            if (index == propH.length - 1) {
              return prev && (typeof filters[prop] == 'undefined' || (ref)[cur] == filters[cur]);
            }
            ref = ref[prop] as FilterPart;
          }
        }
        return prev;
      }, true);
    }
  }
  private closeDbOnEvent(cb: (ev: Event) => void) {
    return (ev: Event) => {
      cb(ev);
      if (this.onCloseCb) {
        this.onCloseCb();
      }
    };
  }
  async getData<T>(filters?: Filters, page?: Pagination<unknown>): Promise<Pagination<T>> {
    const totalRows = await this.Count();
    const deferred = new DeferredPromise<Pagination<T>>();
    const trans = this.db.transaction([this.tableInfo.tableName], 'readonly');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const start = page ? (page.page - 1) * page.rowsPerPage : 0;
    const contents: T[] = [];
    let hasSkipped = false;
    const total = Math.min(totalRows, (page ? page.rowsPerPage : 10000));
    objStore.openCursor().onsuccess = this.closeDbOnEvent((ev: Event) => {
      const cursor = (ev.target as unknown as { result: IDBCursorWithValue })['result'];
      if (filters && cursor && !this.isFiltered(cursor, filters)) {
        cursor.advance(1);
        return;
      }
      if (!hasSkipped && start > 0) {
        hasSkipped = true;
        cursor?.advance(start);
        return;
      }
      if (cursor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        contents.push(cursor.value);
        if (contents.length < total) {
          cursor.continue();
        } else {
          deferred.resolve({
            rowsPerPage: total,
            page: page?.page || 1,
            contents: contents,
            rowsNumber: totalRows
          });
        }
      } else {
        deferred.resolve({
          rowsPerPage: total,
          page: page?.page || 1,
          contents: contents,
          rowsNumber: totalRows
        });
      }
    });
    objStore.openCursor().onerror = this.closeDbOnEvent((error: Event) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }
  ReadAll(): Promise<T[]> {
    const deferred = new DeferredPromise<T[]>();
    const trans = this.db.transaction([this.tableInfo.tableName], 'readonly');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const getRequest = objStore.getAll();
    getRequest.onsuccess = this.closeDbOnEvent((ev: Event) => {
      const result = (ev.target as unknown as { result: T[] })['result'];
      deferred.resolve(result);
    });
    getRequest.onerror = this.closeDbOnEvent((error: Event) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }
  ReadRow(key: string): Promise<T> {
    const deferred = new DeferredPromise<T>();
    const trans = this.db.transaction([this.tableInfo.tableName], 'readonly');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const getRequest = objStore.get(key);
    getRequest.onsuccess = this.closeDbOnEvent((ev: Event) => {
      const result = (ev.target as unknown as { result: T })['result'];
      deferred.resolve(result);
    });
    getRequest.onerror = this.closeDbOnEvent((error: Event) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }
  UpdateRow(updateData: T): Promise<T> {
    const deferred = new DeferredPromise<T>();

    const trans = this.db.transaction([this.tableInfo.tableName], 'readwrite');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const index = objStore.index(this.tableInfo.primaryKey);
    const rowData = updateData as unknown as { [key: string]: string };
    const getRequest = index.get(rowData[this.tableInfo.primaryKey]);
    getRequest.onsuccess = this.closeDbOnEvent((getEvent: Event) => {
      let data = (getEvent.target as unknown as { result: T }).result;
      if (typeof updateData == 'object') {
        data = Object.assign(data || {}, updateData);
      } else {
        data = updateData;
      }
      const updateRequest = objStore.put(data);
      updateRequest.onsuccess = () => {
        deferred.resolve(data);
      }
      updateRequest.onerror = (ev: Event) => {
        deferred.reject(ev);
      }
    });
    getRequest.onerror = this.closeDbOnEvent(() => {
      deferred.resolve(this.CreateRow(updateData));
    })
    return deferred.promise;
  }
  DeleteAll(): Promise<void> {
    const deferred = new DeferredPromise<void>();
    const trans = this.db.transaction([this.tableInfo.tableName], 'readwrite');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const getRequestAllKeys = objStore.getAllKeys();
    getRequestAllKeys.onsuccess = this.closeDbOnEvent(() => {
      if (getRequestAllKeys.result.length > 1) {
        const first = getRequestAllKeys.result[0];
        const last = getRequestAllKeys.result[getRequestAllKeys.result.length - 1];
        const range = IDBKeyRange.bound(first, last);
        const deleteRequest = objStore.delete(range);
        deleteRequest.onsuccess = () => {
          deferred.resolve();
        }
        deleteRequest.onerror = (ev: Event) => {
          deferred.reject(ev);
        }
      } else if (getRequestAllKeys.result.length == 1) {
        this.DeleteRow(getRequestAllKeys.result[0] as string)
          .then(() => {
            deferred.resolve();
          })
          .catch(deferred.reject);
      } else {
        deferred.resolve();
      }
    });
    getRequestAllKeys.onerror = this.closeDbOnEvent((ev: Event) => {
      deferred.reject(ev);
    });
    return deferred.promise;
  }
  DeleteRow(key: string): Promise<T | undefined> {

    const deferred = new DeferredPromise<T | undefined>();

    const trans = this.db.transaction([this.tableInfo.tableName], 'readwrite');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const index = objStore.index(this.tableInfo.primaryKey);
    const getRequest = index.get(key);
    getRequest.onsuccess = this.closeDbOnEvent((getEvent: Event) => {
      const target = getEvent.target && getEvent.target as unknown as { result: T };
      const data = target?.result;
      const deleteRequest = objStore.delete(key);
      deleteRequest.onsuccess = () => {
        deferred.resolve(data);
      }
      deleteRequest.onerror = (ev: Event) => {
        deferred.reject(ev);
      }
    });
    getRequest.onerror = this.closeDbOnEvent((ev: Event) => {
      deferred.reject(ev);
    });
    return deferred.promise;
  }
  Count() {
    const deferred = new DeferredPromise<number>();
    const trans = this.db.transaction([this.tableInfo.tableName], 'readonly');
    const objStore = trans.objectStore(this.tableInfo.tableName);
    const count = objStore.count();
    count.onsuccess = this.closeDbOnEvent(() => {
      deferred.resolve(count.result);
    });
    count.onerror = this.closeDbOnEvent((ev: Event) => {
      deferred.reject(ev);
    });
    return deferred.promise;
  }
}
