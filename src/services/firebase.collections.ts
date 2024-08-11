import { Firestore, collection } from 'firebase/firestore';
export function getCollections(fbStore: Firestore) {
  return {
    profiles: () => collection(fbStore, 'profiles'),
    institutions: () => collection(fbStore, 'institutions'),
    medias: () => collection(fbStore, 'medias'),
    draws: () => collection(fbStore, 'draws'),
    participants: () => collection(fbStore, 'participants'),
    prices: () => collection(fbStore, 'prices'),
    summits: () => collection(fbStore, 'summits'),
    speakers: () => collection(fbStore, 'speakers'),
    topics: () => collection(fbStore, 'topics'),
    sponsors: () => collection(fbStore, 'sponsors'),
  };
}
