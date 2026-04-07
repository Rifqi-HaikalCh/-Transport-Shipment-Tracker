<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useShipmentStore } from '@/stores/shipment'
import ShipmentTable from '@/components/ShipmentTable.vue'
import StatusFilter from '@/components/StatusFilter.vue'
import SearchBar from '@/components/SearchBar.vue'
import StatsCards from '@/components/StatsCards.vue'

const store = useShipmentStore()

onMounted(async () => {
  await store.fetchShipments()
  store.startRealtimeSimulation()
})

onUnmounted(() => {
  store.stopRealtimeSimulation()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Shipments</h2>
      <p class="text-zinc-500 dark:text-zinc-400 font-medium">Track and manage all your shipments in one place.</p>
    </div>

    <!-- Stats Overview Cards -->
    <StatsCards />

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <StatusFilter />
      <SearchBar />
    </div>

    <!-- Shipment Table -->
    <ShipmentTable />
  </div>
</template>
