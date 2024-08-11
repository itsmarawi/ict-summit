import { defineStore } from 'pinia';
import { firebaseService } from 'src/services/firebase.service';

export const useMediaStore = defineStore('media', {
  state: () => ({}),
  getters: {},
  actions: {
    uploadImage(file: File, path: string) {
      return new Promise<string | undefined>((resolve) => {
        if (file) {
          resolve(
            firebaseService.uploadImage(file, {
              path,
            })
          );
        } else {
          resolve(undefined);
        }
      });
    },
    listMedia(path: string) {
      return firebaseService.listAll(path);
    },
  },
});
