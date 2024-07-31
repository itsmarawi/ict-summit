<template>
  <q-card style="border-radius: 16px">
    <q-card-section class="row items-center">
      <div
        class="text-primary text-weight-bold"
        :style="`font-size: ${$q.screen.lt.sm ? '16px' : '24px'}`"
      >
        Terms of Service
      </div>
      <q-space />
      <q-btn
        outline
        round
        color="secondary"
        icon="clear"
        size="xs"
        padding="sm"
        @click="toggleTerms"
      />
    </q-card-section>
    <q-separator />
    <q-scroll-area
      class="text-grey-8 text-justify"
      :style="`height: ${
        $q.screen.lt.sm ? '312px' : '400px'
      } `"
    >
      <q-card-section
        :style="`font-size: ${$q.screen.lt.sm ? '12px' : '16px'}`"
      >
        <div
          class="text-weight-bold q-my-xs"
          :style="`font-size: ${$q.screen.lt.sm ? '16px' : '24px'}`"
        >
          Terms and Condition
        </div>
        {{ termsAndConditions }}
        <div
          class="text-weight-bold q-my-xs"
          :style="`font-size: ${$q.screen.lt.sm ? '16px' : '24px'}`"
        >
          Choice and Consent
        </div>
        {{ choiceAndConsent }}
        <div
          class="text-weight-bold q-my-xs"
          :style="`font-size: ${$q.screen.lt.sm ? '16px' : '24px'}`"
        ></div>
        <span v-scroll-fire="endOfScroll"></span>
      </q-card-section>
    </q-scroll-area>

    <q-separator />
    <q-card-section class="row justify-center q-pa-sm">
      <q-btn
        :class="`q-px-${$q.screen.lt.md ? 'lg' : 'xl'}`"
        unelevated
        rounded
        color="secondary"
        label="cancel"
        @click="toggleTerms"
      />
      <div>&nbsp; &nbsp; &nbsp;</div>
      <q-btn
        :class="`q-px-${$q.screen.lt.md ? 'lg' : 'xl'}`"
        unelevated
        rounded
        color="primary"
        label="agree"
        :disable="readFromLast"
        @click="toggleSubmit"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  termsAndConditions,
  choiceAndConsent,
  privacyStatement,
} from 'src/pages/auth/desktop/terms';

export default defineComponent({
  name: 'TermsAndCondDialog',
  props: {
    disabledSubmit: {
      type: Boolean,
    },
  },
  emits: ['toggleSubmit', 'toggleTerms'],
  data() {
    return {
      termsAndConditions,
      choiceAndConsent,
      privacyStatement,
      readFromLast: true,
    };
  },
  methods: {
    endOfScroll() {
      this.readFromLast = false;
    },
    toggleSubmit() {
      this.$emit('toggleSubmit');
    },
    toggleTerms() {
      this.$emit('toggleTerms');
    },
  },
});
</script>
