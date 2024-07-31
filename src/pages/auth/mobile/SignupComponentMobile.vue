<template>
  <q-card flat class="q-pa-lg">
    <q-form @submit="onSignup">
      <div class="fixed-left q-pt-sm">
        <q-btn
          icon="arrow_back"
          flat
          size="lg"
          :to="{ name: 'start', params: { action: 'login' } }"
        />
      </div>
      <div class="row col q-pt-xs q-mt-xl">
        <div>
          <span class="text-h5 q-pt-xl">Create new account</span>
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
        </div>

        <div class="col-12 q-py-sm">
          <q-input v-model="email" label="Email" :rules="['email']" />
        </div>
        <div class="col-12 q-py-sm">
          <q-input
            v-model="username"
            label="Full Name"
            :rules="[(val) => val?.length || 'Enter Full Name']"
          />
        </div>
        <div class="col-12 q-py-sm">
          <q-input
            v-model="password"
            label="Password"
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
        </div>
        <div class="col-12">
          <q-input
            v-model="confirmPassword"
            label="Confirm Password"
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
            <q-space />
            <q-btn
              style="width: 290px"
              class="q-my-lg"
              label="Create an Account"
              color="primary"
              rounded
              :loading="signingUp"
              type="submit"
            />
          </div>
        </div>
      </div>
      <q-dialog v-model="showTerms" full-width>
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
  </q-card>
</template>

<script setup lang="ts">
import TermsAndConditionDialog from '../desktop/TermsAndConditionDialog.vue';
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
  signingUp,
  agreed,
  terms,
  showTerms,
  disabledSubmit,
  toggleSubmit,
} = useSignupScript();
</script>

<style scoped></style>
