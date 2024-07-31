<template>
  <q-page class="__background flex flex-center">
    <q-card flat style="border-radius: 16px; width: 512px">
      <div class="q-pa-xl">
        <q-btn
          fab
          round
          color="white"
          class="absolute"
          style="top: 0%; right: 43%; transform: translateY(-50%)"
        >
          <q-icon size="md" color="primary" name="contact_mail" />
        </q-btn>
        <div class="row no-wrap items-center">
          <div class="col text-h6 ellipsis text-primary">
            Email Verification
          </div>
        </div>

        <q-card-section class="q-pt-none" style="background-color: #fff">
          <div class="text-h7 q-pt-md" style="color: #555555">
            {{ $t('email-verification-message-dialog') }}
          </div>
        </q-card-section>

        <div class="text-center q-pt-md q-gutter-y-sm">
          <q-btn
            style="width: 150px"
            label="Resend"
            color="primary"
            rounded
            class="q-mx-md"
            @click="resendEmailVerification"
          ></q-btn>
          <q-btn
            style="width: 150px"
            label="Logout"
            color="secondary"
            rounded
            @click="logout"
          ></q-btn>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { theWorkflows } from 'src/workflows/the.workflows';
import { useRouter } from 'vue-router';
const $q = useQuasar();
const $router = useRouter();

function resendEmailVerification() {
  theWorkflows.emit({
    type: 'resendEmailVerification',
    arg: {
      done() {
        $q.notify({
          message: 'Email verification sent',
          icon: 'info',
          color: 'positive',
        });
      },
      error(err) {
        $q.notify({
          message: String(err),
          icon: 'error',
          color: 'negative',
        });
      },
    },
  });
}
function logout() {
  theWorkflows.emit({
    type: 'logout',
    arg: {
      done() {
        $router.replace({
          name: 'start',
          params: {
            action: 'login',
          },
        });
      },
    },
  });
}
</script>
