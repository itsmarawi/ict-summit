<template>
  <q-card flat class="row justify-evenly">
    <q-card-section
      class="__background-image col text-center text-white q-gutter-y-md"
      style="overflow: auto; padding: 80px 0px 80px 0px"
    >
      <q-btn
        icon="home"
        :to="{ name: 'home' }"
        rounded
        flat
        dense
        class="absolute-top-left q-ma-lg"
      />
      <div class="row justify-center">
        <q-img src="~assets/summit-logo.png" style="width: 25%" />
      </div>
      <div class="text-weight-regular text-h4">Developed by ITSMarawi</div>
      <div class="text-weight-light text-h5">"Help rebuilding Marawi!"</div>
    </q-card-section>
    <q-card-section class="col" style="overflow: auto">
      <q-form @submit="onLogin">
        <div class="q-mx-xl q-mt-xl text-grey-8 text-center">
          <div class="text-h4">Hello! Welcome Back!</div>
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
              data-cy="emailInput"
            />
            <q-input
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              label="Password"
              :rules="[(val) => !!val || 'Please enter your password']"
              hide-bottom-space
              data-cy="passwordInput"
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
              data-cy="checkbox"
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
              data-cy="forgetPassword"
              @click="
                theDialogs.emit({
                  type: 'forgetPwDialog',
                  arg: {},
                })
              "
            />
          </div>
          <q-btn
            class="q-mb-sm"
            label="Sign In"
            type="submit"
            color="primary"
            style="width: 180px"
            data-cy="signIn"
            :loading="isLoadingLogin"
            rounded
          />
          <div class="flex flex-center row relative q-py-md">
            <hr class="col q-ma-none" />
            <span class="self-center absolute bg-grey-1 text-subtitle q-mb-xs">
              or
            </span>
          </div>
          <div class="column justify-center q-gutter-y-sm">
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
                style="z-index: 99999"
                data-cy="signup"
                :to="{ name: 'start', params: { action: 'signup' } }"
                rounded
                >Sign up now</q-btn
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
