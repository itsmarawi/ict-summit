<template>
  <q-page class="">
    <div class="full-width row">
      <q-img class="rounded-borders col" src="~assets/ictSummit2.jpg">
        <div
          v-if="profileStore.theUser"
          class="text-bold"
          :class="$q.screen.gt.sm ? 'q-ma-xl text-h4' : 'text-h6'"
          style="background: transparent"
        >
          Hi, {{ profileStore.theUser.name }}!
          <q-btn
            v-if="prices.length"
            flat
            :label="`Redeem ${prices.length}`"
            :to="{ name: 'prices' }"
            icon="redeem"
          />
        </div>
      </q-img>
    </div>
    <div class="row fit justify-center items-center q-gutter-lg q-py-lg">
      <CountCard count="2" description="Days" />
      <CountCard count="6" description="Speakers" />
      <CountCard count="10+" description="Topics" />
      <CountCard count="300" description="Slots" />
      <CountCard
        v-if="attendees"
        :count="attendees.toString()"
        description="Attendees"
      />
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
          <q-btn color="primary" class="text-bold" icon-right="ads_click"
            >Register Now&nbsp;</q-btn
          >
          and be part of the digital revolution!
        </p>
      </div>
    </div>
    <div class="bg-dark q-py-lg" id="speakers">
      <div class="text-center q-pt-sm">
        <q-chip
          class="text-h3 text-bold"
          dense
          color="secondary"
          style="width: 400px; height: 30px; margin-top: -40px"
        >
          <div class="absolute text-h3 text-bold" style="top: -30px" dense>
            Speakers
          </div>
        </q-chip>
      </div>
      <div
        class="row fit justify-center items-center q-gutter-xl q-py-lg q-px-xl"
      >
        <SpeakerCard
          v-for="speaker in speakers"
          :key="speaker.fullname"
          :avatar="speaker.avatar || speaker.defaultAvatar || ''"
          :company-logo="speaker.companyLogo || ''"
          :full-name="speaker.fullname"
          :position="speaker.position"
          :expertise="speaker.expertise"
        />
      </div>
    </div>
    <div class="bg-grey-5 q-py-lg" id="topics">
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
        <TopicCard
          v-for="topic in topics"
          :key="topic.name + topic.schedule"
          :schedule="topic.schedule"
          class="col-12 col-md-5"
        >
          <div>{{ topic.name }}</div>
          <ul>
            <li v-for="line in topic.contents" :key="line">{{ line }}</li>
          </ul>
        </TopicCard>
      </div>
    </div>
    <div class="bg-dark q-py-lg" id="sponsors">
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
          :key="s.name || s.logo"
          :logo="s.logo"
          :bg="s.background"
        ></InstitutionCard>
      </div>
    </div>
    <div id="previous-summit">
      <div class="text-center q-pt-sm">
        <q-chip
          class="text-h3 text-bold"
          dense
          color="secondary"
          style="width: 400px; height: 30px; margin-top: -40px"
        >
          <div class="absolute text-h3 text-bold" style="top: -30px" dense>
            Ranao ICT Summit 2023
          </div>
        </q-chip>
      </div>
      <q-carousel
        v-model="slide"
        swipeable
        animated
        transition-prev="jump-right"
        transition-next="jump-right"
        autoplay
        ref="carousel"
        infinite
        arrows
      >
        <q-carousel-slide name="0">
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
    </div>
    <!-- About Us -->
    <div class="q-py-xl bg-dark row justify-center" id="about-us">
      <div class="text-center q-pt-sm">
        <q-chip
          class="text-h3 text-bold"
          dense
          color="secondary"
          style="width: 400px; height: 30px; margin-top: -40px"
        >
          <div class="absolute text-h3 text-bold" style="top: -30px" dense>
            Get to know Us
          </div>
        </q-chip>
      </div>
      <div
        class="row fit justify-start items-center q-pa-lg q-col-gutter no-wrap"
      >
        <q-video
          class="rounded-borders col-12"
          style="height: 400px"
          src="https://www.youtube.com/embed/8AnDG4vWYqM?si=Dr44cs3_HzO5Rd54"
        />
      </div>
      <!-- "Link to About Us" -->
      <q-card flat class="row background-gtku text-white">
        <q-card-section
          class="col-12 col-lg-2 self-start text-center q-pa-xl q-ma-lg"
        >
          <q-img src="~assets/summit-logo.png" style="max-width: 300px" />
        </q-card-section>

        <q-card-section class="q-pa-xl col-12 col-lg-8">
          <div class="q-pt-sm q-pb-lg text-white text-h4 col">
            <span class="text-weight-bold">The Ranao ICT Summit</span> is a
            premier gathering of IT professionals, innovators, and stakeholders
            committed to driving digital transformation in Lanao del Sur.
          </div>
          <div
            style="text-align: justify"
            class="q-gutter-lg text-weight-light text-h5"
          >
            <div>
              Established in 2023, the summit has rapidly grown into a pivotal
              platform for fostering collaboration, knowledge sharing, and the
              adoption of cutting-edge technologies to address the region's
              unique challenges and opportunities.
            </div>
            <div>
              Our mission is to empower Lanao del Sur through ICT by:
              <ul>
                <li>
                  <span class="text-bold">Protecting Ranaw:</span>
                  Leveraging technology to preserve and promote our rich
                  cultural heritage.
                </li>
                <li>
                  <span class="text-bold">Promoting Digital Economy:</span>
                  Creating a thriving digital ecosystem that generates jobs and
                  economic growth.
                </li>
                <li>
                  <span class="text-bold">Building the Future:</span>
                  Nurturing a skilled ICT workforce and fostering innovation.
                </li>
              </ul>

              <p>
                Through insightful keynote speeches, engaging workshops, and
                networking opportunities, the Ranao ICT Summit brings together
                industry experts, government officials, and the local community
                to shape the future of Lanao del Sur.
              </p>
              <p>
                Join us as we work together to build a smarter, more connected,
                and prosperous Lanao del Sur.
              </p>
            </div>
            <div class="text-center">
              <q-btn
                v-if="!profileStore.theUser?.institution"
                icon-right="ads_click"
                color="primary"
                :to="{ name: 'start', params: { action: 'signup' } }"
                >Register Now &nbsp;</q-btn
              >
            </div>
          </div>
          <!-- <div class="text-center">
            <q-btn rounded color="primary" no-caps>Read More</q-btn>
          </div> -->
        </q-card-section>
      </q-card>
    </div>
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 18]"
    >
      <q-btn fab icon="keyboard_arrow_up" color="primary" />
    </q-page-scroller>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CountCard from 'components/CountCard.vue';
import SpeakerCard from 'components/SpeakerCard.vue';
import TopicCard from 'src/components/TopicCard.vue';
import InstitutionCard from 'src/components/InstitutionCard.vue';
import { scroll } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from 'src/stores/profile-store';
import { RafflePrice } from 'src/entities';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
type Speaker = {
  fullname: string;
  position: string;
  expertise: string;
  companyLogo?: string;
  avatar?: string;
  defaultAvatar?: string;
};
type Sponsor = {
  logo: string;
  background?: string;
  name?: string;
};
type Topic = {
  schedule: string;
  name: string;
  contents: string[];
};
defineOptions({
  name: 'IndexPage',
});
const $route = useRoute();
const $router = useRouter();
const profileStore = useProfileStore();
const raffeDrawStore = useRaffleDrawStore();
$router.afterEach((route) => {
  if (route.hash && route.name == 'home') {
    handleHash(route.hash);
  }
});
const slide = ref('0');
const attendees = ref(300);
const prices = ref<RafflePrice[]>([]);
const sponsors = ref<Sponsor[]>([]);
const speakers = ref<Speaker[]>([]);
const topics = ref<Topic[]>([]);

const defaultManAvatar = ref<string>();
const defaultWomanAvatar = ref<string>();
// const participating = ref<string[]>([]);
onMounted(async () => {
  defaultManAvatar.value = (await import('../assets/man-dummy.webp')).default;
  defaultWomanAvatar.value = (
    await import('../assets/dummy-woman.png')
  ).default;

  sponsors.value = [
    { logo: (await import('../assets/logos/LDS Logo.png')).default },
    { logo: (await import('../assets/logos/ICTO.jpg')).default },
    { logo: (await import('../assets/logos/DICT Logo.png')).default },
    { logo: (await import('../assets/logos/MSU CICS.png')).default },
    { logo: (await import('../assets/logos/ITSMarawi Logo.png')).default },
    { logo: (await import('../assets/logos/KHMARS.jpg')).default },
    { logo: (await import('../assets/logos/DemocracyNetPH.png')).default },
    { logo: (await import('../assets/logos/Data Lake.jpg')).default },
    {
      logo: (await import('../assets/logos/DITO_PH_Logo-Transparent.png'))
        .default,
    },
    {
      logo: (
        await import(
          '../assets/logos/QBOInnovation_gray_accented_stacked_allcaps.png'
        )
      ).default,
    },
    {
      logo: (await import('../assets/logos/Biond Logo.png')).default,
      background: 'grey',
    },
    { logo: (await import('../assets/logos/MSU OFFICIAL LOGO.png')).default },
    { logo: (await import('../assets/logos/MSU-BYTES.png')).default },
    { logo: (await import('../assets/logos/The Cursor.png')).default },
  ];

  speakers.value = [
    {
      fullname: 'MAHID A. MACADATO',
      position: 'Communications Officer',
      expertise: 'Communications Specialist',
      avatar: defaultManAvatar.value,
      defaultAvatar: defaultManAvatar.value,
      companyLogo: (await import('../assets/logos/LDS Logo.png')).default,
    },
    {
      fullname: 'Moslemen M. Macarambon Jr.',
      position: 'President: Democracy.net.ph',
      expertise: 'Innovative Governance',
      avatar:
        'https://media.licdn.com/dms/image/D5603AQEg6gM0GPKWTA/profile-displayphoto-shrink_800_800/0/1684551192284?e=2147483647&v=beta&t=pjWJWw_3RYL4mWYACa7TAi_0EZxrW3Vh3DflL1sYfpw',
      defaultAvatar: defaultManAvatar.value,
      companyLogo: (await import('../assets/logos/DemocracyNetPH.png')).default,
    },
    {
      fullname: 'Mudzna M. Asakil',
      position: 'MSU CICS, College Dean',
      expertise: 'Database',
      avatar: defaultWomanAvatar.value,
      defaultAvatar: defaultWomanAvatar.value,
      companyLogo: (await import('../assets/logos/MSU CICS.png')).default,
    },
    {
      fullname: 'Hannah Grace M. Parcon',
      position: 'Project Focal: DICT IIDB',
      expertise: 'Digital Innovation',
      avatar: defaultWomanAvatar.value,
      defaultAvatar: defaultWomanAvatar.value,
      companyLogo: (await import('../assets/logos/DICTBARMM.jpg.png')).default,
    },
    {
      fullname: 'Engr. Amal Salih M. Asum',
      position: 'Provicial Field Officer',
      expertise: 'Innovative Governance',
      avatar: defaultManAvatar.value,
      defaultAvatar: defaultManAvatar.value,
      companyLogo: (await import('../assets/logos/DICTBARMM.jpg.png')).default,
    },
    {
      fullname: 'Azreen M. Marohomsalic',
      position: 'ITS Marawi, CEO',
      expertise: 'Project Management',
      avatar:
        'https://yt3.googleusercontent.com/ytc/AIdro_nezLkMAII0B_rjmEe_7CulWH488wO5M3mjhLYyquprIg=s160-c-k-c0x00ffffff-no-rj',
      defaultAvatar: defaultManAvatar.value,
      companyLogo: (await import('../assets/logos/ITSMarawi Logo.png')).default,
    },
  ];

  topics.value = [
    {
      schedule: 'Aug 28',
      name: 'DIGITAL INNOVATION',
      contents: [
        'ICT Industry Development for Lanao del Sur',
        'Role and Updates of Academe in ICT',
        'Philippine Skills Framework (PSF) for ICT-related industries',
      ],
    },
    {
      schedule: 'Aug 28',
      name: 'Governance',
      contents: [
        'IT Governance and ICT Council in LGU LDS Province',
        'LDS ICT Ecosystem: Opportunities',
      ],
    },
    {
      schedule: 'Aug 29',
      name: 'ICT Council and ICT Trends',
      contents: ['ICT Council 101', 'Cybersecurity Best Practices'],
    },
  ];
  handleHash();
  attendees.value = await profileStore.countRegisters();
  if (profileStore.theUser) {
    raffeDrawStore.streamParticipantPrices(profileStore.theUser).subscribe({
      next(value) {
        prices.value = value.filter((p) => p.status == 'ready');
      },
    });
  }
});

function handleHash(id?: string) {
  const hash = id || ($route.name == 'home' && $route.hash);
  if (hash) {
    const element = document.getElementById(hash.replace('#', ''));
    if (element) {
      scrollToElement(element);
    }
  }
}
const { getScrollTarget, setVerticalScrollPosition } = scroll;

// takes an element object
function scrollToElement(el: HTMLElement) {
  const target = getScrollTarget(el);
  const offset = el.offsetTop;
  const duration = 1000;
  setVerticalScrollPosition(target, offset, duration);
}
</script>
