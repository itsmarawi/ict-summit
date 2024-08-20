<template>
  <q-page class="">
    <div class="full-width row">
      <q-img
        class="rounded-borders col"
        :src="activeSummit?.promoBg || '~assets/ictSummit2.jpg'"
      >
      </q-img>
      <div
        v-if="profileStore.theUser"
        class="text-bold absolute q-ma-md"
        :class="$q.screen.gt.sm ? 'q-ma-xl text-h4' : 'text-h6'"
        style="background: transparent"
      >
        Hi, {{ profileStore.theUser.name }}!
        <span v-if="profileStore.theUser.institution">
          thank you for registering
          <span
            v-if="
              date.getDateDiff(
                new Date(),
                activeSummit?.dateStart || '',
                'days'
              ) < 0
            "
            >, see you on
            {{ date.formatDate(activeSummit?.dateStart || '', 'MMM DD') }}</span
          >
        </span>
        <q-btn
          v-if="prices.length"
          flat
          :label="`Redeem ${prices.length}`"
          :to="{ name: 'prices' }"
          icon="redeem"
        />
      </div>
    </div>
    <div class="row fit justify-center items-center q-gutter-lg q-py-lg">
      <CountCard
        :count="
          String(
            date.getDateDiff(
              activeSummit?.dateEnd || activeSummit?.dateStart || new Date(),
              activeSummit?.dateStart || new Date(),
              'days'
            ) || 1
          )
        "
        description="Days"
      />
      <CountCard :count="String(speakers.length || 2)" description="Speakers" />
      <CountCard
        :count="String(topics.length || 1) + '+'"
        description="Topics"
      />
      <CountCard
        :count="String(activeSummit?.slots || 0)"
        description="Slots"
        :color="(activeSummit?.slots || 0) <= attendees ? 'negative' : ''"
      />
      <CountCard
        v-if="attendees"
        :count="attendees.toString()"
        description="Attendees"
      />
      <CountCard
        v-if="isAdmin"
        :count="signUps.toString()"
        description="SignUps"
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
      <div class="row">
        <div class="col-12 col-md text-bod2 q-px-lg">
          <p class="text-h6">
            Join us as we accelerate Lanao del Sur's digital future!
          </p>
          <div class="text-h6">
            The 2nd Ranao ICT Summit is your gateway to:
          </div>
          <ul>
            <li>
              Unleash Innovation: Discover cutting-edge technologies and
              solutions transforming industries.
            </li>
            <li>
              Expand Your Network: Connect with IT enthusiasts, industry
              leaders, and potential partners.
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

          <p class="text-h6" v-if="!profileStore.theUser?.institution">
            <q-btn color="primary" class="text-bold" icon-right="ads_click"
              >Register Now&nbsp;</q-btn
            >
            and be part of the digital revolution!
          </p>
        </div>
        <div class="col-12 col-md" v-if="profileStore.theUser?.institution">
          <div class="text-h6 text-center">
            You are registered representing
            {{ profileStore.theUser.institution }}
          </div>
          <q-card class="bg-white q-ma-xl">
            <q-card-section>
              <q-img src="~assets/shirt.png" />
            </q-card-section>
            <div class="text-h6 text-bold text-center text-dark">
              Your TShirt Size: {{ profileStore.theUser.tshirt }}
            </div>
          </q-card>
        </div>
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
          :avatar="
            speaker.avatar ||
            (speaker.defaultAvatar == 'woman'
              ? defaultWomanAvatar
              : defaultManAvatar) ||
            ''
          "
          :company-logo="speaker.companyLogo || ''"
          :full-name="speaker.fullname"
          :position="speaker.position"
          :expertise="speaker.expertise"
          :description="speaker.description"
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
          v-for="topic in topicList"
          :key="topic.name + topic.schedule"
          :schedule="topic.schedule"
          class="col-12 col-md-5"
        >
          <div class="q-gutter-sm q-my-sm">
            <q-avatar
              size="md"
              v-for="speaker in topic.speakerList"
              :key="speaker?.key"
            >
              <q-img :src="speaker?.avatar" />
              <q-tooltip>{{ speaker?.fullname }}</q-tooltip>
            </q-avatar>
          </div>
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
          :website="s.website"
          :bg="s.background"
          :name="s.name"
          :description="s.description"
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
import { computed, onMounted, ref } from 'vue';
import CountCard from 'components/CountCard.vue';
import SpeakerCard from 'components/SpeakerCard.vue';
import TopicCard from 'src/components/TopicCard.vue';
import InstitutionCard from 'src/components/InstitutionCard.vue';
import { date, scroll } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from 'src/stores/profile-store';
import { ISpeaker, ISponsor, ISummit, ITopic, RafflePrice } from 'src/entities';
import { useRaffleDrawStore } from 'src/stores/raffle-draw-store';
import { useSummitStore } from 'src/stores/summit-store';

defineOptions({
  name: 'IndexPage',
});
const $route = useRoute();
const $router = useRouter();
const profileStore = useProfileStore();
const raffeDrawStore = useRaffleDrawStore();
const summitStore = useSummitStore();

$router.afterEach((route) => {
  if (route.hash && route.name == 'home') {
    handleHash(route.hash);
  }
});
interface ITopicWithSpeakers extends ITopic {
  speakerList: (ISpeaker | undefined)[];
}
const slide = ref('0');
const attendees = ref(0);
const signUps = ref(0);
const activeSummit = ref<ISummit>();
const prices = ref<RafflePrice[]>([]);
const sponsors = ref<ISponsor[]>([]);
const speakers = ref<ISpeaker[]>([]);
const topics = ref<ITopic[]>([]);
const topicList = computed(() => {
  return topics.value.map(
    (t) =>
      ({
        ...t,
        speakerList: (t.speakers || []).map((key) =>
          speakers.value.find((s) => s.key == key)
        ),
      } as ITopicWithSpeakers)
  );
});
const defaultManAvatar = ref<string>();
const defaultWomanAvatar = ref<string>();

const isAdmin = computed(() => {
  return /^admin$/i.test(profileStore.theUser?.role || '');
});
onMounted(async () => {
  activeSummit.value = await summitStore.getSummit(
    new Date().getFullYear().toString()
  );

  defaultManAvatar.value = (await import('../assets/man-dummy.webp')).default;
  defaultWomanAvatar.value = (
    await import('../assets/dummy-woman.png')
  ).default;

  sponsors.value = [];
  speakers.value = [];
  topics.value = [];
  const summit = activeSummit.value?.key || new Date().getFullYear().toString();
  const speakerSub = summitStore.streamSpeakers(summit).subscribe({
    next(value) {
      if (value.length) {
        speakers.value = value
          .filter((s) => s.status)
          .sort((a, b) => (a.order || 100) - (b.order || 100));
        speakerSub.unsubscribe();
      }
    },
  });
  const topicsSub = summitStore.streamTopics(summit).subscribe({
    next(value) {
      if (value.length) {
        topics.value = value
          .filter((t) => t.status)
          .sort(
            (a, b) =>
              new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
          );
        topicsSub.unsubscribe();
      }
    },
  });
  const sponsorSub = summitStore.streamSponsors(summit).subscribe({
    next(value) {
      if (value.length) {
        sponsors.value = value
          .filter((s) => s.status)
          .sort((a, b) => (a.order || 100) - (b.order || 100));
        sponsorSub.unsubscribe();
      }
    },
  });
  handleHash();
  if (profileStore.theUser) {
    attendees.value = await profileStore.countRegisters();
    raffeDrawStore.streamParticipantPrices(profileStore.theUser).subscribe({
      next(value) {
        prices.value = value.filter((p) => p.status == 'ready');
        prices.value.forEach((p) => {
          new Notification(`Redeem your ${p.price} price`, {
            body: `Your qualified to redeem ${p.price} price`,
            tag: p.key,
          });
        });
      },
    });
    if (isAdmin.value) {
      signUps.value = await profileStore.countProfiles({});
    }
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
