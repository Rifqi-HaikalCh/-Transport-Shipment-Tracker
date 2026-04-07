<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterView } from 'vue-router'
import { Moon, Sun } from 'lucide-vue-next'

// Dark mode state - defaulting to true based on previous aesthetic
const isDark = ref(true)

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
  <div class="min-h-screen bg-transparent content-wrapper">
    <!-- Top navigation bar -->
    <nav class="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo / Brand -->
          <router-link to="/" class="flex items-center gap-3 group">
            <div
              class="w-8 h-8 rounded bg-orange-600 flex items-center justify-center shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                <circle cx="17" cy="18" r="2" />
                <circle cx="7" cy="18" r="2" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                ShipTrack<span class="text-orange-600">Pro</span>
              </h1>
              <p class="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-widest uppercase">
                Transport Tracker
              </p>
            </div>
          </router-link>

          <!-- Right side indicator & Toggle -->
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
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
/* Page transition animation */
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
