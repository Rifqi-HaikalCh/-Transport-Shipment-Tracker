<script setup lang="ts">
import { onMounted } from 'vue'
import { useShipmentStore } from '@/stores/shipment'
import ShipmentTable from '@/components/ShipmentTable.vue'
import StatusFilter from '@/components/StatusFilter.vue'
import SearchBar from '@/components/SearchBar.vue'
import StatsCards from '@/components/StatsCards.vue'

const store = useShipmentStore()

onMounted(() => {
  store.fetchShipments()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Shipments</h2>
      <p class="text-surface-400">Track and manage all your shipments in one place.</p>
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
