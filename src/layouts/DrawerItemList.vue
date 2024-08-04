<template>
  <q-list>
    <template v-for="(menuItem, index) in menuList" :key="index">
      <q-separator v-if="menuItem.children" />
      <q-item
        clickable
        v-ripple
        :class="!hasAccess(menuItem, role) ? 'hidden' : ''"
        v-if="!menuItem.children"
        :to="menuItem.route"
      >
        <q-item-section avatar>
          <q-icon :name="menuItem.icon" />
        </q-item-section>
        <q-item-section> {{ menuItem.label }} </q-item-section>
      </q-item>
      <q-expansion-item
        expand-separator
        :icon="menuItem.icon"
        :label="menuItem.label"
        default-opened
        v-else
      >
        <drawer-item-list :menu-list="menuItem.children" :role="role" />
      </q-expansion-item>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { IDrawerItem } from './drawer.item';

defineProps<{
  menuList: IDrawerItem[];
  role?: string;
}>();

function hasAccess(menu: IDrawerItem, role?: string) {
  if (!menu.requires) return true;
  return menu.requires.includes(role || 'no role');
}
</script>
