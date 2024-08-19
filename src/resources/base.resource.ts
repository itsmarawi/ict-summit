import { map, merge, Observable } from 'rxjs';
import { DeferredPromise, KeyValueStorage } from './localbase';
import {
  Entity,
  FilterFn2,
  FilterPart,
  Filters,
  Pagination,
} from './localbase/state-db.controller';

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { switchMap } from 'rxjs/internal/operators/switchMap';
const dbVersion = undefined;

interface IEncryptedMsg {
  cipherText: string;
  ephemPubKey: string;
  nonce: string;
}
export type StatusUpdate = {
  subject?: string;
  module: string;
  entity: string;
  status: DocStatus;
  fromStatus?: DocStatus;
  key?: string;
  newKey?: string;
};

export type IBaseResourceModel =
  | {
      id?: string;
      key?: string;
    }
  | Record<string, unknown>;
type DocError =
  | 'error'
  | 'createError'
  | 'updateError'
  | 'patchError'
  | 'deleteError';
export type DocStatus =
  | 'new'
  | 'saved'
  | 'syncing'
  | 'synced'
  | 'updated'
  | 'patched'
  | 'deleted'
  | DocError;
export interface IDocStore<T extends IBaseResourceModel> {
  status: DocStatus;
  key: string;
  none?: string;
  pubKey?: string;
  data: T;
  lastSynced?: Date;
  modifiedDate?: Date;
  remarks?: string;
}
type StatusOrData<T> = void | boolean | T | string;
export type CbResponse<T> = StatusOrData<T>;

export abstract class BaseResource<T extends IBaseResourceModel> {
  requestDelay = 1000 * 1 /*second*/;
  constructor(
    public readonly entity: string,
    private keyField?: string,
    readonly prefix = 'esqr',
    private altKey?: string,
    private shouldEncrypt = typeof process.env.EPRIKEY != 'undefined' &&
      process.env.EPRIKEY != 'false' &&
      process.env.NODE_ENV != 'development'
  ) {
    this.localBase = new KeyValueStorage(
      prefix + '-' + entity.toLowerCase(),
      dbVersion
    );
  }
  lastError?: unknown;
  private syncingOn: boolean | DocStatus[] = [];
  protected localBase: KeyValueStorage;

  private nowSynching: false | string[] = false;
  onSubscribe?: (
    subject: string,
    cb: (docStatus: StatusUpdate) => void
  ) => void;
  onSyncDelayedCb?: (docStatus: DocStatus) => void;

  protected abstract createCb(data: T): Promise<CbResponse<T>> | void;
  protected abstract deleteCb(data: T): Promise<CbResponse<T>> | void;
  protected abstract deleteAllCb(): Promise<void | boolean>;
  protected abstract getAllCb(filters?: Filters): Promise<T[] | void>;
  protected abstract getCb(key: string): Promise<CbResponse<T>>;
  protected abstract updateCb(data: T): Promise<CbResponse<T>> | void;
  protected abstract patchCb(data: T, property: string): Promise<CbResponse<T>>;
  protected abstract streamCb(
    filters?: Filters,
    options?: {
      limits?: number;
      orderBy?: string;
      order?: 'asc' | 'desc';
    }
  ): void | Observable<T[]>;

  private async manageDocCallback(doc: IDocStore<T>, sync = false) {
    if (
      !this.shouldSyncOn(doc.status) ||
      (this.nowSynching && this.nowSynching.includes(doc.key))
    )
      return;
    const ONEDAY = 1000 * 60 * 60 * 24; //60
    this.nowSynching = this.nowSynching
      ? [...this.nowSynching, doc.key]
      : [doc.key];
    try {
      if (doc.status !== 'synced') {
        await this.syncPostDoc(doc);
      } else if (
        sync ||
        typeof doc.lastSynced == 'undefined' ||
        Date.now() > new Date(doc.lastSynced).getTime() + ONEDAY
      ) {
        await this.syncDownStream(doc);
      }
    } catch (e) {
      this.lastError = e;
      await this.saveDoc(doc.key, {
        ...doc,
        status: stateToError(doc.status),
        remarks: String(e),
      });
    } finally {
      this.nowSynching = afterSync(this.nowSynching, doc.key);
    }
    function afterSync(nowSynching: string[], key: string) {
      const index =
        nowSynching.length > 1 ? nowSynching.indexOf(key || doc.key) : -1;
      if (index >= 0) {
        return [...nowSynching].splice(index, 1);
      }
      return false;
    }
    function stateToError(status: DocStatus) {
      let docStatus: DocError;
      switch (status) {
        case 'saved':
        case 'createError':
          docStatus = 'createError';
          break;
        case 'deleted':
        case 'deleteError':
          docStatus = 'deleteError';
          break;
        case 'updated':
        case 'updateError':
          docStatus = 'updateError';
          break;
        default:
          docStatus = 'error';
          break;
      }
      return docStatus;
    }
  }
  private async recordError(
    doc: IDocStore<T>,
    status: DocError,
    error: string
  ) {
    this.updateSyncStatus({
      ...doc,
      remarks: [doc.remarks, error].filter((f) => f).join('\n'),
    });
    this.lastError = error;
    await this.setData(
      doc.key,
      doc.data,
      status,
      undefined,
      [doc.remarks, error].filter((f) => f).join('\n')
    );
  }
  private async normalizeDocKey(key: string, data: T) {
    const record = data as unknown as Record<string, string>;
    const genKey = this.getKeyOf(data);
    const isCurAltKey =
      (!!this.altKey && key === record[this.altKey]) ||
      (!!this.keyField && record[this.keyField] !== key);
    const isKeyFieldSet = !!this.keyField && genKey === record[this.keyField];
    if (isCurAltKey && isKeyFieldSet) {
      await this.localBase.deleteItem(key);
      return genKey;
    }
    return false;
  }
  private async syncCreate(doc: IDocStore<T>) {
    let statusOrData: StatusOrData<T> = false;
    await this.setData(doc.key, doc.data, 'syncing');
    statusOrData = await this.createCb(doc.data);
    if (statusOrData && typeof statusOrData == 'object') {
      const normKey = await this.normalizeDocKey(doc.key, statusOrData);
      doc.data = statusOrData;
      this.updateSyncStatus({ ...doc, status: 'synced' });
      if (normKey) {
        doc.key = normKey;
        return await this.save(doc.key, statusOrData, 'synced');
      } else {
        return await this.save(doc.key, statusOrData, 'synced');
      }
    } else if (statusOrData && typeof statusOrData == 'string') {
      await this.recordError(doc, 'createError', statusOrData);
      return;
    } else {
      return await this.save(doc.key, doc.data, 'saved');
    }
  }
  private async syncEdit(doc: IDocStore<T>) {
    let statusOrData: StatusOrData<T> = false;
    const props = Object.keys(doc.data).filter((prop) => /^\*/.test(prop));
    if (props.length == 0) {
      //update
      statusOrData = await this.updateCb(doc.data);
      if (statusOrData && typeof statusOrData == 'string') {
        await this.recordError(doc, 'updateError', statusOrData);
        return false;
      } else {
        doc.status = 'synced';
        return await this.save(doc.key, doc.data, 'synced');
      }
    } else {
      return await this.syncPatchProps(doc, props);
    }
  }
  private async syncPatchProps(doc: IDocStore<T>, props: string[]) {
    let statusOrData: StatusOrData<T> = false;
    //patch properties
    const failedPatch: string[] = [];
    const refData = doc.data;
    const copyData = { ...refData };
    await Promise.all(
      props.map(async (prop) => {
        const result = await this.patchCb(copyData, prop.replace('*', ''));
        if ((result && typeof result == 'object') || result === true) {
          delete (refData as unknown as Record<string, string>)[prop];
        } else {
          failedPatch.push(prop);
        }
        if (result && typeof result == 'string') {
          this.lastError = String(result);
          await this.recordError(doc, 'patchError', result);
        }
      })
    );
    statusOrData = failedPatch.length == 0;
    if (statusOrData) {
      return await this.save(doc.key, refData, 'synced');
    }
    return statusOrData;
  }
  private async syncDelete(doc: IDocStore<T>) {
    let statusOrData: StatusOrData<T> = false;
    statusOrData = await this.deleteCb(doc.data);
    if (statusOrData) {
      doc.status = 'deleted';
      return (!!(await this.localBase.deleteItem(doc.key)) && doc) || false;
    }
    return statusOrData;
  }
  private async syncPostDoc(doc: IDocStore<T>) {
    let statusOrDoc: StatusOrData<IDocStore<T>> = false;
    if (/^(saved|createError)$/.test(doc.status)) {
      statusOrDoc = await this.syncCreate(doc);
    } else if (/^(updated|updateError|patched|patchError)$/.test(doc.status)) {
      statusOrDoc = await this.syncEdit(doc);
    } else if (/^(deleted|deletedError)$/.test(doc.status)) {
      statusOrDoc = await this.syncDelete(doc);
    }
    if (statusOrDoc && typeof statusOrDoc == 'object') {
      await this.setDataStatus(statusOrDoc.key, 'synced');
      doc.status = 'synced';
    }
    return statusOrDoc;
  }
  private async syncDownStream(doc: IDocStore<T>) {
    const status = await this.getCb(doc.key);
    if (status && typeof status == 'object') {
      await this.setData(doc.key, status, 'synced');
      doc.data = status;
    }
  }
  private shouldSyncOn(docStatus: DocStatus) {
    const shouldSync =
      this.syncingOn === true ||
      (this.syncingOn instanceof Array && this.syncingOn.includes(docStatus));
    if (
      !shouldSync &&
      docStatus != 'synced' &&
      typeof this.onSyncDelayedCb == 'function'
    ) {
      this.onSyncDelayedCb(docStatus);
    }
    return shouldSync;
  }
  private mapDoc(doc: IDocStore<T>, skipSync = false) {
    const mapDoc = this.retrieveDoc(doc);
    if (!skipSync && mapDoc) this.manageDocCallback(mapDoc);
    return doc.data;
  }
  private isSame(a: T, b: T) {
    const propsA = Object.keys(a) as (keyof T)[];
    const propsB = Object.keys(b) as (keyof T)[];
    if (propsA.length != propsB.length) return false;
    return propsA.reduce(
      (same, prop) => same && typeof a[prop] != 'object' && a[prop] === b[prop],
      true
    );
  }
  private async saveDoc(key: string | number, doc: IDocStore<T>) {
    key = key || doc.key;
    if (key) {
      if (doc.status == 'synced') {
        doc.lastSynced = new Date();
        const newKey = this.getKeyOf(doc.data);
        if (newKey !== key) {
          await this.localBase.deleteItem(String(key));
          key = newKey;
        }
      }
      doc.key = String(key);
      doc.lastSynced =
        doc.lastSynced && doc.lastSynced instanceof Date
          ? (doc.lastSynced.getTime() as unknown as Date)
          : undefined;
      doc.modifiedDate =
        doc.modifiedDate && doc.modifiedDate instanceof Date
          ? (doc.modifiedDate.getTime() as unknown as Date)
          : undefined;
      if (this.shouldEncrypt) {
        const data = JSON.stringify(doc.data);
        const enc = this.encryptFromPub(process.env.EPUBKEY || '', data);
        const d = { ...doc } as IDocStore<T>;
        d.data = enc.cipherText as unknown as T;
        d.none = enc.nonce;
        d.pubKey = enc.ephemPubKey;
        await this.localBase.setItem(doc.key, d);
        return doc;
      }
    }
    return this.localBase.setItem(doc.key, doc);
  }
  private retrieveDoc(doc?: IDocStore<T>) {
    if (
      (!this.shouldEncrypt && !doc) ||
      !process.env.EPUBKEY ||
      typeof doc?.data !== 'string' ||
      !doc.pubKey ||
      !doc.none
    ) {
      return doc;
    }
    const decrypted = this.decryptWithSec(process.env.EPRIKEY || '', {
      cipherText: doc.data,
      ephemPubKey: doc.pubKey,
      nonce: doc.none,
    });
    if (decrypted) {
      doc = {
        ...doc,
        data: JSON.parse(decrypted) as T,
      };
    }
    if (typeof doc.lastSynced == 'number') {
      doc.lastSynced = new Date(doc.lastSynced);
    }
    if (typeof doc.modifiedDate == 'number') {
      doc.modifiedDate = new Date(doc.modifiedDate);
    }
    return doc;
  }
  private encryptFromPub(receiverPublicKey: string, msgParams: string) {
    const ephemeralKeyPair = nacl.box.keyPair();
    const pubKeyUInt8Array = naclUtil.decodeBase64(receiverPublicKey);
    const msgParamsUInt8Array = naclUtil.decodeUTF8(msgParams);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encryptedMessage = nacl.box(
      msgParamsUInt8Array,
      nonce,
      pubKeyUInt8Array,
      ephemeralKeyPair.secretKey
    );
    return {
      cipherText: naclUtil.encodeBase64(encryptedMessage),
      ephemPubKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
      nonce: naclUtil.encodeBase64(nonce),
    };
  }
  private decryptWithSec(
    receiverSecretKey: string,
    encryptedData: IEncryptedMsg
  ) {
    const receiverSecretKeyUint8Array =
      naclUtil.decodeBase64(receiverSecretKey);
    const nonce = naclUtil.decodeBase64(encryptedData.nonce);
    const cipherText = naclUtil.decodeBase64(encryptedData.cipherText);
    const ephemPubKey = naclUtil.decodeBase64(encryptedData.ephemPubKey);
    const decryptedMessage = nacl.box.open(
      cipherText,
      nonce,
      ephemPubKey,
      receiverSecretKeyUint8Array
    );
    if (decryptedMessage) {
      return naclUtil.encodeUTF8(decryptedMessage);
    }
    return '';
  }

  private async getDocByIdentity(
    key: string
  ): Promise<IDocStore<T> | undefined> {
    let item = this.retrieveDoc(await this.localBase.getItem(key));
    if (this.keyField != 'key') {
      item = item || (await this.getDocByField('key', key));
      item = item || (await this.getDocByField('id', key));
    }
    return item;
  }
  private async getDocByField(
    idField: string,
    value: string
  ): Promise<IDocStore<T> | undefined> {
    const result = (
      await this.localBase.paginatedValues<IDocStore<T>>((doc) => {
        return (
          ((doc.value as IDocStore<T>).data as { [key: string]: string })[
            idField
          ] == value
        );
      })
    ).contents;
    if (result instanceof Array) {
      return result[0];
    }
  }
  protected hashName(name: string) {
    let hash = 0;
    if (name.length == 0) return hash;
    for (let i = 0; i < name.length; i++) {
      const chr = name.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash = hash & hash;
    }
    return hash;
  }
  protected updateSyncStatus(doc: IDocStore<T>) {
    doc.remarks = doc.remarks || '';
  }
  protected filterCb(data: T, filters: string[]): boolean {
    return !filters || !!data;
  }
  protected arrayFilter<T = []>(filters?: Filters) {
    if (
      typeof filters == 'function' &&
      /^\w*\s*\(\s*\)/.test(filters.toString())
    ) {
      return (filters as FilterFn2)() as T;
    }
  }
  protected async syncFromOnline(
    offlineDocs: IDocStore<T>[],
    onlineResult: T[] | void,
    filters?: Filters,
    syncCb?: (docs: IDocStore<T>[]) => void
  ) {
    if (!onlineResult) return;
    const mergedDocs = offlineDocs.filter((offlineDoc) => {
      const matchedRecordOnline = onlineResult.find(
        (onlineRecord) =>
          this.getKeyOf(onlineRecord) === this.getKeyOf(offlineDoc.data) ||
          this.getKeyOf(onlineRecord) === offlineDoc.key
      );
      if (matchedRecordOnline) {
        offlineDoc.data =
          offlineDoc.status === 'synced'
            ? matchedRecordOnline
            : offlineDoc.data;
        return true;
      }
      return false;
    });
    const newOnlineRecords = onlineResult.filter(
      (onlineRecord) =>
        !mergedDocs.find(
          (mergeRecord) =>
            mergeRecord.key === this.getKeyOf(onlineRecord) ||
            this.getKeyOf(mergeRecord.data) == this.getKeyOf(onlineRecord)
        )
    );
    const newLocalDocs = offlineDocs.filter(
      (offlineDoc) =>
        /^(error|createError|saved)$/.test(offlineDoc.status) &&
        !mergedDocs.find((i) => i.key == offlineDoc.key)
    );
    const onlineDeletedDocs = offlineDocs.filter(
      (offlineDoc) =>
        (offlineDoc.status !== 'synced' ||
          !mergedDocs.find((mergeDoc) => mergeDoc.key === offlineDoc.key)) &&
        this.matchesFilter(offlineDoc.data, filters)
    );
    //delete from local the deleted
    await Promise.all(
      (onlineDeletedDocs || []).map((onlineDeletedDoc) => {
        return this.localBase.deleteItem(
          onlineDeletedDoc.key || this.getKeyOf(onlineDeletedDoc.data)
        );
      })
    );

    let updatedDocs: IDocStore<T>[] = [];

    //update online data from merged
    for (const mergeDoc of mergedDocs || []) {
      updatedDocs.push(
        mergeDoc.status == 'synced'
          ? await this.saveDoc(mergeDoc.key, {
              ...mergeDoc,
            })
          : mergeDoc
      );
    }

    for (const newOnlineRecord of newOnlineRecords) {
      const key = String(this.getKeyOf(newOnlineRecord));
      const doc = await this.saveDoc(key, {
        key,
        data: newOnlineRecord,
        status: 'synced',
      } as IDocStore<T>);
      updatedDocs.push(doc);
    }
    updatedDocs = updatedDocs.concat(newLocalDocs);
    syncCb?.call(this, updatedDocs);
    //replace offline memory from updated
    offlineDocs.splice(0, offlineDocs.length, ...(updatedDocs || []));
    return [...updatedDocs];
  }
  private criticalSection = Promise.resolve(true);
  private async enterCritical() {
    await this.criticalSection;
    const deffered = new DeferredPromise<boolean>();
    this.criticalSection = deffered.promise;
    return deffered;
  }
  private streamMap = new Map<string, Observable<IDocStore<T>[]>>();
  protected dataFilterPart(filters?: Filters) {
    if (!filters || typeof filters != 'object') return filters;
    return Object.keys(filters).reduce((prev, cur) => {
      if (typeof filters[cur] != 'undefined')
        prev['data.' + cur] = filters[cur];
      return prev;
    }, {} as FilterPart);
  }

  protected isMatch(a: T, b: T) {
    return this.getKeyOf(a) == this.getKeyOf(b);
  }
  protected matchesFilter(a: T, filters?: Filters) {
    if (!filters) return true;
    const f =
      typeof filters == 'function'
        ? ((filters as FilterFn2)() as FilterPart | string[])
        : filters;
    if (!Array.isArray(f) && typeof f == 'object') {
      const props = Object.keys(f);
      for (const prop of props) {
        if (
          typeof f[prop] != 'undefined' &&
          (a as FilterPart)[prop] != f[prop]
        ) {
          return false;
        }
      }
    } else if (f) {
      const filterIndex = 1;
      const isPegeable =
        Array.isArray(f) &&
        typeof f[0] == 'object' &&
        !!(f[0] as unknown as { rowsPerPage: number }).rowsPerPage;
      return this.filterCb(
        a,
        isPegeable ? (f[filterIndex] as unknown as string[]) : f
      );
    }
    return true;
  }
  protected async setDataStatus(
    key: string,
    status: 'saved' | 'synced' | 'updated' | 'deleted' | 'patched' = 'synced'
  ) {
    const doc = await this.getDoc(key);
    if (doc) {
      const oldStatus = doc.status;
      doc.status = status;
      await this.saveDoc(key, doc);
      return oldStatus;
    }
  }
  protected getKeyOf(v: T): string {
    if (typeof v == 'object') {
      if (
        this.keyField &&
        Object.prototype.hasOwnProperty.call(v, this.keyField) &&
        (v as unknown as { [key: string]: string })[this.keyField]
      ) {
        return (v as unknown as { [key: string]: string })[this.keyField];
      } else if (
        this.altKey &&
        Object.prototype.hasOwnProperty.call(v, this.altKey) &&
        (v as unknown as { [key: string]: string })[this.altKey]
      ) {
        return (v as unknown as { [key: string]: string })[this.altKey];
      } else if (
        Object.prototype.hasOwnProperty.call(v, 'key') &&
        (v as unknown as { key: string }).key
      ) {
        return (v as unknown as { key: string }).key;
      } else if (
        Object.prototype.hasOwnProperty.call(v, 'id') &&
        (v as unknown as { id: string }).id
      ) {
        return (v as unknown as { id: string }).id;
      } else if (
        Object.prototype.hasOwnProperty.call(v, 'code') &&
        (v as unknown as { code: string }).code
      ) {
        return (v as unknown as { code: string }).code;
      } else {
        return this.hashName(JSON.stringify(v)).toString().replace('-', 'N');
      }
    } else {
      return this.hashName(String(v)).toString().replace('-', 'N');
    }
  }

  /**
   * Find records online
   * @param filters
   * @param syncCb
   * @returns
   */
  async findAllFrom(
    filters?: Filters,
    syncCb?: (records: T[]) => void
  ): Promise<T[]> {
    const result: IDocStore<T>[] = await this.findAllDocFrom(
      filters,
      (docs) => {
        syncCb?.call(
          this,
          docs.map((d) => d.data)
        );
      }
    );
    return result.map((d) => this.mapDoc(d));
  }
  /**
   * Find All Docs Online / Offline
   * Offline First: resolves with OFFLINE data if online exceeds delay
   * @param filters
   * @param syncCb
   * @returns
   */
  async findAllDocFrom(
    filters?: Filters,
    syncCb?: (docs: IDocStore<T>[]) => void
  ): Promise<IDocStore<T>[]> {
    let result: IDocStore<T>[] = [];
    if (this.getAllCb) {
      result = (
        (await this.localBase.paginatedValues<IDocStore<T>>(filters))
          .contents || []
      )
        .map((d) => this.retrieveDoc(d))
        .filter((d) => {
          if (d) {
            return this.matchesFilter(d.data, filters);
          }
        }) as IDocStore<T>[];

      if (this.shouldSyncOn('synced')) {
        if (typeof syncCb == 'function') {
          let reject: undefined | ((reason: string) => void);
          this.getAllCb(filters).then(
            async (onlineResult) => {
              if (onlineResult) {
                await this.syncFromOnline(
                  result,
                  onlineResult,
                  filters,
                  syncCb
                );
              } else {
                syncCb?.call(this, result);
              }
            },
            (e) => {
              reject && reject(e);
            }
          );
          await new Promise<void>((r, rej) => {
            reject = rej;
            setTimeout(() => {
              reject = undefined;
              r();
            }, this.requestDelay);
          });
        } else {
          const onlineResult = await this.getAllCb(filters);
          if (onlineResult) {
            return (
              (await this.syncFromOnline(result, onlineResult, filters)) ||
              result
            );
          }
        }
      }
    }
    return result;
  }

  async findAll(
    filters?: Filters,
    page?: Pagination<T>
  ): Promise<Pagination<T>> {
    const paginated = await this.localBase.paginatedValues<IDocStore<T>>(
      filters,
      page
    );
    return {
      ...paginated,
      contents: await Promise.all(
        (paginated.contents || [])
          .map((d) => this.mapDoc(d))
          .filter((d) => {
            return this.matchesFilter(d, filters);
          })
      ),
    };
  }
  /**
   * Find All Documents Offline
   * @param filters
   * @param page
   * @returns
   */
  async findAllDoc(filters?: Filters, status?: DocStatus) {
    const docs = await this.localBase.values<IDocStore<T>>();
    return (docs || [])
      .filter((d) => !status || status == d.status)
      .map((d) => this.retrieveDoc(d) || d)
      .filter((d) => !filters || this.matchesFilter(d.data, filters));
  }
  async findOne(filters?: Filters): Promise<T | undefined> {
    const all = await this.findAllFrom(filters);
    return all && all[0];
  }
  async saveAllTo(values: T[]) {
    return Promise.all(
      values.map((v) => {
        return v && this.setData(String(this.getKeyOf(v)), v);
      })
    );
  }
  async saveEachTo(values: T[], status?: DocStatus) {
    const saved: IDocStore<T>[] = [];
    while (values.length) {
      const v = values.splice(0, 1)[0];
      if (v) {
        const doc = await this.save(String(this.getKeyOf(v)), v, status);
        if (doc) {
          saved.push(doc);
        }
      }
    }
    return saved;
  }
  subscribeOn(
    docOrKey: IDocStore<T> | string,
    cb: (docStatus: StatusUpdate) => void
  ) {
    const subject = `${this.entity}:${
      typeof docOrKey == 'string' ? docOrKey : docOrKey.key
    }`;
    this.onSubscribe?.call(this, subject, cb);
  }
  async syncDoc(doc: IDocStore<T> | string) {
    const targetDoc = await this.getDoc(typeof doc == 'string' ? doc : doc.key);
    return targetDoc && this.manageDocCallback(targetDoc, true);
  }
  resumeSyncing(syncOn?: DocStatus[], timeout?: number) {
    this.syncingOn = syncOn || true;
    if (timeout && typeof timeout == 'number') {
      setTimeout(() => (this.syncingOn = false), timeout);
    }
  }
  stopSyncing(timeout?: number) {
    this.syncingOn = false;
    if (timeout && typeof timeout == 'number') {
      setTimeout(() => {
        this.syncingOn = true;
      }, timeout);
    }
  }
  synchingDoc(doc: IDocStore<T> | string, lapse = 20 * 1000) {
    if (
      (typeof doc == 'object' && doc.status != 'synced') ||
      typeof doc == 'string'
    ) {
      const key = typeof doc == 'object' ? doc.key : doc;
      return new Promise<typeof doc>((resolve, reject) => {
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          reject('synching timeout');
        }, lapse);
        const subscription = this.streamDocWith({ key }).subscribe({
          next(value) {
            if (value.length == 1 && value[0].status != 'syncing') {
              subscription.unsubscribe();
              clearTimeout(timeout);
              resolve(value[0]);
            }
          },
          error(er) {
            reject(er);
          },
        });
      });
    }
    return doc;
  }
  async synchingData(key: string, lapse?: number) {
    const doc = await this.getDoc(key);
    return this.synchingDoc(doc ?? key, lapse);
  }
  async save(
    key: string,
    value: T,
    createOnlyOrStatus: boolean | DocStatus = false,
    cb?: (status: StatusUpdate) => void,
    remarks?: string
  ): Promise<IDocStore<T> | undefined> {
    const identity = String(key || this.getKeyOf(value));
    let existing = identity && (await this.getDocByIdentity(identity));
    if (createOnlyOrStatus === true && existing) {
      throw new Error('Record already exist');
    }
    const synched = existing; // && existing.status == 'syncing' && await this.synchingDoc(existing);
    if (typeof synched == 'object') existing = synched;
    if (existing && existing.status == 'synced') {
      const status =
        typeof createOnlyOrStatus == 'string'
          ? createOnlyOrStatus
          : this.isSame(existing.data, value)
          ? 'synced'
          : 'updated';
      existing.modifiedDate =
        status != existing.status || !existing.modifiedDate
          ? new Date()
          : existing.modifiedDate;
      existing.status = status;
      existing.data = value;
      existing.remarks = [existing.remarks, remarks]
        .filter((f) => f)
        .join('\n');
      await this.saveDoc(identity, existing);
      if (existing.status != 'synced') {
        if (cb) {
          this.subscribeOn(existing, cb);
          this.manageDocCallback(existing);
        } else {
          const deffered = new DeferredPromise<IDocStore<T>>();
          this.subscribeOn(existing, async (docStatus) => {
            if (docStatus.status == 'synced') {
              const updated = await this.getDoc(
                docStatus.newKey || docStatus.key || ''
              );
              if (updated) {
                deffered.resolve(updated);
              } else {
                deffered.reject('Failed to Write');
              }
            }
          });
          this.manageDocCallback(existing);
          return deffered.promise;
        }
      }
      return existing;
    }
    value.key = value.key || identity;
    const doc =
      identity &&
      (await this.saveDoc(identity, {
        data: value,
        key: identity,
        modifiedDate: new Date(),
        status:
          typeof createOnlyOrStatus == 'string' ? createOnlyOrStatus : 'saved',
        remarks: remarks,
      } as IDocStore<T>));
    if (typeof doc == 'object') {
      if (typeof cb == 'function') {
        this.subscribeOn(doc, cb);
      }
      await this.manageDocCallback(doc);
      if (doc.status == 'synced' && typeof cb == 'function') {
        cb({
          module: '',
          entity: this.entity,
          status: 'synced',
          key,
          newKey: doc.key,
        });
        if (key && doc.key && key != doc.key) {
          await this.localBase.deleteItem(key);
        }
      }
      return doc;
    }
  }
  /**
   * Create or update existing record if exists
   * @param key
   * @param value
   * @returns
   */
  async setData(
    key: string,
    value: T,
    createOnlyOrStatus: boolean | DocStatus = false,
    cb?: (status: StatusUpdate) => void,
    remarks?: string
  ): Promise<T | undefined> {
    const doc = await this.save(key, value, createOnlyOrStatus, cb, remarks);
    return doc?.data;
  }
  /**
   * Update existing record
   * does nothing if record does not exist
   * @param key
   * @param value
   * @returns
   */
  async updateData(key: string, value: T, cb?: (status: StatusUpdate) => void) {
    const existing = await this.getDoc(key);
    if (existing) {
      existing.data = value;
      await this.saveDoc(String(key), existing);
      await this.setDataStatus(existing.key, 'updated');
      existing.status = 'updated';
      cb && this.subscribeOn(existing, cb);
      this.manageDocCallback(existing);
      return existing.data;
    }
  }
  async updateProperty(
    key: string,
    prop: keyof T,
    value: unknown,
    cb?: (status: StatusUpdate) => void
  ) {
    return this.updatePropertiesFrom(
      key,
      {
        [prop]: value,
      } as Partial<T>,
      [prop],
      cb
    );
  }
  async updatePropertiesFrom(
    key: string,
    source: Partial<T>,
    props: (keyof T)[],
    cb?: (status: StatusUpdate) => void
  ) {
    let existing = await this.getDoc(key);
    if (!existing) await this.getData(key);
    existing = await this.getDoc(key);
    if (!existing || typeof existing.data != 'object') return;
    let diff = 0;
    for (const prop of props) {
      const oldData = existing.data[prop];
      if (oldData == source[prop]) continue;
      (existing.data as unknown as Record<string, string>)['*' + String(prop)] =
        (typeof oldData != 'undefined'
          ? oldData
          : typeof source[prop] == 'number'
          ? 0
          : typeof source[prop] == 'boolean'
          ? false
          : typeof source[prop] == 'string'
          ? ''
          : oldData) as unknown as string;
      existing.data[prop] = (
        typeof source[prop] != 'undefined' ? source[prop] : existing.data[prop]
      ) as T[keyof T];
      diff++;
    }
    if (diff > 0) {
      existing.modifiedDate = new Date();
      await this.saveDoc(key, existing);
      const status = /^(synced|updated|patched|updateError|patchError)$/.test(
        existing.status
      )
        ? 'patched'
        : 'saved';
      await this.setDataStatus(existing.key, status);
      existing.status = status;
      cb && this.subscribeOn(existing, cb);
      this.manageDocCallback(existing);
    } else {
      cb &&
        cb({
          status: existing.status,
          entity: this.entity,
          module: '',
          key: existing.key,
        });
    }
    return existing;
  }
  /**
   * Get Doc Offline
   * @param key
   * @returns
   */
  async getDoc(key: string) {
    return await this.getDocByIdentity(key);
  }
  async getDocStatus(key: string) {
    return (await this.getDocByIdentity(key))?.status;
  }
  async getData(key: string): Promise<T | undefined> {
    const doc = await this.getDocByIdentity(key);
    if (doc) {
      this.manageDocCallback(doc, true);
      await new Promise((r) => setTimeout(r, this.requestDelay));
      return doc.data;
    } else if (this.shouldSyncOn('synced')) {
      try {
        const data = await this.getCb(key);
        if (typeof data == 'object') {
          const identity = this.getKeyOf(data);
          await this.setData(String(identity), data, 'synced');
          return data;
        }
      } catch (e) {}
    }
    return doc;
  }
  /**
   * Get Offline Data
   * @param key
   * @returns
   */
  async getLocalData(key: string): Promise<T | undefined> {
    return (await this.getDocByIdentity(key))?.data;
  }
  async count() {
    return this.localBase.length();
  }
  async deleteData(key: string, cb?: (status: StatusUpdate) => void) {
    const doc = await this.getDoc(key);
    if (doc) {
      doc.status = 'deleted';
      if (this.shouldSyncOn('deleted')) {
        await this.deleteCb(doc.data);
        cb?.call(this, {
          fromStatus: 'deleted',
          status: undefined as unknown as DocStatus,
          module: '',
          entity: this.entity,
          key,
        });
      } else {
        doc.status = 'deleted';
        doc.modifiedDate = new Date();
        await this.saveDoc(doc.key, doc);
        cb && this.subscribeOn(doc, cb);
        return;
      }
    }
    await this.localBase.deleteItem(key);
    return doc?.data;
  }
  async deleteAll() {
    if (this.deleteAllCb) {
      await this.deleteAllCb();
    }
    this.localBase.deleteAll();
  }

  filterToStr(filters?: Filters<Entity> | undefined) {
    if (!filters) return 'all';
    const f =
      typeof filters == 'function'
        ? ((filters as FilterFn2)() as FilterPart)
        : (filters as FilterPart);
    return Object.keys(f).reduce(
      (p, c, i) =>
        p + `${i > 0 ? ';' : ''}${c}:${(f as Record<string, string>)[c]} `,
      ''
    );
  }
  streamDocWith(
    filters?: Filters<Entity> | undefined,
    options?: {
      limits?: number;
      orderBy?: string;
      order?: 'asc' | 'desc';
    }
  ): Observable<IDocStore<T>[]> {
    const filterStr = this.filterToStr(filters);
    let activeStream = this.streamMap.get(filterStr);
    if (activeStream && !options) {
      return activeStream;
    }
    const onlineObservable = this.streamCb(filters, options);
    let offlineDocs: IDocStore<T>[] | undefined;
    const offline = new Observable<IDocStore<T>[]>((subscriber) => {
      this.findAllDoc(filters).then((response) => {
        offlineDocs = response;
        if (offlineDocs) {
          subscriber.next(offlineDocs);
        } else {
          subscriber.next([]);
        }
        subscriber.complete();
      });
    });
    if (!(onlineObservable instanceof Observable)) {
      return offline;
    }

    const online = onlineObservable.pipe(
      switchMap(async (list) => {
        if (offlineDocs) {
          const updated = await this.syncFromOnline(offlineDocs, list, filters);
          return (
            updated ||
            Promise.all(
              list.map(
                async (d) =>
                  (await this.getDoc(this.getKeyOf(d))) as IDocStore<T>
              )
            )
          );
        } else {
          return this.saveEachTo(list, 'synced');
        }
      })
    );
    activeStream = merge(offline, online);
    this.streamMap.set(filterStr, activeStream);
    return activeStream;
  }
  streamWith(
    filters?: Filters<Entity> | undefined,
    options?: {
      limits?: number;
      orderBy?: string;
      order?: 'asc' | 'desc';
    }
  ): Observable<T[]> {
    return this.streamDocWith(filters, options).pipe(
      map((docs) => docs.map((d) => d.data))
    );
  }
}
