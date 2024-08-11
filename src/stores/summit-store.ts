import { defineStore } from 'pinia';
import { ISpeaker, ISponsor, ISummit, ITopic } from 'src/entities';
import { DeferredPromise } from 'src/resources/localbase';
import { speakersResource } from 'src/resources/speaker.resource';
import { sponsorsResource } from 'src/resources/sponsor.resource';
import { summitsResource } from 'src/resources/summit.resource';
import { topicsResource } from 'src/resources/topic.resource';
import { firebaseService } from 'src/services/firebase.service';

export const useSummitStore = defineStore('summit', {
  state: () =>
    ({} as {
      activeSummit?: ISummit;
    }),
  getters: {},
  actions: {
    async createSummit(payload: ISummit) {
      const newPayload = firebaseService.clone(payload);
      return summitsResource.setData('', newPayload, true);
    },
    async getSummit(key: string) {
      if (key == this.activeSummit?.key) return this.activeSummit;
      const summit = await summitsResource.getData(key);
      if (summit?.year == new Date().getFullYear().toString()) {
        this.activeSummit = summit;
      }
      return summit;
    },
    async updateSummitProp<T extends keyof ISummit, V = ISummit[T]>(
      key: string,
      prop: T,
      value: V
    ) {
      const deferred = new DeferredPromise<void>();
      summitsResource.updateProperty(key, prop, value, (status) => {
        if (status.status == 'synced') {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    async updateSummit<T extends keyof ISummit>(
      key: string,
      props: T[],
      source: Partial<ISummit>
    ) {
      const deferred = new DeferredPromise<ISummit | undefined>();
      summitsResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await summitsResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await summitsResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update ISummit');
          }
        }
      );
      return deferred.promise;
    },
    streamSummits() {
      return summitsResource.streamWith();
    },
    //{speaker}
    async registerSpeaker(payload: ISpeaker) {
      const newPayload = firebaseService.clone(payload);
      return speakersResource.setData('', newPayload, true);
    },
    streamSpeakers(summit: string) {
      return speakersResource.streamWith({
        summit,
      });
    },
    countSpeakers(filter?: Partial<ISpeaker>) {
      return speakersResource.count(filter);
    },
    findSpeakers(filter?: Partial<ISpeaker>) {
      return speakersResource.findAllFrom(filter);
    },
    async updateSpeakerProp<T extends keyof ISpeaker, V = ISpeaker[T]>(
      key: string,
      prop: T,
      value: V
    ) {
      const deferred = new DeferredPromise<void>();
      speakersResource.updateProperty(key, prop, value, (status) => {
        if (status.status == 'synced') {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    async updateSpeaker<T extends keyof ISpeaker>(
      key: string,
      props: T[],
      source: Partial<ISpeaker>
    ) {
      const deferred = new DeferredPromise<ISpeaker | undefined>();
      speakersResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await speakersResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await speakersResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update Speaker');
          }
        }
      );
      return deferred.promise;
    },
    streamSpeakerUpdate(payload: ISpeaker) {
      return speakersResource.streamWith({
        key: payload.key,
      });
    },
    //{topic}
    async registerTopic(payload: ITopic) {
      const newPayload = firebaseService.clone(payload);
      return topicsResource.setData('', newPayload, true);
    },
    streamTopics(summit: string) {
      return topicsResource.streamWith({
        summit,
      });
    },
    countTopics(filter?: Partial<ITopic>) {
      return topicsResource.count(filter);
    },
    findTopics(filter?: Partial<ITopic>) {
      return topicsResource.findAllFrom(filter);
    },
    async updateTopicProp<T extends keyof ITopic, V = ITopic[T]>(
      key: string,
      prop: T,
      value: V
    ) {
      const deferred = new DeferredPromise<void>();
      topicsResource.updateProperty(key, prop, value, (status) => {
        if (status.status == 'synced') {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    async updateTopic<T extends keyof ITopic>(
      key: string,
      props: T[],
      source: Partial<ITopic>
    ) {
      const deferred = new DeferredPromise<ITopic | undefined>();
      topicsResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await topicsResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await topicsResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update Topic');
          }
        }
      );
      return deferred.promise;
    },
    streamTopicUpdate(payload: ITopic) {
      return topicsResource.streamWith({
        key: payload.key,
      });
    },

    //{sponsor}
    async registerSponsor(payload: ISponsor) {
      const newPayload = firebaseService.clone(payload);
      return sponsorsResource.setData('', newPayload, true);
    },
    streamSponsors(summit: string) {
      return sponsorsResource.streamWith({
        summit,
      });
    },
    countSponsors(filter?: Partial<ISponsor>) {
      return sponsorsResource.count(filter);
    },
    findSponsors(filter?: Partial<ISponsor>) {
      return sponsorsResource.findAllFrom(filter);
    },
    async updateSponsorProp<T extends keyof ISponsor, V = ISponsor[T]>(
      key: string,
      prop: T,
      value: V
    ) {
      const deferred = new DeferredPromise<void>();
      sponsorsResource.updateProperty(key, prop, value, (status) => {
        if (status.status == 'synced') {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    async updateSponsor<T extends keyof ISponsor>(
      key: string,
      props: T[],
      source: Partial<ISponsor>
    ) {
      const deferred = new DeferredPromise<ISponsor | undefined>();
      sponsorsResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await sponsorsResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await sponsorsResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update Sponsor');
          }
        }
      );
      return deferred.promise;
    },
    streamSponsorUpdate(payload: ISponsor) {
      return sponsorsResource.streamWith({
        key: payload.key,
      });
    },
  },
});
