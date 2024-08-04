<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';
import { theWorkflows } from './workflows/the.workflows';
import { CanvasRenderer } from 'echarts/renderers';

import {
  PieChart,
  BarChart,
  ScatterChart,
  LineChart,
  EffectScatterChart,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GeoComponent,
  GridComponent,
} from 'echarts/components';
import { use } from 'echarts/core';

use([
  CanvasRenderer,
  GridComponent,
  BarChart,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GeoComponent,
  ScatterChart,
  EffectScatterChart,
]);

defineOptions({
  name: 'App',
});
const $q = useQuasar();
$q.dark.set(true);
onMounted(async () => {
  await import('src/workflows');
  theWorkflows.ready(true);
});
</script>
