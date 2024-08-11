import { capitalize, computed, onMounted, onUnmounted, ref } from 'vue';
import { IInstitution, ISummit } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { date, useQuasar } from 'quasar';
import { useInstitutionStore } from 'src/stores/institution-store';
import { useProfileStore } from 'src/stores/profile-store';
import { useRoute, useRouter } from 'vue-router';
import { useSummitStore } from 'src/stores/summit-store';

export default function () {
  const $q = useQuasar();
  const institutionStore = useInstitutionStore();
  const profileStore = useProfileStore();
  const summitStore = useSummitStore();
  const $router = useRouter();
  const $route = useRoute();

  const gender = ref<string>(profileStore.theUser?.gender || 'male');
  const tShirtSize = ref<string>(profileStore.theUser?.tshirt || 'L');
  const position = ref(profileStore.theUser?.position || '');
  const institution = ref<IInstitution>();
  const listInstutions = ref<IInstitution[]>([]);
  const positionOptions = ref([
    'Computer Programmer III',
    'Integration Specialist',
    'IT & Multimedia Freelancer',
    'Municipal Information Technology Officer',
    'Associate Software Engineer',
    'Software Developer',
    'Instructor',
    'Intern - Automation Engineer',
    'Teacher 1/School ICT Coordinator',
    'School ICT',
    'Teacher I/ School ICT Coordinator',
    'Teacher 1/ School ICT coordinator',
    'IT Personnel',
    'Intern - Software Engineer',
    'Student',
    'Associate Engineer',
    'Aspiring Data Analyst',
    'Intern',
    'Faculty',
    'System Records Officer',
    'Records Officer I',
    'Web Manager',
    'Software Architech',
    'Division ITO',
    'Virtual assistant',
    'IT Point Person',
    'Training Specialist II',
    'Individual',
    'IT Consultant',
    'Chief Operating Officer',
    'Instructor I',
    'Computer Programmer II',
    'ICT',
    'ICT Coordinator',
    'Legal Assistant',
    'District Head',
    'Assistant Secretary',
    'School ICT Coordinator',
    'Collage IT Graduate',
    'Info Tech Officer I',
    'Fresh Graduate',
    'Teacher I - ICT',
  ]);
  const filteredPositions = ref<string[]>([]);
  const loading = ref(false);
  const activeSummit = ref<ISummit>();
  const registerCount = ref(0);
  const isRegistrationFull = computed(() => {
    return (
      !profileStore.theUser?.institution &&
      (activeSummit.value?.slots || 300) <= registerCount.value
    );
  });
  const sub = institutionStore.streamAll().subscribe({
    next(value) {
      listInstutions.value = [...value];
      if (profileStore.theUser?.institution) {
        institution.value = listInstutions.value.find(
          (i) => i.key == profileStore.theUser?.institution
        );
      }
    },
  });
  onMounted(async () => {
    if (!profileStore.theUser?.emailVerified) {
      $router.replace({ name: 'verify' });
    }
    activeSummit.value = await summitStore.getSummit(
      new Date().getFullYear().toString()
    );
    if (
      activeSummit.value?.cutOff &&
      date.getDateDiff(new Date(), activeSummit.value?.cutOff, 'days') >= 0
    ) {
      $q.notify({
        icon: 'error',
        color: 'negative',
        message: 'Registration have reached the cut-off',
      });
      $router.replace({
        name: 'home',
      });
    } else {
      registerCount.value = await profileStore.countRegisters();
    }
  });
  onUnmounted(() => {
    sub.unsubscribe();
  });
  function filterPositions(val: string, update: (v: VoidCallback) => void) {
    update(() => {
      if (val === '') {
        filteredPositions.value = positionOptions.value;
      } else {
        const needle = val.toLowerCase();
        filteredPositions.value = positionOptions.value.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        );
      }
    });
  }
  function registerInstitution() {
    if (isRegistrationFull.value) {
      $q.notify({
        icon: 'error',
        color: 'negative',
        message: 'Registration is Full',
      });
      return;
    }
    if (!tShirtSize.value) {
      $q.notify({
        icon: 'warning',
        message: 'Select T-shirt Size',
      });
      return;
    }
    theDialogs.emit({
      type: 'registerInstitution',
      arg: {
        done(record) {
          //
          institution.value = record;
          listInstutions.value.push(record);
        },
        error(error) {
          $q.notify({
            icon: 'error',
            color: 'negative',
            message: String(error),
          });
        },
      },
    });
  }
  function mapInstitution(inst: IInstitution) {
    return `${inst.key} (${capitalize(inst.sector)})`;
  }
  async function registerUser() {
    if (!institution.value?.key || !profileStore.theUser) {
      return;
    }
    if (isRegistrationFull.value) {
      $q.notify({
        icon: 'error',
        color: 'negative',
        message: 'Registration slots is Full',
      });
      return;
    }
    try {
      loading.value = true;
      const office = await institutionStore.findInstitutionByKey(
        institution.value.key
      );
      if (!office) {
        await institutionStore.createInstitution(institution.value);
      }

      const instHeadCount = await profileStore.countProfiles({
        institution: institution.value.key,
        summit: activeSummit?.value?.key || '',
      });
      if (
        instHeadCount > 0 &&
        activeSummit.value &&
        (activeSummit.value.slotsPerInstitution || 0) > 0 &&
        (activeSummit.value.slotsPerInstitution || 0) <= instHeadCount
      ) {
        $q.notify({
          icon: 'error',
          color: 'negative',
          message: `Registration slots for ${institution.value.name} is full`,
          caption: 'Consider registering your department or sub-unit',
        });
        loading.value = false;
        return;
      }

      const user = profileStore.theUser;
      await profileStore.modifyProfile(
        user?.key,
        ['institution', 'position', 'gender', 'tshirt', 'summit'],
        {
          institution: institution.value.key,
          position: position.value,
          gender: gender.value,
          tshirt: tShirtSize.value,
          summit: new Date().getFullYear().toString(),
        }
      );
      profileStore.clearUser();
      await profileStore.getUserAsync();
      loading.value = false;
      $q.notify({
        message: 'Your registration is recorded',
        color: 'positive',
        icon: 'check',
        position: 'center',
        closeBtn: true,
        onDismiss() {
          if ($route.query?.redirect) {
            $router.replace($route.query?.redirect as string);
          } else {
            $router.replace({
              name: 'home',
            });
          }
        },
      });
    } catch (error) {
      $q.notify({
        message: String(error),
        color: 'negative',
        icon: 'error',
      });
    }
  }
  return {
    institution,
    gender,
    tShirtSize,
    position,
    loading,
    listInstutions,
    positionOptions,
    filterPositions,
    filteredPositions,
    registerInstitution,
    mapInstitution,
    registerUser,
    isRegistrationFull,
  };
}
