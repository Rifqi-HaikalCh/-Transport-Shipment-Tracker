<script setup lang="ts">
import { useShipmentStore } from '@/stores/shipment'

const store = useShipmentStore()
</script>

<template>
  <div class="relative w-full sm:w-80">
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-surface-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </div>
    <input
      id="search-input"
      type="text"
      placeholder="Search by tracking no., origin, destination..."
      :value="store.searchQuery"
      @input="(e) => store.setSearchQuery((e.target as HTMLInputElement).value)"
      class="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
    />
  </div>
</template>
