import axios from 'axios';
import { IMedia } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { KeyValueStorage } from './localbase';

class MediaResource extends BaseResource<IMedia> {
  cache = new KeyValueStorage('cache');
  protected streamCb(filters?: Filters<Entity> | undefined): void {
    throw new Error(`Method not implemented.${filters}`);
  }
  protected async getCb(key: string): Promise<boolean | void | IMedia> {
    return (await firebaseService.get('medias', key)) as IMedia;
  }
  protected async createCb(data: IMedia): Promise<boolean | void | IMedia> {
    return (await firebaseService.create('medias', data)) as IMedia;
  }
  protected async deleteCb(data: IMedia): Promise<boolean | void | IMedia> {
    await firebaseService.delete('medias', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | IMedia[]> {
    return (await firebaseService.findAll(
      'medias',
      filters as { [field: string]: string }
    )) as IMedia[];
  }
  protected async updateCb(data: IMedia): Promise<boolean | void | IMedia> {
    await firebaseService.update('medias', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | IMedia> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('media');
  }
  async cacheHttpUrl(httpUrl: string) {
    const item = await this.cache.getItem(httpUrl);
    try {
      const dataUrl = await this.imageUrlToData(httpUrl);
      dataUrl && (await this.cache.setItem(httpUrl, dataUrl));
      return dataUrl || httpUrl;
    } catch {
      return (item || httpUrl) as string;
    }
  }
  async fetchImageUrl(url: string) {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const dataUrl = URL.createObjectURL(blob);
    URL.revokeObjectURL(dataUrl);
    return url;
  }
  async imageUrlToData(url: string) {
    return new Promise<string>((resolve) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx?.drawImage(image, 0, 0);
        resolve(canvas.toDataURL());
      };
      image.onerror = async () => {
        try {
          const file = await this.getFileFromHttp(image.src || url);
          const dataUrl = await this.getDataUrl(file);
          resolve(dataUrl || url);
        } catch {
          resolve(url);
        }
      };
      image.crossOrigin = 'anonymous';
      image.src = url;
    });
  }
  async getFileFromHttp(url: string) {
    const response = await axios.get(url, { responseType: 'blob' });

    return response.data as Blob;
  }
  async getDataUrl(file: Blob): Promise<string | undefined> {
    if (file) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener(
          'load',
          () => {
            resolve(reader.result as string);
          },
          false
        );
        reader.addEventListener('error', (e) => reject(e));
        reader.readAsDataURL(file);
      });
    }
  }
}
export const mediaResource = new MediaResource();
