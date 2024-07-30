<template>
  <q-page class="row items-center justify-evenly">
    <q-carousel class="col" v-model="slide" arrows keep-alive>
      <q-carousel-slide name="0">
        <q-video
          src="https://www.facebook.com/ranaoictsummit/videos/797632051953364/"
        />
      </q-carousel-slide>
      <q-carousel-slide name="1">
        <div
          class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap"
        >
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit7.jpg"
          />
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit2.jpg"
          />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="2">
        <div
          class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap"
        >
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit3.jpg"
          />
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit4.jpg"
          />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="3">
        <div
          class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap"
        >
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit5.jpg"
          />
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit1.jpg"
          />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="4">
        <div
          class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap"
        >
          <q-img
            class="rounded-borders col-4 full-height"
            src="~assets/1stSummitP1.jpg"
          />
          <q-img
            class="rounded-borders col-4 full-height"
            src="~assets/1stSummitP2.jpg"
          />
          <q-img
            class="rounded-borders col-4 full-height"
            src="~assets/1stSummitP3.jpg"
          />
        </div>
      </q-carousel-slide>
    </q-carousel>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
defineOptions({
  name: 'IndexPage',
});
const slide = ref('0');
</script>
