<template>
  <q-card flat class="column">
    <q-card-section
      class="__background-image col text-center text-white"
      style="padding: 80px 0px 80px 0px; border-radius: 0 0 25px 25px"
    >
      <q-btn
        icon="home"
        :to="{ name: 'landing-page' }"
        rounded
        flat
        dense
        class="absolute-top-right q-ma-lg"
      />
      <div class="text-weight-regular text-h6">Hello! Welcome Back!</div>
      <div class="row justify-center q-py-md">
        <q-img src="~assets/common/new-logo.svg" style="width: 25%" />
      </div>
      <div class="text-weight-medium text-h5">e-SeQR</div>
      <div class="text-weight-thin text-h6">"Secure Records with e-SeQR!"</div>
    </q-card-section>
    <q-card-section>
      <q-form @submit="onLogin">
        <div class="q-mx-lg text-grey-8 text-center">
          <div class="column">
            <q-input
              v-model="email"
              type="text"
              label="Email"
              :rules="[
                (val) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
                  'Please enter a valid email',
              ]"
              hide-bottom-space
            />
            <q-input
              v-model="password"
              label="Password"
              :type="isPwd ? 'password' : 'text'"
              :rules="[(val) => !!val || 'Please enter your password']"
              hide-bottom-space
              @keypress.enter="onLogin"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="row q-my-xs text-caption text-grey-7 justify-between">
            <q-checkbox
              v-model="right"
              size="xs"
              dense
              label="Keep me signed in"
            />
            <q-btn
              flat
              rounded
              dense
              no-caps
              size="12px"
              text-color="primary"
              label="Forget Password?"
              @click="
                theDialogs.emit({
                  type: 'forgetPwDialog',
                  arg: { },
                })
              "
            />
          </div>

          <q-btn
            class="q-mb-sm"
            label="Sign In"
            type="submit"
            color="primary"
            style="width: 100%"
            :loading="isLoadingLogin"
            rounded
          />
          <div class="flex flex-center row relative q-py-md">
            <hr class="col q-ma-none" />
            <span class="self-center absolute bg-grey-1 text-subtitle q-mb-xs">
              or
            </span>
          </div>
          <div class="column justify-center q-gutter-y-sm q-pt-sm">
            <q-btn
              color="primary"
              :loading="isLoadingGoogleLogin"
              outline
              rounded
              no-caps
              data-cy="signInWithGoogle"
              @click="onGoogleLogin"
            >
              <q-icon left name="fab fa-google" />
              <div>Sign in with Google</div>
            </q-btn>
            <p
              class="q-mt-md text-weight-regular text-weight-thin row justify-center"
            >
              Don't have an account?
              <q-btn
                flat
                dense
                class="q-ml-xs text-primary q-pt-none"
                :to="{ name: 'start', params: { action: 'signup' } }"
                :style="$q.screen.lt.md ? '' : 'z-index: 99999'"
                >Sign Up Now</q-btn
              >
            </p>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import useLoginScript from '../useLoginScript';
import { theDialogs } from 'src/dialogs';

defineEmits(['routeToTab', 'onForgetPassword']);
const {
  isPwd,
  email,
  password,
  right,
  isLoadingLogin,
  isLoadingGoogleLogin,
  onLogin,
  onGoogleLogin,
} = useLoginScript();
</script>

<style scoped></style>
