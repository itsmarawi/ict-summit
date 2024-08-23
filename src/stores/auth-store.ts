import { defineStore } from 'pinia';
import { firebaseService } from '../services/firebase.service';
import { useProfileStore } from './profile-store';
import { institutionResource, profileResource } from 'src/resources';
export interface IAuth {
  key?: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
}
export const useAuthStore = defineStore('auth', {
  state: () =>
    ({
      email: '',
      password: '',
    } as IAuth),
  getters: {},
  actions: {
    async signup(payload: IAuth, institution?: string) {
      const profileStore = useProfileStore();
      const { email, password } = payload;
      const user = await firebaseService.createUserWithEmailPass(
        email,
        password
      );
      const profilePayload = {
        key: user.user.uid,
        name: payload.name,
        avatar: '#',
      };
      await profileStore.updateProfile(profilePayload);
      const theUser = await profileStore.getUserAsync();
      if (theUser) {
        await profileResource.synchingData(theUser.key);
        await new Promise((resolve) => setTimeout(resolve, 4 * 1000));
        const initialSetup =
          (institution == 'ITS' &&
            !(await institutionResource.getData(institution))) ||
          false;
        const status = initialSetup;
        const role = initialSetup ? 'admin' : '';
        theUser.institution = institution;
        theUser.status = status;
        theUser.role = role;
        await profileResource.updatePropertiesFrom(
          theUser.key,
          {
            institution,
            status,
            role,
          },
          ['institution', 'status', 'role']
        );
      }
      return user;
    },
    async login(email: string, password: string) {
      return firebaseService.signInWithEmailAndPass(email, password);
    },
    async googleLogin() {
      return firebaseService.signInWithGoogleRedirect();
    },
    async logout() {
      useProfileStore().clearUser();
      return firebaseService.signOut();
    },
    async forgetPassword(email: string) {
      return firebaseService.forgetPassword(email);
    },
    async verifyUserEmail(email: string) {
      const value = await firebaseService.fetchSignInMethodsForEmail(email);
      return value.length;
    },
    async resendEmailVerification() {
      await firebaseService.resendEmailVerification();
    },
  },
});
