<template>
  <q-dialog
    :model-value="isShow"
    :maximized="$q.screen.lt.sm"
    persistent
    @hide="onHideForgetPassword"
    style="position: relative"
  >
    <q-card flat style="border-radius: 16px; background-color: transparent">
      <q-card-section />
      <q-card-section
        style="background-color: #fff; border-radius: 16px 16px 0 0"
      >
        <q-avatar
          color="white"
          class="absolute"
          size="64px"
          style="
            top: 0%;
            right: 43%;
            transform: translateY(-50%);
            box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.24);
          "
        >
          <q-icon size="lg" color="black" name="fa-solid fa-key" />
        </q-avatar>
        <q-btn
          class="self-end"
          outline
          round
          style="
            color: #4d93c8;
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 9999;
          "
          icon="close"
          size="sm"
          data-cy="close"
          @click="onHideForgetPassword"
        />
      </q-card-section>
      <q-form @submit="onForgetPassword">
        <div class="q-pa-xl bg-white">
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

      <div class="text-center q-pb-sm bg-white" style="color: #555555">
        {{ t('message-question') }}
        <a class="q-ml-xs text-primary" href="#" style="z-index: 99999"
          >Sign Up Now</a
        >
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import useForgetPasswordScript from '../useForgetPasswordScript';

const { t } = useI18n({});
const { email, isShow, isLoading, onForgetPassword } =
  useForgetPasswordScript();

function onHideForgetPassword() {
  isShow.value = false;
}
</script>
