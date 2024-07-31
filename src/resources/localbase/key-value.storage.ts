/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateDBController, ITableInfo, Filters, Pagination } from './state-db.controller';

export interface KeyValue<T = any> {
  key: string;
  value: T;
};
const appStateTable: ITableInfo = {
  tableName: 'states',
  primaryKey: 'key'
};
type TObj = { [key: string]: string | TObj | TObj[] | unknown };
export class KeyValueStorage {
  private appDb: StateDBController;
  constructor(collection: string, version?: number) {
    this.appDb = new StateDBController(collection, [appStateTable], version);
  }
  async getItem<T>(key: string): Promise<T> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    const keyVal = await transaction?.ReadRow(key);
    return Promise.resolve(keyVal && keyVal.value);
  }
  async setItem<T>(key: string, value: T): Promise<T> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    const existing = (await transaction?.ReadRow(key))?.value;
    if (existing) {
      if (typeof existing == 'object' && typeof value == 'object') {
        const keys = Object.keys(value as unknown as object).concat(Object.keys(existing))
          .filter((value, index: number, self) => {
            return !!self.find(v => value == v);
          });
        const source = value as unknown as { [key: string]: string | unknown };
        const target = existing as { [key: string]: string | unknown };
        keys.forEach(key => {
          if ((typeof source[key] == 'string' && typeof target[key] == 'object') ||
            (typeof source[key] == 'undefined' && typeof target[key] != 'undefined')) {
            source[key] = target[key];
          }
        })
        value = this.cloneValue(value as unknown as TObj) as unknown as T;
      }
      const keyVal = await transaction?.UpdateRow({
        key: key,
        value: value
      });
      return keyVal && keyVal.value;
    } else {
      let keyVal;
      if (value && typeof value == 'object') {
        keyVal = await transaction?.CreateRow({
          key: key,
          value: this.cloneValue(value as unknown as TObj)
        });
      } else {
        keyVal = await transaction?.CreateRow({
          key: key,
          value: value
        });
      }
      return keyVal && keyVal.value;
    }
  }
  private cloneValue(value: TObj): TObj | TObj[] {
    if (value && value instanceof Array) {
      return [...value].map((v) => {
        if (v && typeof v == 'object') {
          return this.cloneValue(v as TObj);
        } else {
          return v;
        }
      });
    }
    else if (value && typeof value == 'object') {
      Object.keys(value).forEach((key) => {
        if (typeof value[key] == 'object') {
          value[key] = this.cloneValue(value[key] as TObj)
        }
      })
      value = { ...value };
    }
    return value;
  }
  async deleteAll(): Promise<void> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    return await transaction?.DeleteAll();
  }
  async deleteItem(key: string): Promise<any> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    const keyVal = await transaction?.DeleteRow(key);
    return Promise.resolve(keyVal && keyVal.value);
  }
  async paginatedValues<T>(filters?: Filters, page?: Pagination<unknown>) {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    if (transaction) {
      const result = await transaction.getData<{ key: string, value: T }>(filters, page);
      const values = (result?.contents || []).map(kv => kv.value);
      return {
        page: result.page,
        rowsPerPage: result.rowsPerPage,
        rowsNumber: result.rowsNumber,
        contents: values,
      }
    }
    return { page: 1, rowsPerPage: 10, rowsNumber: 0 };
  }
  async values<T>(): Promise<T[]> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    return (await transaction?.ReadAll() || []).map(
      kv => (kv.value)
    );
  }
  async keys(): Promise<string[]> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    return (await transaction?.ReadAll() || []).map(
      kv => (kv.key)
    );
  }
  async length() {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    return (await transaction?.Count()) || 0;
  }
  /**Global */
  private static appDb: StateDBController = new StateDBController('globalDb', [appStateTable]);
  static async getItem(key: string): Promise<any> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    const keyVal = await transaction?.ReadRow(key);
    return Promise.resolve(keyVal && keyVal.value);
  }
  static async setItem(key: string, value: any): Promise<any> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    const existing = await this.getItem(key);
    if (existing) {
      if (typeof existing == 'object' && typeof value == 'object') {
        const keys = Object.keys(value);
        const source = value as { [key: string]: string | unknown };
        const target = existing as { [key: string]: string | unknown };
        keys.forEach(key => {
          if (!(typeof source[key] == 'string' && typeof target[key] == 'object')
            || typeof target[key] == 'undefined') {
            target[key] = source[key]
          }
        })
      }
      const keyVal = await transaction?.UpdateRow({
        key: key,
        value: value
      });
      return keyVal && keyVal.value;
    } else {
      const keyVal = await transaction?.CreateRow({
        key: key,
        value: value
      });
      return keyVal && keyVal.value;
    }
  }
  static async deleteItem(key: string): Promise<any> {
    const transaction = await this.appDb.transact<KeyValue>(appStateTable);
    const keyVal = await transaction?.DeleteRow(key);
    return Promise.resolve(keyVal && keyVal.value);
  }
}
