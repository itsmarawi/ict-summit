import { Observable } from 'rxjs';
import { BaseResource } from './base.resource';
type SessionValue = object;

class SessionResource extends BaseResource<SessionValue> {
  protected streamCb(): void | Observable<object[]> {
    throw new Error('Method not implemented.');
  }
  protected async getCb(): Promise<boolean | void | object> {
    //
  }
  protected async createCb() {
    //
    return true;
  }
  protected async deleteCb(): Promise<boolean> {
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(): Promise<void> {
    //
  }
  protected async updateCb() {
    return true;
  }
  protected patchCb(): Promise<boolean | void | object> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('session')
  }

}
export const sessionResource = new SessionResource();
sessionResource.resumeSyncing();
