<script setup lang="ts">
import { AlertTriangle, Home, ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{
  error: {
    statusCode: number
    statusMessage: string
  }
}>()

const handleError = () => {
  clearError({ redirect: '/' })
}

const is404 = computed(() => props.error.statusCode === 404)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 gradient-bg">
    <!-- Background decorations -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
    </div>

    <div class="text-center animate-fade-up max-w-md">
      <div class="glass-card-lg rounded-3xl p-12">
        <div class="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle class="h-10 w-10 text-destructive" />
        </div>

        <h1 class="text-6xl font-bold gradient-text mb-4">
          {{ error.statusCode }}
        </h1>

        <h2 class="text-2xl font-semibold mb-4">
          {{ is404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' }}
        </h2>

        <p class="text-muted-foreground mb-8">
          <template v-if="is404">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </template>
          <template v-else>
            {{ error.statusMessage || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.' }}
          </template>
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button @click="$router.back()">
            <UiButton variant="outline" size="lg">
              <ArrowLeft class="h-4 w-4" />
              Kembali
            </UiButton>
          </button>
          <button @click="handleError">
            <UiButton size="lg">
              <Home class="h-4 w-4" />
              Ke Beranda
            </UiButton>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


