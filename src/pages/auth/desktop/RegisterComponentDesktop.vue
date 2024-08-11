<template>
  <q-card class="row justify-between" flat>
    <q-card-section class="col" style="overflow: auto">
      <q-btn
        icon="home"
        :to="{ name: 'home' }"
        rounded
        flat
        dense
        class="absolute-top-left q-ma-lg"
      />
      <div class="q-mx-xl q-mt-xl text-grey-8">
        <div class="text-h4">Join us on Summit</div>

        <q-form @submit.prevent="registerUser()">
          <q-select
            label="Institution"
            v-model="institution"
            :options="listInstutions"
            :option-label="mapInstitution"
          >
            <template v-slot:append>
              <q-btn icon="add" @click="registerInstitution" round flat dense />
            </template>
          </q-select>
          <q-select
            label="Position/Designation"
            v-model="position"
            use-input
            new-value-mode="add-unique"
            :options="filteredPositions"
            @filter="filterPositions"
            clearable
            :rules="[(val) => /^\w{2}/.test(val) || 'Please enter position']"
          ></q-select>

          <div class="row items-center">
            <span class="col-6 text-bold text-grey">Gender:</span>
            <q-option-group
              class="col-6"
              inline
              v-model="gender"
              :options="[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ]"
            >
            </q-option-group>
          </div>
          <q-separator />
          <div class="row items-center">
            <span class="col-6 text-bold text-grey">T-Shirt Size:</span>
            <q-option-group
              class="col-6"
              inline
              v-model="tShirtSize"
              :options="[
                { label: 'Small', value: 'S' },
                { label: 'Medium', value: 'M' },
                { label: 'Large', value: 'L' },
                { label: 'XL', value: 'XL' },
                { label: 'XXL', value: 'XXL' },
                { label: '3XL', value: '3XL' },
                { label: '4XL', value: '4XL' },
              ]"
            >
            </q-option-group>
          </div>

          <div class="text-center">
            <q-btn
              class="q-mt-lg"
              style="width: 100%"
              label="Register"
              :disable="isRegistrationFull"
              :color="!isRegistrationFull ? 'primary' : 'negative'"
              :loading="loading"
              rounded
              data-cy="registerAccount"
              type="submit"
            >
              <q-tooltip v-if="isRegistrationFull" class="text-h5 bg-negative"
                >Registration slots is Full!</q-tooltip
              >
            </q-btn>
          </div>
        </q-form>
      </div>
    </q-card-section>
    <q-card-section
      class="gt-md __background-image col text-center text-white q-gutter-y-md"
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
import useRegisterScript from '../useRegisterScript';
defineEmits(['routeToTab']);

const {
  gender,
  institution,
  position,
  tShirtSize,
  filteredPositions,
  filterPositions,
  registerInstitution,
  listInstutions,
  mapInstitution,
  registerUser,
  isRegistrationFull,
  loading,
} = useRegisterScript();
</script>

<style scoped></style>
