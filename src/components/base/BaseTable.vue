<template>
  <q-table
    :row-key="rowKey"
    :columns="columns"
    :rows="rows"
    :loading="loading"
    v-model:pagination="paging"
    :selection="selection"
    :grid="isCardEnabled || !isDesktop"
    v-bind="$attrs"
    @request="(props) => onRequestPage(props)"
  >
    <!-- Table when Desktop View -->
    <template v-slot:top>
      <slot name="tableTop" />
    </template>
    <template v-slot:top-left>
      <slot name="tableTopLeft" />
    </template>
    <template v-slot:top-right>
      <slot name="tableTopRight" />
    </template>
    <template #body-cell-operator="{ value, row }">
      <slot
        v-if="$slots.bodyCellOperator"
        name="bodyCellOperator"
        :value="value"
        :row="row"
      />
    </template>
    <template v-slot:header="props">
      <q-tr :props="props">
        <slot
          v-if="$slots.tableHeaderLeft"
          name="tableHeaderLeft"
          :props="props"
        />

        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>

        <slot
          v-if="$slots.tableHeaderRight"
          name="tableHeaderRight"
          :props="props"
        />
      </q-tr>
    </template>

    <template
      v-if="
        $slots.tableBodyLeft ||
        $slots.tableBodyCustomColumn ||
        $slots.tableBodyRight
      "
      v-slot:body="props"
    >
      <q-tr :props="props">
        <slot v-if="$slots.tableBodyLeft" name="tableBodyLeft" :props="props" />

        <q-td
          v-for="col in props.cols"
          class="text-white"
          :class="
            col.name === props.cols[0].name ? 'bg-secondary' : 'bg-primary'
          "
          :key="col.name"
          :props="props"
        >
          <slot
            v-if="$slots.tableBodyCustomColumn"
            name="tableBodyCustomColumn"
            :props="props"
            :col="col"
          />
          <span v-else> {{ col.value }}</span>
        </q-td>

        <slot
          v-if="$slots.tableBodyRight"
          name="tableBodyRight"
          :props="props"
        />
      </q-tr>
    </template>
    <!-- Table when Desktop View -->

    <!-- Card when Mobile View -->
    <template v-slot:item="props">
      <div
        class="q-px-md q-py-sm col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        :style="props.selected ? 'transform: scale(0.95);' : ''"
      >
        <q-card
          :class="
            props.selected ? ($q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2') : ''
          "
          class="q-pa-sm"
          bordered
          flat
          style="border-radius: 12px"
        >
          <q-list dense>
            <template v-for="col in props.cols" :key="col.name">
              <q-item v-if="col.name === props.cols[0].name" class="q-my-sm">
                <q-item-section v-if="$slots.cardItemLeft" side>
                  <slot name="cardItemLeft" :props="props" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-h6 text-secondary text-weight-bold">
                    {{ col.value }}
                  </q-item-label>
                  <q-item-label caption>{{ col.label }}</q-item-label>
                </q-item-section>

                <q-item-section v-if="$slots.cardItemRight" side top>
                  <slot name="cardItemRight" :props="props" />
                </q-item-section>
              </q-item>
              <q-item
                v-else
                class="text-subtitle2 text-info text-weight-regular"
              >
                <q-item-section>
                  <q-item-label class="text-info text-weight-medium">
                    {{ col.label }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <slot
                    v-if="$slots.cardItemCustomSection"
                    name="cardItemCustomSection"
                    :props="props"
                    :col="col"
                  />
                  <q-item-label
                    v-else
                    caption
                    class="text-subtitle2 text-info text-weight-light"
                  >
                    {{ col.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-if="$slots.cardItemAction">
              <q-separator class="q-mb-sm" color="grey-5" />
              <q-item>
                <q-item-section>
                  <slot name="cardItemAction" :props="props" />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card>
      </div>
    </template>
    <!-- Card when Mobile View -->

    <template v-if="$slots.noData" #no-data>
      <slot name="noData" />
    </template>

    <template v-if="$slots.pagination" #pagination="scope">
      <slot name="pagination" :scope="scope" />
    </template>
  </q-table>
  <q-page-container v-if="$slots.fabAction && !isDesktop">
    <slot name="fabAction" />
  </q-page-container>
</template>
<script setup lang="ts">
import { QTableProps, useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';

const paging = ref({
  page: 1 as number | undefined,
  rowsPerPage: 10 as number | undefined,
  rowsNumber: undefined as number | undefined,
});

const $q = useQuasar();

interface IBaseTable {
  rowKey: string;
  columns: QTableProps['columns'];
  rows: unknown[];
  isCardEnabled?: boolean;
  loading?: boolean;
  selection?: 'single' | 'multiple' | 'none' | undefined;
  pagination?: {
    sortBy?: string;
    descending?: boolean;
    page?: number;
    rowsPerPage?: number;
    rowsNumber?: number;
  };
}

const props = withDefaults(defineProps<IBaseTable>(), {
  rowKey: 'name',
  columns(props) {
    return props.columns || [];
  },
  rows(props) {
    return props.rows || [];
  },
});
onMounted(() => {
  if (props.pagination) {
    paging.value.page = props.pagination.page;
    paging.value.rowsNumber = props.pagination.rowsNumber;
    paging.value.rowsPerPage = props.pagination.rowsPerPage;
  }
});

const emit = defineEmits<{
  (
    event: 'request',
    requestProp: {
      /**
       * Pagination object
       */
      pagination: {
        /**
         * Column name (from column definition)
         */
        sortBy: string;
        /**
         * Is sorting in descending order?
         */
        descending: boolean;
        /**
         * Page number (1-based)
         */
        page: number;
        /**
         * How many rows per page? 0 means Infinite
         */
        rowsPerPage: number;
      };
      /**
       * String/Object to filter table with (the 'filter' prop)
       */
      filter?: string;
    }
  ): number;
}>();

function onRequestPage(props: {
  pagination: {
    sortBy: string;
    descending: boolean;
    page: number;
    rowsPerPage: number;
  };
}) {
  emit('request', props);
  paging.value.page = props.pagination.page;
}
const isDesktop = computed(() => {
  return !$q.screen.lt.md;
});
</script>

<style lang="sass" scoped>
.grid-style-transition
  transition: transform .28s, background-color .28s
</style>
