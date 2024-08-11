<template>
  <q-page>
    <q-card flat>
      <q-card-section class="text-h6"> Dashboard </q-card-section>
      <q-card-section>
        <div class="row q-gutter-sm justify-center">
          <q-card
            class="col-12"
            :style="
              'height: ' +
              Math.min(500, $q.screen.width - 30, $q.screen.height - 30) +
              'px;'
            "
          >
            <v-chart :option="chartInstiutionOptions" />
          </q-card>
          <q-card
            class="col-12 col-md-5"
            :style="
              'height: ' +
              Math.min(500, $q.screen.width - 30, $q.screen.height - 30) +
              'px;'
            "
          >
            <v-chart :option="chartInstiutionPieOptions" />
          </q-card>
          <q-card
            class="col-12 col-md-5"
            :style="
              'height: ' +
              Math.min(500, $q.screen.width - 30, $q.screen.height - 30) +
              'px;'
            "
          >
            <v-chart :option="chartTShirtSizesOptions" />
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script lang="ts" setup>
import { EChartsOption } from 'echarts';
import { useInstitutionStore } from 'src/stores/institution-store';
import { useProfileStore } from 'src/stores/profile-store';
import { capitalize, computed, onMounted, ref } from 'vue';
import VChart from 'vue-echarts';
const tShirtSizes = ref<{ size: string; value?: number }[]>([
  { size: 'S', value: 0 },
  { size: 'M', value: 0 },
  { size: 'L', value: 0 },
  { size: 'XL', value: 0 },
  { size: 'XXL', value: 0 },
  { size: '3XL', value: 0 },
  { size: '4XL', value: 0 },
]);
const institutions = ref<
  { inst: string; name: string; male?: number; female?: number }[]
>([]);
const commonChartOptions: EChartsOption = {
  toolbox: {
    show: true,
    feature: {
      dataView: {
        show: true,
      },
    },
  },
  tooltip: {
    trigger: 'axis',
  },
};
const chartInstiutionOptions = computed(() => {
  return {
    ...commonChartOptions,
    calculable: true,
    xAxis: [
      {
        type: 'category',
        data: institutions.value.map((i) => `${i.name} (${i.inst})`),
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: ['female', 'male'].map((g: string) => ({
      name: capitalize(g),
      type: 'bar',
      data: institutions.value.map(
        (i) => (i as unknown as Record<string, number>)[g]
      ),
    })),
  } as EChartsOption;
});
const chartInstiutionPieOptions = computed(() => {
  return {
    ...commonChartOptions,
    series: [
      {
        name: 'Institution',
        type: 'pie',
        radius: [20, 140],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 5,
        },
        label: {
          formatter: '{b} : {c} ({d}%)',
        },
        emphasis: {
          label: {
            show: true,
          },
        },
        data: institutions.value.map((i) => ({
          name: i.inst,
          value: (i.female || 0) + (i.male || 0),
        })),
      },
    ],
  } as EChartsOption;
});

const chartTShirtSizesOptions = computed(() => {
  return {
    ...commonChartOptions,
    series: [
      {
        name: 'T-Shirt Sizes',
        type: 'pie',
        radius: [20, 140],
        roseType: 'area',
        itemStyle: {
          borderRadius: 5,
        },
        label: {
          formatter: '{b} : {c} ({d}%)',
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
        name: i.name,
      }));
      institutions.value.forEach((i) => {
        profileStore
          .countProfiles({
            institution: i.inst,
            gender: 'male',
          })
          .then((count) => {
            i.male = count;
          });
        profileStore
          .countProfiles({
            institution: i.inst,
            gender: 'female',
          })
          .then((count) => {
            i.female = count;
          });
      });
    },
  });
});
</script>
