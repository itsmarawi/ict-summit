import { defineStore } from 'pinia';
import { firebaseService } from '../services/firebase.service';
import { IProfile } from 'src/entities';
import { profileResource } from 'src/resources';
import { synchronizerConnection } from 'src/workers/synchronizer/synchronizer.connection';
import { DeferredPromise } from 'src/resources/localbase';
import { mediaResource } from 'src/resources/media.resource';

interface ProfileState {
  theUser?: IProfile;
  cache: IProfile[];
}

export const useProfileStore = defineStore('profile', {
  state: () =>
    ({
      cache: [],
      theUser: undefined,
    } as ProfileState),
  getters: {},
  actions: {
    getUser() {
      let user;
      let isLoggedIn = !this.theUser;
      const loggedUser =
        ((user = firebaseService.auth()) && {
          key: user?.uid || user?.email || '',
          avatar: user?.photoURL || '',
          email: user?.email || 'none',
          emailVerified: user?.emailVerified,
          name: user?.displayName || user?.email || 'none',
        }) ||
        undefined;
      isLoggedIn = isLoggedIn && !!this.theUser;
      if (isLoggedIn && loggedUser && loggedUser.key) {
        synchronizerConnection.setUserKey(loggedUser.key);
        profileResource.getData(loggedUser.key).then(async (old) => {
          if (old && loggedUser) {
            const doc = await profileResource.updatePropertiesFrom(
              loggedUser.key,
              {
                ...old,
                ...loggedUser,
              },
              ['emailVerified']
            );
            const newUser = doc?.data;
            this.theUser = newUser || this.theUser;
          } else if (loggedUser) {
            await profileResource.setData(loggedUser.key, { ...loggedUser });
          }
        });
      }
      if (this.theUser?.avatar && /^http/.test(this.theUser?.avatar)) {
        mediaResource.cacheHttpUrl(this.theUser.avatar).then((url) => {
          if (this.theUser) {
            this.theUser.avatar = (url && String(url)) || this.theUser.avatar;
          }
        });
      }
      return this.theUser;
    },
    async getUserAsync(trySync?: true) {
      if (this.theUser && trySync) return this.theUser;
      await firebaseService.validateAuth();
      const user = firebaseService.auth();
      const userLogged =
        (user && {
          key: user?.uid || user?.email || '',
          avatar: user?.photoURL || '',
          email: user?.email || 'none',
          role: this.theUser?.role,
          emailVerified: user?.emailVerified,
          name: user?.displayName || user?.email || 'none',
        }) ||
        undefined;
      if (userLogged?.key) {
        const old =
          (await profileResource.getData(userLogged.key)) ||
          (await profileResource.getLocalData(userLogged.key));
        if (old) {
          const doc = await profileResource.updatePropertiesFrom(
            userLogged.key,
            {
              ...old,
              ...userLogged,
            },
            ['emailVerified']
          );
          const newUser = doc?.data;
          this.theUser = newUser || this.theUser;
        } else if (userLogged) {
          this.theUser =
            (await profileResource.setData(userLogged.key, {
              ...userLogged,
            })) || this.theUser;
        }
      }
      if (
        this.theUser?.avatar &&
        this.theUser.avatar.length > 1 &&
        /^http/.test(this.theUser.avatar)
      ) {
        this.theUser.avatar =
          String(await mediaResource.cacheHttpUrl(this.theUser.avatar)) ||
          this.theUser.avatar;
      }
      return this.theUser;
    },
    clearUser() {
      this.theUser = undefined;
    },

    waitForProfile(key: string) {
      return profileResource.streamWith({ key });
    },
    async updateProfile(payload: IProfile) {
      const { name, avatar } = payload;
      return await firebaseService.updateProfile(name, avatar);
    },
    async authenticate(cb?: VoidCallback) {
      if (!this.getUser()) {
        await firebaseService.authenticate();
        if (this.getUser()) {
          cb && cb();
          if (this.theUser?.status === false) {
            await firebaseService.signOut();
            this.clearUser();
          }
        } else {
          await firebaseService.validateAuth();
          await this.getUserAsync();
          cb && cb();
        }
      } else {
        cb && cb();
      }
    },
    async findAllProfiles() {
      const response = await profileResource.findAll();
      return response;
    },
    async getProfile(key: string) {
      const cached = this.cache.find((p) => p.key == key);
      if (cached) return cached;
      const profile = await profileResource.findOne({ key });
      if (profile) {
        this.cache.push(profile);
      }
      return profile;
    },
    streamAllProfiles() {
      if (
        this.theUser &&
        this.theUser?.role === 'moderator' &&
        this.theUser.institution
      ) {
        return profileResource.streamWith({
          instKey: this.theUser.institution,
        });
      } else if (this.theUser && this.theUser?.role === 'admin') {
        return profileResource.streamWith({
          'institution !=': '',
        });
      } else {
        return profileResource.streamWith({
          key: this.theUser?.key,
        });
      }
    },
    streamProfile(key: string) {
      const stream = profileResource.streamWith({ key });
      if (key == this.getUser()?.key) {
        stream.subscribe({
          next: (value) => {
            const role = this.theUser?.role;
            this.theUser = (value.length && value[0]) || this.theUser;
            if (this.theUser) {
              this.theUser.role = role;
            }
          },
        });
      }
      return stream;
    },
    async reloadProfile(key: string) {
      return (await firebaseService.get('profiles', key)) as IProfile;
    },
    async toggleProfileStatus(payload: IProfile) {
      await profileResource.updateProperty(
        payload.key,
        'status',
        !payload.status
      );
    },
    async assignOrUnassignRole(payload: IProfile, newRole?: string) {
      return await profileResource.updateProperty(
        payload.key,
        'role',
        newRole || ''
      );
    },
    async updateProfileProp<T extends keyof IProfile, V = IProfile[T]>(
      key: string,
      prop: T,
      value: V
    ) {
      const deffered = new DeferredPromise<void>();
      profileResource.updateProperty(key, prop, value, async (update) => {
        if (update.status == 'synced') {
          deffered.resolve();
        } else if (/error/i.test(update.status)) {
          const doc = await profileResource.getDoc(
            update.newKey || update.key || ''
          );
          synchronizerConnection.retrySynching({
            entity: profileResource.entity,
          });
          deffered.reject(doc?.remarks || 'Failed to update QRedits');
        }
      });
      return deffered.promise;
    },
    async modifyProfile<T extends keyof IProfile>(
      key: string,
      props: T[],
      source: Partial<IProfile>
    ) {
      const deferred = new DeferredPromise<IProfile | undefined>();
      profileResource.updatePropertiesFrom(
        key,
        source,
        props,
        async (update) => {
          if (update.status == 'synced') {
            deferred.resolve(
              await profileResource.getLocalData(
                update.newKey || update.key || ''
              )
            );
          } else if (/error/i.test(update.status)) {
            const doc = await profileResource.getDoc(
              update.newKey || update.key || ''
            );
            deferred.reject(doc?.remarks || 'Failed to update Profile');
          }
        }
      );
      return deferred.promise;
    },
  },
});
