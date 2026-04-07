<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useShipmentStore } from '@/stores/shipment'
import { X, Package, MapPin, Weight, Calendar, Truck } from 'lucide-vue-next'

const store = useShipmentStore()

const emit = defineEmits<{
  close: []
  created: [trackingNumber: string]
}>()

// Preview of auto-generated tracking number shown before submit
const previewTrackingNumber = computed(() => {
  const year = new Date().getFullYear()
  return `TRK-${year}-XXXXXX`
})

const validationSchema = yup.object({
  origin: yup.string().required('Origin city is required'),
  destination: yup.string().required('Destination city is required').test(
    'not-same',
    'Destination must differ from origin',
    function (value) {
      return value?.toLowerCase() !== this.parent.origin?.toLowerCase()
    },
  ),
  description: yup.string().required('Cargo description is required'),
  weight: yup.number().typeError('Weight must be a number').positive('Weight must be positive').required('Weight is required'),
  estimatedDelivery: yup.string().required('Estimated delivery date is required').test(
    'future-date',
    'Delivery date must be in the future',
    (value) => !value || new Date(value) > new Date(),
  ),
})

const { handleSubmit, errors, isSubmitting, resetForm } = useForm({ validationSchema })
const { value: origin } = useField<string>('origin')
const { value: destination } = useField<string>('destination')
const { value: description } = useField<string>('description')
const { value: weight } = useField<number>('weight')
const { value: estimatedDelivery } = useField<string>('estimatedDelivery')

const selectedTransporterId = ref<string>('')

const today = new Date().toISOString().split('T')[0]

const onSubmit = handleSubmit(async (values) => {
  const result = await store.addShipment({
    origin: values.origin,
    destination: values.destination,
    description: values.description,
    weight: values.weight,
    estimatedDelivery: values.estimatedDelivery,
    transporterId: selectedTransporterId.value || null,
  })

  if (result.success && result.shipment) {
    emit('created', result.shipment.trackingNumber)
    resetForm()
  }
})
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="absolute inset-0 bg-zinc-900/50 dark:bg-black/70 backdrop-blur-sm"></div>

    <!-- Modal -->
    <div class="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-modal-in">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
            <Package class="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-900 dark:text-white">New Shipment</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Fill in shipment details below</p>
          </div>
        </div>
        <button
          id="btn-close-add-shipment"
          @click="$emit('close')"
          class="w-8 h-8 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tracking Number Preview -->
      <div class="px-6 pt-4">
        <div class="flex items-center gap-2 px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <span class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Tracking No. (auto-generated):</span>
          <span class="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">{{ previewTrackingNumber }}</span>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="px-6 py-4 space-y-4">
        <!-- Origin & Destination row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              <MapPin class="w-3 h-3 inline mr-1" />Origin
            </label>
            <input
              id="input-origin"
              v-model="origin"
              type="text"
              placeholder="e.g. Jakarta"
              class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              :class="errors.origin ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
            />
            <p v-if="errors.origin" class="mt-1 text-xs text-red-500 font-medium">{{ errors.origin }}</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              <MapPin class="w-3 h-3 inline mr-1" />Destination
            </label>
            <input
              id="input-destination"
              v-model="destination"
              type="text"
              placeholder="e.g. Surabaya"
              class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              :class="errors.destination ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
            />
            <p v-if="errors.destination" class="mt-1 text-xs text-red-500 font-medium">{{ errors.destination }}</p>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            <Package class="w-3 h-3 inline mr-1" />Cargo Description
          </label>
          <input
            id="input-description"
            v-model="description"
            type="text"
            placeholder="e.g. Elektronik - Laptop 15 units"
            class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            :class="errors.description ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
          />
          <p v-if="errors.description" class="mt-1 text-xs text-red-500 font-medium">{{ errors.description }}</p>
        </div>

        <!-- Weight & Delivery row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              <Weight class="w-3 h-3 inline mr-1" />Weight (kg)
            </label>
            <input
              id="input-weight"
              v-model="weight"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 150"
              class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              :class="errors.weight ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
            />
            <p v-if="errors.weight" class="mt-1 text-xs text-red-500 font-medium">{{ errors.weight }}</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              <Calendar class="w-3 h-3 inline mr-1" />Est. Delivery
            </label>
            <input
              id="input-delivery-date"
              v-model="estimatedDelivery"
              type="date"
              :min="today"
              class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              :class="errors.estimatedDelivery ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
            />
            <p v-if="errors.estimatedDelivery" class="mt-1 text-xs text-red-500 font-medium">{{ errors.estimatedDelivery }}</p>
          </div>
        </div>

        <!-- Transporter (optional) -->
        <div>
          <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            <Truck class="w-3 h-3 inline mr-1" />Assign Transporter
            <span class="ml-1 text-zinc-400 font-normal normal-case tracking-normal">(optional — can be assigned later)</span>
          </label>
          <select
            id="select-transporter"
            v-model="selectedTransporterId"
            class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700 focus:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="">— No transporter yet —</option>
            <option
              v-for="t in store.availableTransporters"
              :key="t.id"
              :value="t.id"
            >
              {{ t.name }} · {{ t.vehicleType }} · {{ t.vehiclePlate }}
            </option>
          </select>
          <p v-if="!selectedTransporterId" class="mt-1.5 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Shipment without transporter cannot be tracked by the system.
          </p>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            id="btn-cancel-add-shipment"
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-submit-add-shipment"
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              Creating...
            </span>
            <span v-else>Create Shipment</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-in {
  animation: modal-in 0.2s ease-out;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
