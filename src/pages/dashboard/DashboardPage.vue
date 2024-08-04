<template>
  <q-page>
    <div :style="{ height: '500px' }">
      <v-chart :option="chartOptions" />
    </div>
  </q-page>
</template>
<script lang="ts" setup>
import { EChartsOption } from 'echarts';
import { useInstitutionStore } from 'src/stores/institution-store';
import { useProfileStore } from 'src/stores/profile-store';
import { computed, onMounted, ref } from 'vue';
import VChart from 'vue-echarts';
const tShirtSizes = ref<{ size: string; value?: number }[]>([
  { size: 'S', value: 0 },
  { size: 'M', value: 0 },
  { size: 'L', value: 0 },
  { size: 'XL', value: 0 },
  { size: 'XXL', value: 0 },
]);
const institutions = ref<{ inst: string; value?: number }[]>([]);
const chartOptions = computed(() => {
  return {
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          name: 'activity',
          backgroundColor: 'transparent',
        },
      },
    },

    tooltip: {},
    series: [
      {
        name: 'Institution',
        type: 'pie',
        radius: [20, 140],
        center: ['25%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 5,
        },
        emphasis: {
          label: {
            show: true,
          },
        },
        data: institutions.value.map((i) => ({
          name: i.inst,
          value: i.value,
        })),
      },
      {
        name: 'T-Shirt Sizes',
        type: 'pie',
        radius: [20, 140],
        center: ['75%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 5,
        },
        data: tShirtSizes.value.map((t) => ({
          name: t.size,
          value: t.value,
        })),
      },
    ],
  } as EChartsOption;
});
const profileStore = useProfileStore();
const institutionStore = useInstitutionStore();
onMounted(async () => {
  await Promise.all(
    tShirtSizes.value.map((t) => {
      return profileStore
        .countProfiles({
          tshirt: t.size,
        })
        .then((count) => {
          t.value = count;
        });
    })
  );
  institutionStore.streamAll().subscribe({
    next(value) {
      institutions.value = value.map((i) => ({
        inst: i.key,
        value: 0,
      }));
      institutions.value.forEach((i) => {
        profileStore
          .countProfiles({
            institution: i.inst,
          })
          .then((count) => {
            i.value = count;
          });
      });
    },
  });
});
</script>
