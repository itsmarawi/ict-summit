<template>
  <q-dialog
    :model-value="isShow"
    :maximized="$q.screen.lt.sm"
    persistent
    @hide="onHideForgetPassword"
    style="position: relative"
  >
    <q-card style="border-radius: 16px">
      <div class="fixed-left q-pt-sm">
        <q-btn icon="arrow_back" flat size="lg" @click="onHideForgetPassword" />
      </div>
      <div class="q-pt-xl text-center">
        <q-img src="~assets/Logo-forget-password.svg" style="width: 45%" />
      </div>
      <q-form @submit="onForgetPassword">
        <div class="q-pa-lg">
          <div class="text-h4" style="color: #555555">Forgot Password</div>
          <div class="text-h7 q-pt-md" style="color: #555555">
            {{ t('message-dialog') }}
          </div>
          <div class="q-pt-sm">
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
            >
            </q-input>
          </div>
          <div class="text-center q-pt-sm">
            <q-btn
              style="width: 300px"
              :label="$t('reset-password')"
              color="primary"
              rounded
              :loading="isLoading"
              type="submit"
            ></q-btn>
          </div>
        </div>
      </q-form>

      <div class="text-center" style="color: #555555">
        {{ t('message-question') }}
        <q-btn
          flat
          dense
          class="q-ml-xs text-primary"
          :style="$q.screen.lt.md ? '' : 'z-index: 99999'"
          @click="goToSignup"
          >Sign Up Now</q-btn
        >
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import useForgetPasswordScript from '../useForgetPasswordScript';
import { useI18n } from 'vue-i18n';
const { t } = useI18n({});
const { email, isShow, isLoading, onForgetPassword, goToSignup } =
  useForgetPasswordScript();

function onHideForgetPassword() {
  isShow.value = false;
}
</script>
