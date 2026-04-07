<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { X, Truck, Phone, CreditCard, Star } from 'lucide-vue-next'

const emit = defineEmits<{
  close: []
  created: [name: string]
}>()

const vehicleTypes = ['Truck', 'Van', 'Container', 'Ship', 'Motorcycle', 'Pickup']

const validationSchema = yup.object({
  name: yup.string().required('Company / transporter name is required'),
  phone: yup.string().required('Phone number is required').matches(/^[+\d\s\-().]+$/, 'Enter a valid phone number'),
  vehicleType: yup.string().required('Vehicle type is required').oneOf(vehicleTypes, 'Select a valid vehicle type'),
  vehiclePlate: yup.string().required('Vehicle plate number is required'),
  rating: yup.number().min(1, 'Min rating is 1').max(5, 'Max rating is 5').default(4.0),
})

interface TransporterFormValues {
  name: string
  phone: string
  vehicleType: string
  vehiclePlate: string
  rating: number
}

const { handleSubmit, errors, isSubmitting, resetForm } = useForm<TransporterFormValues>({
  validationSchema,
  initialValues: { name: '', phone: '', vehicleType: '', vehiclePlate: '', rating: 4.0 },
})

const { value: name } = useField<string>('name')
const { value: phone } = useField<string>('phone')
const { value: vehicleType } = useField<string>('vehicleType')
const { value: vehiclePlate } = useField<string>('vehiclePlate')
const { value: rating } = useField<number>('rating')

import { useShipmentStore } from '@/stores/shipment'
const store = useShipmentStore()

const onSubmit = handleSubmit(async (values) => {
  const result = await store.addTransporter({
    name: values.name,
    phone: values.phone,
    vehicleType: values.vehicleType,
    vehiclePlate: values.vehiclePlate,
    rating: values.rating,
  })

  if (result.success && result.transporter) {
    emit('created', result.transporter.name)
    resetForm()
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="absolute inset-0 bg-zinc-900/50 dark:bg-black/70 backdrop-blur-sm"></div>

    <div class="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-modal-in">
      <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
            <Truck class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-900 dark:text-white">Register Transporter</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Add a new transport company or vehicle</p>
          </div>
        </div>
        <button
          id="btn-close-add-transporter"
          @click="$emit('close')"
          class="w-8 h-8 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="px-6 py-5 space-y-4">
        <div>
          <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Transporter Name
          </label>
          <input
            id="input-transporter-name"
            v-model="name"
            type="text"
            placeholder="e.g. PT. Ekspres Logistik"
            class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            :class="errors.name ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-500 font-medium">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            <Phone class="w-3 h-3 inline mr-1" />Phone Number
          </label>
          <input
            id="input-transporter-phone"
            v-model="phone"
            type="tel"
            placeholder="e.g. +62 812-3456-7890"
            class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            :class="errors.phone ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
          />
          <p v-if="errors.phone" class="mt-1 text-xs text-red-500 font-medium">{{ errors.phone }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              <Truck class="w-3 h-3 inline mr-1" />Vehicle Type
            </label>
            <select
              id="select-vehicle-type"
              v-model="vehicleType"
              class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              :class="errors.vehicleType ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
            >
              <option value="">Select type</option>
              <option v-for="type in vehicleTypes" :key="type" :value="type">{{ type }}</option>
            </select>
            <p v-if="errors.vehicleType" class="mt-1 text-xs text-red-500 font-medium">{{ errors.vehicleType }}</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              <CreditCard class="w-3 h-3 inline mr-1" />Vehicle Plate
            </label>
            <input
              id="input-vehicle-plate"
              v-model="vehiclePlate"
              type="text"
              placeholder="e.g. B 1234 XYZ"
              class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              :class="errors.vehiclePlate ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-400'"
            />
            <p v-if="errors.vehiclePlate" class="mt-1 text-xs text-red-500 font-medium">{{ errors.vehiclePlate }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            <Star class="w-3 h-3 inline mr-1" />Initial Rating (1–5)
          </label>
          <input
            id="input-transporter-rating"
            v-model="rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            placeholder="4.0"
            class="w-full px-3 py-2.5 rounded border text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30 border-zinc-300 dark:border-zinc-700 focus:border-orange-400"
          />
          <p v-if="errors.rating" class="mt-1 text-xs text-red-500 font-medium">{{ errors.rating }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            id="btn-cancel-add-transporter"
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-submit-add-transporter"
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded text-sm font-bold bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              Registering...
            </span>
            <span v-else>Register Transporter</span>
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
