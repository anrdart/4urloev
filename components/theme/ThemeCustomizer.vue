<script setup lang="ts">
import { Settings, X, Palette, Sun, Moon, Sparkles, RotateCcw, Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const themeStore = useThemeStore()
const authStore = useAuthStore()

const colorPresets = [
  { name: 'Purple', primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981' },
  { name: 'Green', primary: '#10B981', secondary: '#06B6D4', accent: '#F59E0B' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#EC4899', accent: '#8B5CF6' },
  { name: 'Orange', primary: '#F97316', secondary: '#EF4444', accent: '#FBBF24' },
]

const handlePresetClick = (preset: typeof colorPresets[0]) => {
  themeStore.setTheme({
    primaryColor: preset.primary,
    secondaryColor: preset.secondary,
    accentColor: preset.accent,
  })
  toast.success(`Tema ${preset.name} diterapkan`)
}

const handleSave = async () => {
  if (!authStore.user) {
    toast.error('Silakan login untuk menyimpan tema')
    return
  }
  
  try {
    await themeStore.saveThemeToSupabase(authStore.user.id)
    toast.success('Tema berhasil disimpan')
  } catch {
    toast.error('Gagal menyimpan tema')
  }
}

const handleReset = () => {
  themeStore.resetTheme()
  toast.success('Tema direset ke default')
}
</script>

<template>
  <!-- Toggle Button -->
  <button
    v-if="!themeStore.isCustomizerOpen"
    @click="themeStore.toggleCustomizer"
    class="fixed bottom-24 right-6 z-40 p-3 rounded-full glass-card shadow-lg hover:shadow-xl hover:scale-110 transition-all"
    aria-label="Open theme customizer"
  >
    <Settings class="h-5 w-5 text-primary animate-spin" style="animation-duration: 10s" />
  </button>

  <!-- Customizer Panel -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      v-if="themeStore.isCustomizerOpen"
      class="fixed right-0 top-0 bottom-0 w-80 z-50 glass-card-lg border-l shadow-2xl overflow-y-auto"
    >
      <!-- Header -->
      <div class="sticky top-0 glass-card border-b p-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Palette class="h-5 w-5 text-primary" />
          <span class="font-semibold">Kustomisasi Tema</span>
        </div>
        <button
          @click="themeStore.toggleCustomizer"
          class="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="p-4 space-y-6">
        <!-- Dark Mode Toggle -->
        <div class="glass-card-sm rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Sun v-if="!themeStore.isDark" class="h-5 w-5 text-yellow-500" />
              <Moon v-else class="h-5 w-5 text-blue-500" />
              <span class="font-medium">Mode Gelap</span>
            </div>
            <button
              @click="themeStore.toggleDark"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                themeStore.isDark ? 'bg-primary' : 'bg-muted'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  themeStore.isDark ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Color Presets -->
        <div>
          <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles class="h-4 w-4 text-primary" />
            Preset Warna
          </h3>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="preset in colorPresets"
              :key="preset.name"
              @click="handlePresetClick(preset)"
              class="w-full aspect-square rounded-xl overflow-hidden hover:scale-110 transition-transform relative group"
              :title="preset.name"
            >
              <div
                class="absolute inset-0"
                :style="{
                  background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 50%, ${preset.accent} 100%)`
                }"
              />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <span class="text-white text-xs font-medium">{{ preset.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Custom Colors -->
        <div>
          <h3 class="text-sm font-medium mb-3">Warna Kustom</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Primary</span>
              <input
                type="color"
                :value="themeStore.primaryColor"
                @input="themeStore.setTheme({ primaryColor: ($event.target as HTMLInputElement).value })"
                class="w-10 h-10 rounded-lg border border-input cursor-pointer"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Secondary</span>
              <input
                type="color"
                :value="themeStore.secondaryColor"
                @input="themeStore.setTheme({ secondaryColor: ($event.target as HTMLInputElement).value })"
                class="w-10 h-10 rounded-lg border border-input cursor-pointer"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Accent</span>
              <input
                type="color"
                :value="themeStore.accentColor"
                @input="themeStore.setTheme({ accentColor: ($event.target as HTMLInputElement).value })"
                class="w-10 h-10 rounded-lg border border-input cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Glassmorphism Intensity -->
        <div>
          <h3 class="text-sm font-medium mb-3">Intensitas Glass</h3>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="themeStore.glassmorphismIntensity"
            @input="themeStore.setTheme({ glassmorphismIntensity: parseFloat(($event.target as HTMLInputElement).value) })"
            class="w-full accent-primary"
          />
        </div>

        <!-- Actions -->
        <div class="space-y-2 pt-4 border-t border-border/50">
          <UiButton @click="handleSave" class="w-full" :disabled="!authStore.user">
            <Save class="h-4 w-4" />
            Simpan Tema
          </UiButton>
          <UiButton @click="handleReset" variant="outline" class="w-full">
            <RotateCcw class="h-4 w-4" />
            Reset ke Default
          </UiButton>
        </div>
      </div>
    </div>
  </Transition>
</template>


