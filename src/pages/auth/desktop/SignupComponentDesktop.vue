<template>
  <q-card class="row justify-between" flat>
    <q-card-section class="col" style="overflow: auto">
      <div class="q-mx-xl q-mt-xl text-grey-8">
        <div class="text-h4">Create new account.</div>
        <p class="text-weight-regular">
          Already have an account?
          <q-btn
            flat
            dense
            class="text-primary"
            style="z-index: 99999"
            :to="{ name: 'start', params: { action: 'login' } }"
          >
            Login
          </q-btn>
        </p>

        <q-form @submit="onSignup">
          <q-input
            v-model="username"
            label="Full Name"
            data-cy="usernameInput"
            :rules="[(val) => !!val || 'Please enter your full name']"
            hint="Example: Dela Cruz, Juan T."
            hide-hint
            hide-bottom-space
          />
          <q-input
            v-model="email"
            label="Email"
            data-cy="emailInput"
            :rules="['email']"
            hint="Example: sample@gmail.com"
            hide-hint
            hide-bottom-space
          />
          <q-input
            v-model="password"
            label="Password"
            hide-bottom-space
            data-cy="password"
            :type="isViewPassword ? 'password' : 'text'"
            :rules="[
              (val) => !!val || 'Please enter your password',
              (val) =>
                (val && val.length > 7) ||
                'Password should be at least 8 characters',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isViewPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isViewPassword = !isViewPassword"
              />
            </template>
          </q-input>
          <q-input
            v-model="confirmPassword"
            label="Confirm Password"
            hide-bottom-space
            data-cy="confirmPassword"
            :type="isViewPassword1 ? 'password' : 'text'"
            :rules="[
              (val) => !!val || 'Please enter your password',
              (val) => val == password || 'Password is not matched',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isViewPassword1 ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isViewPassword1 = !isViewPassword1"
              />
            </template>
          </q-input>
          <div class="text-center">
            <q-checkbox v-model="agreed" :disable="terms" @click="toggleSubmit">
              I agree to the
            </q-checkbox>
            <q-btn
              no-caps
              dense
              unelevated
              flat
              color="primary"
              @click="showTerms = true"
            >
              Terms of Service
            </q-btn>
            <q-btn
              :loading="signingUp"
              :disable="disabledSubmit"
              class="q-mt-lg"
              style="width: 100%"
              label="Create an Account"
              color="primary"
              rounded
              data-cy="createAccount"
              type="submit"
            />
          </div>
          <q-dialog v-model="showTerms">
            <terms-and-condition-dialog
              @toggle-submit="
                agreed = true;
                showTerms = false;
                terms = false;
                disabledSubmit = false;
              "
              @toggle-terms="showTerms = false"
            ></terms-and-condition-dialog>
          </q-dialog>
        </q-form>
      </div>
    </q-card-section>
    <q-card-section
      class="__background-image col text-center text-white q-gutter-y-md"
      style="overflow: auto; padding: 80px 0px 80px 0px"
    >
      <div class="row justify-center">
        <q-img src="~assets/summit-logo.png" style="width: 25%" />
      </div>
      <div class="text-weight-regular text-h4">Developed by ITSMarawi</div>
      <div class="text-weight-light text-h5">"Help rebuilding Marawi!"</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import TermsAndConditionDialog from './TermsAndConditionDialog.vue';
import useSignupScript from '../useSignupScript';

defineEmits(['routeToTab']);

const {
  email,
  username,
  password,
  confirmPassword,
  isViewPassword,
  isViewPassword1,
  onSignup,
  toggleSubmit,
  signingUp,
  agreed,
  terms,
  showTerms,
  disabledSubmit,
} = useSignupScript();
</script>

<style scoped></style>
