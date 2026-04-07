<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Vue3Lottie } from 'vue3-lottie'

const emit = defineEmits<{ done: [] }>()

const animationData = ref<object | null>(null)

const visible = ref(true)
const textVisible = ref(false)
const exiting = ref(false)

onMounted(async () => {
  // Fetch the Lottie JSON from /public at runtime
  const res = await fetch('/Global parcel shipment tracking.json')
  animationData.value = await res.json()

  // Show app name text after animation has had a moment to display
  setTimeout(() => {
    textVisible.value = true
  }, 800)

  // Start exit animation
  setTimeout(() => {
    exiting.value = true
  }, 3000)

  // Emit done after exit animation completes
  setTimeout(() => {
    visible.value = false
    emit('done')
  }, 3400)
})
</script>

<template>
  <Transition name="splash-fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950"
      :class="{ 'splash-exit': exiting }"
    >
      <!-- Background accent glow -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-600/5 blur-3xl"></div>
      </div>

      <!-- Lottie Animation -->
      <div class="relative w-72 h-72 sm:w-80 sm:h-80">
        <Vue3Lottie
          v-if="animationData"
          :animation-data="animationData"
          :loop="true"
          :auto-play="true"
          class="w-full h-full"
        />
      </div>

      <!-- App Name & Tagline -->
      <div
        class="mt-2 text-center transition-all duration-700"
        :class="textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <h1 class="text-3xl font-bold text-white tracking-tight">
          ShipTrack<span class="text-orange-500">Pro</span>
        </h1>
        <p class="text-zinc-400 text-sm font-semibold tracking-widest uppercase mt-1.5">
          Transport Shipment Tracker
        </p>
        <div class="mt-6 flex items-center justify-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.splash-fade-leave-active {
  transition: opacity 0.4s ease-out;
}
.splash-fade-leave-to {
  opacity: 0;
}

.splash-exit {
  animation: splash-out 0.4s ease-in forwards;
}

@keyframes splash-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>
