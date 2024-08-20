<template>
  <BaseTable row-key="name" :columns="columns" :rows="filteredProfiles" flat>
    <!-- Table -->
    <template #tableTop>
      <TableTop
        @onSearch="onSearchRecords"
        @onExportAccounts="exportAccounts"
        @generateUCoupon="generateUCoupon()"
        :elements="[
          {
            event: 'onExportAccounts',
            isShowBtn: true,
            icon: 'download',
            label: 'Export',
          },
          {
            event: 'generateUCoupon',
            isShowBtn: true,
            label: 'Generate Role Coupon',
            icon: 'sell',
          },
        ]"
      />
    </template>
    <template #tableBodyCustomColumn="{ props, col }">
      <TableBodyCustomColumn
        @onToggleStatus="onToggleStatus(props.row)"
        :color="translateStatus(col.value).color"
        :name="translateStatus(col.value).name"
        :col="col"
      />
    </template>
    <template #tableHeaderRight>
      <q-th style="font-size: 20px">Action</q-th>
    </template>
    <template #tableBodyRight="{ props }">
      <TableBodyRight
        @onToggleRole="onToggleRole(props.row)"
        @generate-u-coupon="generateUCoupon(props.row)"
        :elements="computedPropsTableActionRight"
      />
    </template>
    <!-- Table -->

    <!-- Card -->
    <template #cardItemRight="{ props }">
      <CardItemRight
        @on-toggle-role="onToggleRole(props.row)"
        @generate-u-coupon="generateUCoupon(props.row)"
        :elements="computedPropsTableActionRight"
      />
    </template>
    <template #cardItemCustomSection="{ props, col }">
      <CardItemCustomSection
        @onToggleStatus="onToggleStatus(props.row)"
        :color="translateStatus(col.value).color"
        :col="col"
      />
    </template>
    <template #fabAction>
      <FabAction
        :actions="[
          {
            event: 'onExportAccounts',
            isShowBtn: true,
            icon: 'download',
            label: 'Export',
            cb() {
              exportAccounts();
            },
          },
          {
            event: 'generateUCoupon',
            isShowBtn: true,
            label: 'Generate Role Coupon',
            icon: 'sell',
            cb() {
              generateUCoupon();
            },
          },
        ]"
      ></FabAction>
    </template>
    <!-- Card -->
  </BaseTable>
</template>
<script setup lang="ts">
import { exportFile, useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { IProfile, ISummit } from 'src/entities';
import { accountColumns } from 'src/pages/account/ui-components/table/table.columns';
import { useProfileStore } from 'src/stores/profile-store';
import { theDialogs } from 'src/dialogs';
import BaseTable from 'src/components/base/BaseTable.vue';
import TableTop from 'src/pages/account/ui-components/table/table-components/TableTop.vue';
import TableBodyRight from 'src/pages/account/ui-components/table/table-components/TableBodyRight.vue';
import TableBodyCustomColumn from 'src/pages/account/ui-components/table/table-components/TableBodyCustomColumn.vue';
import CardItemRight from 'src/pages/account/ui-components/table/card-components/CardItemRight.vue';
import CardItemCustomSection from 'src/pages/account/ui-components/table/card-components/CardItemCustomSection.vue';
import { propsTableActionRight } from './table.elements';
import { useSummitStore } from 'src/stores/summit-store';
import FabAction from 'src/components/common/table/fab-components/FabAction.vue';

const $q = useQuasar();
const profileStore = useProfileStore();
const summitStore = useSummitStore();
const activeSummit = ref<ISummit>();
const columns = ref(accountColumns);
const profiles = ref([] as IProfile[]);
const profile = ref({} as IProfile);
const search = ref('');

onMounted(async () => {
  profile.value = profileStore.theUser as IProfile;
  onStreamAllProfiles();
  activeSummit.value = await summitStore.getSummit(
    new Date().getFullYear().toString()
  );
});

const computedPropsTableActionRight = computed(() => {
  return propsTableActionRight;
});

async function onSearchRecords(term: string) {
  search.value = term;
}
const filteredProfiles = computed(() => {
  if (search.value) {
    return profiles.value.filter((r) =>
      new RegExp(search.value, 'i').test(
        r.email +
          ':' +
          r.name +
          '>Institution:' +
          r.institution +
          '>Summit:' +
          r.summit +
          '>TShirt:' +
          r.tshirt
      )
    );
  }
  return profiles.value;
});

function onStreamAllProfiles() {
  profileStore.streamAllProfiles().subscribe({
    next(value) {
      profiles.value = value as IProfile[];
    },
  });
}

function translateStatus(val: boolean) {
  return val
    ? { name: 'Activated', color: 'positive' }
    : { name: 'Deactivated', color: 'warning' };
}

function onToggleRole(payload: IProfile) {
  theDialogs.emit({
    type: 'setAccountRoleDialog',
    arg: {
      profile: payload,
      done(profile) {
        if (profile.role) {
          $q.notify({
            message: 'Role for ' + profile.name + ' is assigned',
            color: 'positive',
          });
        }
      },
    },
  });
}
async function exportAccounts() {
  const accounts = filteredProfiles.value.sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const status = exportFile(
    'profiles.csv',
    accounts.reduce((content, p) => {
      return (
        content +
        `\r\n"${p.name}","${p.email}","${p.institution || 'none'}","${
          p.position
        }","${p.tshirt}","${p.summit}","${p.gender}"`
      );
    }, '"Name","Email","Institution","Position","Tshirt","Summit","Gender"'),
    {
      encoding: 'windows-1252',
      mimeType: 'text/tsv;charset=windows-1252;',
    }
  );

  if (status === true) {
    $q.notify({
      message: `Exported ${accounts.length}`,
      icon: 'info',
      color: 'positive',
    });
  } else {
    // browser denied it
    $q.notify({
      message: 'Brower denied it:' + String(status),
      icon: 'error',
      color: 'negative',
    });
  }
}

function onToggleStatus(value: IProfile) {
  const msg = !value.status
    ? 'Activate this account'
    : 'Deactivate this account';
  $q.dialog({
    title: `<span class="text-negative">${msg}</span>`,
    message: `Are you sure you want to ${msg}?`,
    color: value.status ? 'warning' : undefined,
    cancel: { outline: true, rounded: true, color: 'negative' },
    ok: { rounded: true },
    persistent: true,
    html: true,
  })
    .onOk(async () => {
      await profileStore.toggleProfileStatus(value);
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    });
}
function generateUCoupon(payload?: IProfile) {
  if (!activeSummit.value) return;
  theDialogs.emit({
    type: 'generateURoleCouponDialog',
    arg: {
      profile: payload,
      summit: activeSummit.value,
      error(err) {
        $q.notify({
          message: String(err),
          color: 'negative',
          icon: 'error',
        });
      },
    },
  });
}
</script>
