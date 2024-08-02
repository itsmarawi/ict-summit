<template>
  <q-page class="">
    <div class="full-width row">
      <q-img class="rounded-borders col" src="~assets/ictSummit2.jpg">
        <div
          v-if="profileStore.theUser"
          class="text-h4 text-bold"
          :class="$q.screen.gt.sm ? 'q-ma-xl' : ''"
          style="background: transparent"
        >
          Hi, {{ profileStore.theUser.name }}!
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
          <q-btn class="text-bold" dense>Register Now</q-btn> and be part of the
          digital revolution!
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
          avatar="https://www.realtechnirman.com/wp-content/uploads/2017/02/man-dummy.jpg"
          company-logo="https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-1/366598395_122103301430005970_7083018911420604229_n.jpg?stp=dst-jpg_p200x200&_nc_cat=109&ccb=1-7&_nc_sid=f4b9fd&_nc_eui2=AeH_P8oUMfBWL8xeAym5H3EShcHhQ3PZHfqFweFDc9kd-irSWu3rT258VTtaEW31y6g&_nc_ohc=mo8mxVziV0cQ7kNvgGLXa0t&_nc_ht=scontent-mnl1-2.xx&oh=00_AYAo475oTYKt3AZbWvmd-F5Wz4Lj3CnrtJJIjYzl2Uaukg&oe=66B0851C"
          full-name="MAHID A. MACADATO"
          :position="'Communications Officer'"
          expertise="Communications Specialist"
        />
        <SpeakerCard
          avatar="https://media.licdn.com/dms/image/D5603AQEg6gM0GPKWTA/profile-displayphoto-shrink_800_800/0/1684551192284?e=2147483647&v=beta&t=pjWJWw_3RYL4mWYACa7TAi_0EZxrW3Vh3DflL1sYfpw"
          company-logo="https://th.bing.com/th/id/OIP.uVU4EvwhKGbijAJs7_VM5QHaHa?rs=1&pid=ImgDetMain"
          full-name="Moslemen M. Macarambon Jr."
          :position="'President: Democracy.net.ph'"
          expertise="Innovative Governance"
        />
        <SpeakerCard
          avatar="https://www.aquasafemine.com/wp-content/uploads/2018/06/dummy-woman-570x570.png"
          company-logo="https://th.bing.com/th/id/OIP.C1qUTEd3TjLOjthcUun7YAHaHa?rs=1&pid=ImgDetMain"
          full-name="Mudzna M. Asakil"
          :position="'College Dean'"
          expertise="Database"
        />
        <SpeakerCard
          avatar="https://www.aquasafemine.com/wp-content/uploads/2018/06/dummy-woman-570x570.png"
          company-logo="https://th.bing.com/th/id/OIP.ow2rjrmA32_uMoiAbwCbJwHaHU?rs=1&pid=ImgDetMain"
          full-name="Hannah Grace M. Parcon"
          :position="'Project Focal: DICT IIDB'"
          expertise="Digital Innovation"
        />
        <SpeakerCard
          avatar="https://www.realtechnirman.com/wp-content/uploads/2017/02/man-dummy.jpg"
          company-logo="https://th.bing.com/th/id/OIP.ow2rjrmA32_uMoiAbwCbJwHaHU?rs=1&pid=ImgDetMain"
          full-name="Engr. Amal Salih M. Asum"
          :position="'Provicial Field Officer'"
          expertise="Innovative Governance"
        />
        <SpeakerCard
          avatar="https://yt3.googleusercontent.com/ytc/AIdro_nezLkMAII0B_rjmEe_7CulWH488wO5M3mjhLYyquprIg=s160-c-k-c0x00ffffff-no-rj"
          company-logo="https://avatars.githubusercontent.com/u/51888165?s=200&v=4"
          full-name="Azreen M. Marohomsalic"
          :position="'Chief Executive Officer'"
          expertise="Project Management"
        />
        <SpeakerCard
          avatar="https://avatars.githubusercontent.com/u/74109685?v=4"
          company-logo="https://avatars.githubusercontent.com/u/51888165?s=200&v=4"
          full-name="Lucman M. Abdulrachman"
          :position="'Chief Technology Officer'"
          expertise="Software Architecture"
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
        <TopicCard schedule="Aug 28" class="col-12 col-md-5">
          <div>DIGITAL INNOVATION</div>
          <ul>
            <li>ICT Industry Development for Lanao del Sur</li>
            <li>Role and Updates of Academe in ICT</li>
            <li>
              Philippine Skills Framework (PSF) for ICT-related industries
            </li>
          </ul>
        </TopicCard>
        <TopicCard schedule="Aug 28" class="col-12 col-md-5">
          <div>Governance</div>
          <ul>
            <li>IT Governance and ICT Council in LGU LDS Province</li>
            <li>LDS ICT Ecosystem: Opportunities</li>
          </ul>
        </TopicCard>
        <TopicCard schedule="Aug 29" class="col-12 col-md-5">
          <div>ICT Council and ICT Trends</div>
          <ul>
            <li>ICT Council 101</li>
            <li>Cybersecurity Best Practices</li>
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
          :key="s"
          :logo="s"
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
                icon="register"
                :to="{ name: 'start', params: { action: 'signup' } }"
                >Register Now</q-btn
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
defineOptions({
  name: 'IndexPage',
});
const $route = useRoute();
const $router = useRouter();
const profileStore = useProfileStore();
$router.afterEach((route) => {
  if (route.hash && route.name == 'home') {
    handleHash(route.hash);
  }
});
const slide = ref('0');
const attendees = ref(300);
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
  handleHash();
  attendees.value = await profileStore.countRegisters();
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
