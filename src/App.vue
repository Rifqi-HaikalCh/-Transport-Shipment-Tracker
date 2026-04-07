<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterView } from 'vue-router'
import { Moon, Sun } from 'lucide-vue-next'
import SplashScreen from '@/components/SplashScreen.vue'

const isDark = ref(true)
const splashDone = ref(false)

watchEffect(() => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>

<template>
  <!-- Splash Screen (shown once on app load) -->
  <SplashScreen v-if="!splashDone" @done="splashDone = true" />

  <div v-else class="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
    <!-- Top navigation bar -->
    <nav class="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-3 group">
            <!-- Company Logo -->
            <img
              src="/company-logo.jpg"
              alt="Company Logo"
              class="h-9 w-auto object-contain rounded"
              draggable="false"
            />
            <div>
              <h1 class="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                ShipTrack<span class="text-orange-600">Pro</span>
              </h1>
              <p class="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-widest uppercase">
                Transport Tracker
              </p>
            </div>
          </router-link>

          <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <span class="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></span>
              <span class="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wider">System Online</span>
            </div>

            <button
              @click="toggleTheme"
              class="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              aria-label="Toggle Theme"
            >
              <Sun v-if="isDark" class="w-4 h-4" />
              <Moon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Footer -->
    <footer class="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center">
        <p class="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          &copy;2026 Rifqi Haikal
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
