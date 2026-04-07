<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useShipmentStore } from '@/stores/shipment'
import { useToast } from 'vue-toastification'
import ShipmentTable from '@/components/ShipmentTable.vue'
import StatusFilter from '@/components/StatusFilter.vue'
import SearchBar from '@/components/SearchBar.vue'
import StatsCards from '@/components/StatsCards.vue'
import AddShipmentModal from '@/components/AddShipmentModal.vue'
import AddTransporterModal from '@/components/AddTransporterModal.vue'
import { Plus, Truck } from 'lucide-vue-next'

const store = useShipmentStore()
const toast = useToast()

const showAddShipment = ref(false)
const showAddTransporter = ref(false)

onMounted(async () => {
  await store.fetchShipments()
  await store.fetchTransporters()
  store.startRealtimeSimulation()
  store.startSupabaseRealtime()
})

onUnmounted(() => {
  store.stopRealtimeSimulation()
  store.stopSupabaseRealtime()
})

function handleShipmentCreated(trackingNumber: string) {
  showAddShipment.value = false
  toast.success(`Shipment ${trackingNumber} created successfully!`)
}

function handleTransporterCreated(name: string) {
  showAddTransporter.value = false
  toast.success(`Transporter "${name}" registered successfully!`)
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Shipments</h2>
        <p class="text-zinc-500 dark:text-zinc-400 font-medium">Track and manage all your shipments in one place.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Add Transporter (secondary) -->
        <button
          id="btn-add-transporter"
          @click="showAddTransporter = true"
          class="flex items-center gap-2 px-4 py-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-sm font-bold transition-all duration-200 shadow-sm"
        >
          <Truck class="w-4 h-4" />
          <span class="hidden sm:inline">Add Transporter</span>
          <span class="sm:hidden">Transporter</span>
        </button>

        <!-- New Shipment (primary) -->
        <button
          id="btn-new-shipment"
          @click="showAddShipment = true"
          class="flex items-center gap-2 px-4 py-2.5 rounded bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-all duration-200 shadow-sm active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span class="hidden sm:inline">New Shipment</span>
          <span class="sm:hidden">New</span>
        </button>
      </div>
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

    <!-- Modals -->
    <AddShipmentModal
      v-if="showAddShipment"
      @close="showAddShipment = false"
      @created="handleShipmentCreated"
    />
    <AddTransporterModal
      v-if="showAddTransporter"
      @close="showAddTransporter = false"
      @created="handleTransporterCreated"
    />
  </div>
</template>
