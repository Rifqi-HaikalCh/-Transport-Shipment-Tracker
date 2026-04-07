<script setup lang="ts">
import { useShipmentStore } from '@/stores/shipment'
import { Search } from 'lucide-vue-next'

const store = useShipmentStore()
</script>

<template>
  <div class="relative w-full sm:w-80">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Search class="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
    </div>
    <input
      id="search-input"
      type="text"
      placeholder="Search by tracking no., origin, destination..."
      :value="store.searchQuery"
      @input="(e) => store.setSearchQuery((e.target as HTMLInputElement).value)"
      class="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-shadow shadow-sm"
    />
  </div>
</template>
