<script setup lang="ts">
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import type { Transporter } from '@/types'

const props = defineProps<{
  transporters: Transporter[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  assign: [transporterId: string]
  close: []
}>()

// Form validation schema
const validationSchema = yup.object({
  transporterId: yup.string().required('Please select a transporter'),
})

const { handleSubmit, errors } = useForm({
  validationSchema,
})

const { value: transporterId } = useField<string>('transporterId')

const selectedTransporter = ref<Transporter | null>(null)

function selectTransporter(transporter: Transporter) {
  transporterId.value = transporter.id
  selectedTransporter.value = transporter
}

const onSubmit = handleSubmit((values) => {
  emit('assign', values.transporterId)
})

function renderStars(rating: number) {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}
</script>

<template>
  <!-- Modal Overlay -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-white/10">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">Assign Transporter</h3>
            <p class="text-surface-400 text-sm mt-0.5">Select an available transporter below</p>
          </div>
          <button
            id="btn-close-modal"
            @click="$emit('close')"
            class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <form @submit.prevent="onSubmit" class="px-6 py-4">
        <!-- Transporter List -->
        <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
          <label
            v-for="transporter in transporters"
            :key="transporter.id"
            :for="`transporter-${transporter.id}`"
            class="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200"
            :class="
              transporterId === transporter.id
                ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                : 'border-white/5 bg-white/5 hover:border-white/15'
            "
          >
            <input
              :id="`transporter-${transporter.id}`"
              type="radio"
              name="transporter"
              :value="transporter.id"
              v-model="transporterId"
              @change="selectTransporter(transporter)"
              class="sr-only"
            />

            <!-- Avatar -->
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0"
              :class="
                transporterId === transporter.id
                  ? 'bg-gradient-to-br from-primary-500 to-accent-500'
                  : 'bg-surface-700'
              "
            >
              {{ transporter.name.charAt(0) }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-white font-semibold text-sm truncate">{{ transporter.name }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-surface-400">{{ transporter.vehicleType }}</span>
                <span class="text-surface-600">•</span>
                <span class="text-xs text-surface-400">{{ transporter.vehiclePlate }}</span>
              </div>
            </div>

            <!-- Rating -->
            <div class="text-right shrink-0">
              <span class="text-xs text-amber-400">{{ renderStars(transporter.rating) }}</span>
              <p class="text-xs text-surface-500 mt-0.5">{{ transporter.rating.toFixed(1) }}</p>
            </div>
          </label>
        </div>

        <!-- Validation Error -->
        <p v-if="errors.transporterId" class="mt-3 text-red-400 text-sm">
          {{ errors.transporterId }}
        </p>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            id="btn-cancel-assign"
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-assign"
            type="submit"
            :disabled="isLoading || !transporterId"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Assigning...
            </span>
            <span v-else>Confirm Assignment</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: modal-in 0.25s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
