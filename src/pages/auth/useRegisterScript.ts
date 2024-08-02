import { capitalize, onUnmounted, ref } from 'vue';
import { IInstitution } from 'src/entities';
import { theDialogs } from 'src/dialogs';
import { useQuasar } from 'quasar';
import { useInstitutionStore } from 'src/stores/institution-store';
import { useProfileStore } from 'src/stores/profile-store';
import { useRoute, useRouter } from 'vue-router';

export default function () {
  const gender = ref<'male' | 'female'>('male');
  const tShirtSize = ref<'S' | 'M' | 'L' | 'XL' | 'XXL'>();
  const position = ref('');
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
  const $q = useQuasar();
  const institutionStore = useInstitutionStore();
  const profileStore = useProfileStore();
  const $router = useRouter();
  const $route = useRoute();

  const sub = institutionStore.streamAll().subscribe({
    next(value) {
      listInstutions.value = [...value];
    },
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
    try {
      loading.value = true;
      const office = await institutionStore.findInstitutionByKey(
        institution.value.key
      );
      if (!office) {
        await institutionStore.createInstitution(institution.value);
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
    listInstutions,
    positionOptions,
    filterPositions,
    filteredPositions,
    registerInstitution,
    mapInstitution,
    registerUser,
  };
}
