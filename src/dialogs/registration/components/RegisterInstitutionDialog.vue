<template>
  <q-dialog
    :model-value="isShow"
    :maximized="$q.screen.lt.sm"
    persistent
    @hide="onCancel"
    style="position: relative"
  >
    <q-card flat style="border-radius: 16px; background-color: transparent">
      <q-card-section />
      <q-card-section class="bg-dark" style="border-radius: 16px 16px 0 0">
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
          <q-icon size="lg" color="black" name="diversity_3" />
        </q-avatar>
        <q-btn
          class="self-end"
          outline
          round
          style="position: absolute; top: 8px; right: 8px; z-index: 9999"
          icon="close"
          size="sm"
          data-cy="close"
          @click="onCancel"
        />
      </q-card-section>
      <q-form @submit="onSubmit" v-if="institution">
        <div class="q-pa-xl bg-dark">
          <div class="text-h4" style="color: #555555">
            Register your Institution
          </div>
        </div>
        <div class="q-pt-sm bg-dark q-px-md">
          <q-input
            v-model="institution.key"
            type="text"
            label="Short Name"
            hint="at least 2 letters"
            maxlength="15"
            :rules="[
              (val) => /^.{2}/.test(val) || 'Please enter a valid short name',
              (val) => /\s/.test(val) || 'Cannot contain space',
            ]"
            hide-bottom-space
          >
          </q-input>
          <q-input
            v-model="institution.name"
            type="text"
            label="Institution Name"
            hint="at least 8 letters"
            :rules="[
              (val) => /^.{8}/.test(val) || 'Please enter a valid  name',
            ]"
            hide-bottom-space
          >
          </q-input>
          <div class="row items-center bg-dark q-pa-md">
            <span class="col-4 text-bold text-grey">Sector:</span>
            <q-option-group
              class="col-8"
              inline
              v-model="institution.sector"
              :options="[
                { label: 'Goverment', value: 'government' },
                { label: 'Private', value: 'private' },
              ]"
            >
            </q-option-group>
          </div>
        </div>
        <div class="text-center q-pt-sm bg-white q-pa-md">
          <q-btn
            style="width: 300px"
            label="Register Instution"
            color="primary"
            rounded
            type="submit"
          ></q-btn>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { theDialogs } from 'src/dialogs';
import { IInstitution } from 'src/entities';
import { useInstitutionStore } from 'src/stores/institution-store';
import { ref } from 'vue';
const institutionStore = useInstitutionStore();
const institution = ref<IInstitution>();
const isShow = ref(false);
const submitCb = ref<(inst: IInstitution) => void>();
const errorCb = ref<ErrorCallback>();
function onCancel() {
  isShow.value = false;
}
async function onSubmit() {
  if (institution.value?.key) {
    try {
      const duplicateKey = await institutionStore.findInstitutionByKey(
        institution.value.key.toUpperCase()
      );
      if (duplicateKey) {
        errorCb.value && errorCb.value(new Error('Short Name Duplicate'));
        return;
      }
      const duplicateName = await institutionStore.findInstitutionByName(
        institution.value.name
      );
      if (duplicateName) {
        errorCb.value && errorCb.value(new Error('Institution Name Duplicate'));
        return;
      }
      isShow.value = false;
      submitCb.value && submitCb.value(institution.value);
    } catch (error) {
      errorCb.value && errorCb.value(error as Error);
    }
  }
}
theDialogs.on({
  type: 'registerInstitution',
  info: { icon: 'add', module: 'institution' },
  cb(e) {
    isShow.value = true;
    submitCb.value = e.done;
    errorCb.value = e.error;
    institution.value = {
      key: '',
      name: '',
      sector: 'government',
    };
  },
});
</script>
