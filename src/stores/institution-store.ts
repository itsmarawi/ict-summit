import { defineStore } from 'pinia';
import { IInstitution } from 'src/entities/institution.entities';
import { institutionResource } from 'src/resources';
import { DeferredPromise } from 'src/resources/localbase';
import { firebaseService } from 'src/services/firebase.service';

export const useInstitutionStore = defineStore('institution', {
  state: () => ({}),
  getters: {},
  actions: {
    async createInstitution(payload: IInstitution) {
      const newPayload = firebaseService.clone(payload);
      return institutionResource.setData('', newPayload, true);
    },
    async reloadInstitution(key: string) {
      const doc = await institutionResource.getDoc(key);
      if (doc?.status == 'synced') {
        return doc.data;
      }
      return (await firebaseService.get('institutions', key)) as IInstitution;
    },
    async getInstitution(key: string) {
      const institution = await institutionResource.getData(key);

      return institution;
    },

    async findInstitutionByKey(key: string) {
      return institutionResource.findOne({ key: key });
    },
    async findInstitutionByName(name: string) {
      return institutionResource.findOne({ instName: name });
    },
    streamAll(filter?: Record<string, string>) {
      return institutionResource.streamWith(filter);
    },
    async updateInstitutionProp<
      T extends keyof IInstitution,
      V = IInstitution[T]
    >(key: string, prop: T, value: V) {
      const deferred = new DeferredPromise<void>();
      institutionResource.updateProperty(key, prop, value, (status) => {
        if (status.status == 'synced') {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    async updateInstitution<T extends keyof IInstitution>(
      key: string,
      props: T[],
      source: Partial<IInstitution>
    ) {
      const deferred = new DeferredPromise<IInstitution | undefined>();
      institutionResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await institutionResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await institutionResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update Institution');
          }
        }
      );
      return deferred.promise;
    },
  },
});
