import { Firestore, collection } from 'firebase/firestore';
export function getCollections(fbStore: Firestore) {
  return {
    profiles: () => collection(fbStore, 'profiles'),
    institutions: () => collection(fbStore, 'institutions'),
    medias: () => collection(fbStore, 'medias'),
    draws: () => collection(fbStore, 'draws'),
    participants: () => collection(fbStore, 'participants'),
    winners: () => collection(fbStore, 'winners'),
    prices: () => collection(fbStore, 'prices'),
  };
}
