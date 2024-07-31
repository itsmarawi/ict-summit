<template>
  <q-page class="">
    <div class="full-width row">
      <q-img class="rounded-borders col" src="~assets/ictSummit2.jpg" />
    </div>
    <div class="row fit justify-center items-center q-gutter-lg q-py-lg">
      <CountCard count="2" description="Days" />
      <CountCard count="6" description="Speakers" />
      <CountCard count="10+" description="Topics" />
      <CountCard count="300" description="Slots" />
      <CountCard count="250" description="Attendees" />
    </div>
    <div>
      <div class="text-center">
        <div class="text-h3 text-bold" dense>Why Attend?</div>
        <q-chip
          class="text-h3 text-bold"
          dense
          color="primary"
          style="width: 400px; height: 30px; margin-top: -40px; z-index: -10"
        ></q-chip>
      </div>
      <div class="text-bod2 q-px-lg">
        <p class="text-h6">
          Join us as we accelerate Lanao del Sur's digital future!
        </p>
        <div class="text-h6">The 2nd Ranao ICT Summit is your gateway to:</div>
        <ul>
          <li>
            Unleash Innovation: Discover cutting-edge technologies and solutions
            transforming industries.
          </li>
          <li>
            Expand Your Network: Connect with IT enthusiasts, industry leaders,
            and potential partners.
          </li>
          <li>
            Drive Economic Growth: Learn how to harness the power of digital
            economy for Lanao del Sur's prosperity.
          </li>
          <li>
            Protect Our Heritage: Understand the role of ICT in preserving and
            promoting Ranaw's rich culture. Shape the Future: Be part of the
            conversation that will define Lanao del Sur's digital landscape.
          </li>
        </ul>
        <p class="text-bold">
          Don't miss this opportunity to contribute to a thriving, digitally
          empowered Lanao del Sur.
        </p>
        <div class="text-h6">Key Highlights:</div>
        <ul>
          <li>
            Inspiring Keynotes: Hear from industry experts and visionaries.
          </li>
          <li>Interactive Workshops: Gain practical skills and knowledge.</li>
          <li>
            Showcase of Local Talent: Discover innovative solutions from Lanao
            del Sur.
          </li>
          <li>Networking Opportunities: Build valuable connections.</li>
        </ul>

        <p class="text-h6">
          <q-btn class="text-bold" dense>Register Now</q-btn> and be part of the
          digital revolution!
        </p>
      </div>
    </div>
    <div class="bg-dark q-py-lg">
      <div class="text-center q-pt-sm">
        <q-chip
          class="text-h3 text-bold"
          dense
          color="secondary"
          style="width: 400px; height: 30px; margin-top: -40px"
        >
          <div class="absolute text-h3 text-bold" style="top: -30px" dense>
            Guest Speakers
          </div>
        </q-chip>
      </div>
      <div
        class="row fit justify-center items-center q-gutter-xl q-py-lg q-px-xl"
      >
        <SpeakerCard
          avatar="#"
          company-logo="#"
          full-name="Lupin III"
          :position="''"
          expertise="Swords"
        />
      </div>
    </div>
    <div class="bg-grey-5 q-py-lg">
      <div class="text-center q-pt-sm">
        <q-chip
          class="text-h3 text-bold"
          dense
          color="secondary"
          style="width: 400px; height: 30px; margin-top: -40px"
        >
          <div class="absolute text-h3 text-bold" style="top: -30px" dense>
            Topics
          </div>
        </q-chip>
      </div>
      <div
        class="row fit justify-center items-center q-gutter-xl q-py-lg q-px-xl"
      >
        <TopicCard schedule="Today" class="col-12 col-md-5">
          <div>Ccntent</div>
          <ul>
            <li>Topic 1</li>
            <li>Topic 2</li>
          </ul>
        </TopicCard>
        <TopicCard schedule="Today" class="col-12 col-md-5">
          <div>Ccntent</div>
          <ul>
            <li>Topic 1</li>
            <li>Topic 2</li>
          </ul>
        </TopicCard>
      </div>
    </div>
    <div class="bg-dark q-py-lg">
      <div class="text-center q-pt-sm">
        <q-chip
          class="text-h3 text-bold"
          dense
          color="secondary"
          style="width: 400px; height: 30px; margin-top: -40px"
        >
          <div class="absolute text-h3 text-bold" style="top: -30px" dense>
            Sponsors
          </div>
        </q-chip>
      </div>
      <div
        class="row fit justify-center items-center q-gutter-sm q-py-lg q-px-xl"
      >
        <InstitutionCard
          v-for="s in sponsors"
          :key="s"
          :logo="s"
        ></InstitutionCard>
      </div>
    </div>
    <q-carousel v-model="slide" arrows>
      <q-carousel-slide name="0">
        <div
          class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap"
        >
          <q-video
            class="rounded-borders col-12 full-height"
            src="https://www.youtube.com/embed/8AnDG4vWYqM?si=Dr44cs3_HzO5Rd54?rel=0"
          />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="0.5">
        <div
          class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap"
        >
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit9.jpg"
          />
          <q-img
            class="rounded-borders col-6 full-height"
            src="~assets/1stSummit10.jpg"
          />
        </div>
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
import { onMounted, ref } from 'vue';
import CountCard from 'components/CountCard.vue';
import SpeakerCard from 'components/SpeakerCard.vue';
import TopicCard from 'src/components/TopicCard.vue';
import InstitutionCard from 'src/components/InstitutionCard.vue';
defineOptions({
  name: 'IndexPage',
});
const slide = ref('0');
const sponsors = ref<string[]>([]);
// const participating = ref<string[]>([]);
onMounted(async () => {
  sponsors.value = [
    (await import('../assets/logos/LDS Logo.png')).default,
    (await import('../assets/logos/DICTBARMM.jpg.png')).default,
    (await import('../assets/logos/MSU CICS.png')).default,
    (await import('../assets/logos/ITSMarawi Logo.png')).default,
    (await import('../assets/logos/KHMARS.jpg')).default,
    (await import('../assets/logos/democracynetph.jpg')).default,
    (await import('../assets/logos/MSU OFFICIAL LOGO.png')).default,
    (await import('../assets/logos/MSU-BYTES.png')).default,
  ];
});
</script>
