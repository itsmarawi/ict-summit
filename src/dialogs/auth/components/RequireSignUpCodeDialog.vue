<template>
  <q-dialog
    :model-value="showDialog"
    :maximized="$q.screen.lt.sm"
    persistent
    style="position: relative"
  >
    <q-card style="border-radius: 16px">
      <q-form @submit="submit"  >
      <div class="absolute-right q-pa-sm">
        <q-btn
          outline
          size="sm"
          round
          icon="fa-solid fa-x"
          style="color: #4f94c9"
          data-cy="close"
          type="cancel"
          @click="cancel"
        ></q-btn>
      </div>

      <div class="q-pa-xl">
        <div class="text-h4" style="color: #555555">Enter Institution Sign-Up Code</div>
        <div class="text-h7 q-pt-md" style="color: #555555">
          {{ $t('sign-up-message-dialog') }}
        </div>
        <div class="q-pt-sm">
          <q-input
            v-model="signUpCode"
            label="Sign-Up Code"
            :type="/-?\d+/.test(signUpCode) ? 'password' : 'text'"
            data-cy="signUpCode"
            :rules="[(val) => !!val || 'Enter SIGNUP Code',(val) =>
                isValidSignUpCode(val) ||
                  'Please enter valid Sign-Up code']"
          >
          </q-input>
        </div>
        <div class="text-center q-pt-md">
          <q-btn
            style="width: 100px"
            label="Confirm"
            color="primary"
            rounded
            data-cy="submit"
            type="submit"
          ></q-btn>
          <q-btn
            style="width: 100px"
            color="primary"
            :to="{name: 'scanner'}"
            rounded
            class="q-mx-sm"
            icon="qr_code_scanner"
          ></q-btn>

          <q-btn
            style="width: 100px"
            color="primary"
            rounded
            v-close-popup
            :to="{name: 'landing-page'}"
            icon="home"
          ></q-btn>
        </div>
      </div>
    </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { theDialogs } from 'src/dialogs';
import signUp from 'pages/auth/useSignupScript'
import { ref } from 'vue';
const signUpCode = ref('');
const showDialog = ref(false);
const {isValidSignUpCode} = signUp();
let doneCb:(code:string) => void;
let cancelCb:VoidCallback;
function submit(){
  const instKey = signUpCode.value.replace(/-?[0-9]+$/, '');
  doneCb && doneCb(instKey);
  showDialog.value = false;
}
function cancel() {
  showDialog.value = false;
  cancelCb && cancelCb();
}
theDialogs.on({
  type: 'requireSignUpCode',
  info: {module: 'auth', icon: 'code'},
  cb(e) {
    doneCb = e.done;
    cancelCb = e.cancel;
    showDialog.value = true;
  },
})
</script>
