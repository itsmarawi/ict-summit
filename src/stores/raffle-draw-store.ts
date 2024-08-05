import { defineStore } from 'pinia';
import {
  IProfile,
  RaffleDraw,
  RaffleParticipant,
  RafflePrice,
} from 'src/entities';
import { raffleDrawsResource } from 'src/resources';
import { DeferredPromise } from 'src/resources/localbase';
import { raffleParticipantsResource } from 'src/resources/raffle-participants.resource';
import { rafflePricesResource } from 'src/resources/raffle-prices.resource';
import { firebaseService } from 'src/services/firebase.service';

export const useRaffleDrawStore = defineStore('raffleDraw', {
  state: () => ({}),
  getters: {},
  actions: {
    async createRaffleDraw(payload: RaffleDraw) {
      const newPayload = firebaseService.clone(payload);
      return raffleDrawsResource.setData('', newPayload, true);
    },
    async reloadRaffleDraw(key: string) {
      const doc = await raffleDrawsResource.getDoc(key);
      if (doc?.status == 'synced') {
        return doc.data;
      }
      return (await firebaseService.get('draws', key)) as RaffleDraw;
    },
    async getRaffleDraw(key: string) {
      const RaffleDraw = await raffleDrawsResource.getData(key);
      return RaffleDraw;
    },

    async findRaffleDrawByKey(key: string) {
      return raffleDrawsResource.findOne({ key: key });
    },
    async findRaffleDrawByName(name: string) {
      return raffleDrawsResource.findOne({ instName: name });
    },
    streamAll(filter?: Record<string, string>) {
      return raffleDrawsResource.streamWith(filter);
    },
    streamUpdate(raffle: RaffleDraw) {
      return raffleDrawsResource.streamWith({
        key: raffle.key,
      });
    },
    async updateRaffleDrawProp<T extends keyof RaffleDraw, V = RaffleDraw[T]>(
      key: string,
      prop: T,
      value: V
    ) {
      const deferred = new DeferredPromise<void>();
      raffleDrawsResource.updateProperty(key, prop, value, (status) => {
        if (status.status == 'synced') {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    async deleteRaffle(key: string) {
      const exiting =
        (await raffleDrawsResource.getLocalData(key)) ||
        (await raffleDrawsResource.getData(key));
      if (exiting) {
        await raffleDrawsResource.deleteData(key);
      }
    },
    async updateRaffleDraw<T extends keyof RaffleDraw>(
      key: string,
      props: T[],
      source: Partial<RaffleDraw>
    ) {
      const deferred = new DeferredPromise<RaffleDraw | undefined>();
      raffleDrawsResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await raffleDrawsResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await raffleDrawsResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update RaffleDraw');
          }
        }
      );
      return deferred.promise;
    },
    //{participaints}
    async joinRaffle(raffle: RaffleDraw, participant: IProfile) {
      if (
        raffle.status == 'closed' ||
        /^(admin|moderator)$/.test(participant.role || '')
      ) {
        return;
      }
      const payload = {
        key: '',
        draw: raffle.key,
        participant: firebaseService.clone({
          ...participant,
          email: '',
          mobileNumber: '',
          tshirt: '',
          avatar: '',
          gender: '',
        }),
      };
      const existing = await raffleParticipantsResource.getData(
        raffleParticipantsResource.getKeyOf(payload)
      );
      if (existing) return existing;
      const result = await raffleParticipantsResource.setData('', payload);
      const prices = await Promise.all(
        (raffle.defaultPrices || []).map((price) => {
          return this.sendRafflePrice(
            raffle,
            `Freebie:${price}`,
            firebaseService.clone({
              ...participant,
              email: '',
              mobileNumber: '',
              tshirt: '',
              avatar: '',
              gender: '',
            })
          );
        })
      );
      return prices.length ? prices : result;
    },
    streamRaffleParticipants(raffle: RaffleDraw) {
      return raffleParticipantsResource.streamWith({
        draw: raffle.key,
      });
    },
    countParticipants(filter?: Partial<RaffleParticipant>) {
      return raffleParticipantsResource.count(filter);
    },
    findParticipants(filter?: Partial<RaffleParticipant>) {
      return raffleParticipantsResource.findAllFrom(filter);
    },
    //{winners}
    async setRaffleWinner(raffle: RaffleDraw, participant: RaffleParticipant) {
      await Promise.all([
        raffleParticipantsResource.updateProperty(participant.key, 'won', true),
        ...raffle.winnerPrices.map((price) => {
          return this.sendRafflePrice(
            raffle,
            `Winner:${price}`,
            firebaseService.clone({
              ...participant.participant,
              email: '',
              mobileNumber: '',
              tshirt: '',
              avatar: '',
              gender: '',
            })
          );
        }),
      ]);
      participant.won = true;
      return participant;
    },
    streamRaffleWinners(raffle: RaffleDraw) {
      return raffleParticipantsResource.streamWith({
        draw: raffle.key,
        won: true,
      });
    },
    //{prices}
    async sendRafflePrice(
      raffle: RaffleDraw,
      price: string,
      participant: IProfile
    ) {
      return await rafflePricesResource.setData('', {
        key: '',
        draw: raffle.key,
        price,
        status: 'ready',
        recipient: firebaseService.clone({
          ...participant,
          email: '',
          mobileNumber: '',
          tshirt: '',
          avatar: '',
          gender: '',
        }),
      });
    },
    streamRafflePrices(raffle: RaffleDraw) {
      return rafflePricesResource.streamWith({
        draw: raffle.key,
      });
    },
    streamParticipantPrices(profile: IProfile) {
      return rafflePricesResource.streamWith({
        'recipient.key': profile.key,
      });
    },
    async updateRafflePriceProp<
      T extends keyof RafflePrice,
      V = RafflePrice[T]
    >(key: string, prop: T, value: V) {
      const deferred = new DeferredPromise<void>();
      rafflePricesResource.updateProperty(key, prop, value, (status) => {
        if (status.status == 'synced') {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    async updateRafflePrice<T extends keyof RafflePrice>(
      key: string,
      props: T[],
      source: Partial<RafflePrice>
    ) {
      const deferred = new DeferredPromise<RafflePrice | undefined>();
      rafflePricesResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await rafflePricesResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await rafflePricesResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update RafflePrice');
          }
        }
      );
      return deferred.promise;
    },
    streamPriceUpdate(price: RafflePrice) {
      return rafflePricesResource.streamWith({
        key: price.key,
      });
    },
    async getRafflePriceDraw(key: string) {
      const price = await rafflePricesResource.getData(key);
      return price;
    },
  },
});
