import { defineStore } from 'pinia';
import { IProfile, RaffleDraw } from 'src/entities';
import { raffleDrawsResource, raffleWinnersResource } from 'src/resources';
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
      const payload = {
        key: '',
        draw: raffle.key,
        participant: firebaseService.clone(participant),
      };
      const existing = await raffleParticipantsResource.getData(
        raffleParticipantsResource.getKeyOf(payload)
      );
      if (existing) return existing;
      const result = await raffleParticipantsResource.setData('', payload);
      const prices = await Promise.all(
        (raffle.defaultPrices || []).map((price) => {
          return this.sendRafflePrice(raffle, `Freebie:${price}`, participant);
        })
      );
      return prices.length ? prices : result;
    },
    streamRaffleParticipants(raffle: RaffleDraw) {
      return raffleParticipantsResource.streamWith({
        draw: raffle.key,
      });
    },
    //{winners}
    async setRaffleWinner(raffle: RaffleDraw, participant: IProfile) {
      const winner = await raffleWinnersResource.setData('', {
        key: '',
        draw: raffle.key,
        winner: firebaseService.clone(participant),
      });
      await Promise.all(
        raffle.winnerPrices.map((price) => {
          return this.sendRafflePrice(raffle, `Winner:${price}`, participant);
        })
      );
      return winner;
    },
    streamRaffleWinners(raffle: RaffleDraw) {
      return raffleWinnersResource.streamWith({
        draw: raffle.key,
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
        recipient: firebaseService.clone(participant),
      });
    },
    streamRafflePrices(raffle: RaffleDraw) {
      return raffleWinnersResource.streamWith({
        draw: raffle.key,
      });
    },
    streamParticipantPrices(profile: IProfile) {
      return raffleWinnersResource.streamWith({
        'recipient.key': profile.key,
      });
    },
  },
});
