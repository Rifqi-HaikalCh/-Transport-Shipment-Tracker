<script setup lang="ts">
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import type { Transporter } from '@/types'

defineProps<{
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
    <div class="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-white">Assign Transporter</h3>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5 font-medium">Select an available transporter below</p>
          </div>
          <button
            id="btn-close-modal"
            @click="$emit('close')"
            class="w-8 h-8 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            class="flex items-center gap-4 p-4 rounded border cursor-pointer transition-all duration-200 shadow-sm"
            :class="
              transporterId === transporter.id
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow'
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
              class="w-10 h-10 rounded flex items-center justify-center font-bold shrink-0"
              :class="
                transporterId === transporter.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              "
            >
              {{ transporter.name.charAt(0) }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-zinc-900 dark:text-white font-bold text-sm truncate">{{ transporter.name }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-zinc-500 font-medium">{{ transporter.vehicleType }}</span>
                <span class="text-zinc-300 dark:text-zinc-600">•</span>
                <span class="text-xs text-zinc-500 font-medium">{{ transporter.vehiclePlate }}</span>
              </div>
            </div>

            <!-- Rating -->
            <div class="text-right shrink-0">
              <span class="text-xs text-amber-500 dark:text-amber-400">{{ renderStars(transporter.rating) }}</span>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-bold">{{ transporter.rating.toFixed(1) }}</p>
            </div>
          </label>
        </div>

        <!-- Validation Error -->
        <p v-if="errors.transporterId" class="mt-3 text-red-600 dark:text-red-400 text-sm font-semibold">
          {{ errors.transporterId }}
        </p>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            id="btn-cancel-assign"
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-assign"
            type="submit"
            :disabled="isLoading || !transporterId"
            class="px-5 py-2.5 rounded text-sm font-bold bg-orange-600 text-white shadow-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:hover:bg-orange-600 disabled:cursor-not-allowed active:scale-95"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
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
