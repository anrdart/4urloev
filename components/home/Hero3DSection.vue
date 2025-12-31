<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

/**
 * Hero section with lazy-loaded 3D components
 * Requirements: 2.2 - Lazy load 3D components only when required
 */

const products = [
  {
    type: 'gift' as const,
    color: '#6366f1',
    label: 'Kotak Hadiah',
    desc: 'Hadiah spesial untuk orang tersayang',
  },
  {
    type: 'sphere' as const,
    color: '#f472b6',
    label: 'Bola Dekoratif',
    desc: 'Dekorasi unik untuk ruangan',
  },
  {
    type: 'torus' as const,
    color: '#fbbf24',
    label: 'Cincin Custom',
    desc: 'Personalisasi sesuai keinginan',
  },
]

// Lazy load 3D components using defineAsyncComponent
const LazyScene3DWrapper = defineAsyncComponent({
  loader: () => import('~/components/3d/LazyScene3DWrapper.vue'),
  delay: 200,
  timeout: 30000,
})

const LazyProduct3DShowcase = defineAsyncComponent({
  loader: () => import('~/components/3d/LazyProduct3DShowcase.vue'),
  delay: 200,
  timeout: 30000,
})
</script>

<template>
  <section class="py-32 px-4 relative">
    <div class="container mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 md:mb-16 animate-fade-up">
        <div class="inline-flex items-center gap-2 mb-4">
          <Sparkles class="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span class="text-sm font-semibold text-primary uppercase tracking-wider">
            Pengalaman 3D
          </span>
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
          Interaksi 3D Interaktif
        </h2>
        <p class="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Jelajahi produk kami dalam tampilan 3D yang memukau. Putar, zoom, dan
          berinteraksi dengan setiap item.
        </p>
      </div>

      <!-- 3D Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        <div
          v-for="(item, index) in products"
          :key="index"
          :class="`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover-lift animate-fade-up animation-delay-${(index + 1) * 200}`"
        >
          <ClientOnly>
            <LazyScene3DWrapper height="250px">
              <LazyProduct3DShowcase :type="item.type" :color="item.color" />
            </LazyScene3DWrapper>
            <template #fallback>
              <div class="h-[250px] bg-muted/50 rounded-xl flex items-center justify-center">
                <p class="text-muted-foreground">Loading 3D...</p>
              </div>
            </template>
          </ClientOnly>
          <div class="mt-4 sm:mt-6">
            <h3 class="text-lg sm:text-xl md:text-2xl font-bold mb-2">
              {{ item.label }}
            </h3>
            <p class="text-sm sm:text-base text-muted-foreground">
              {{ item.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Background decoration -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl -z-10" />
  </section>
</template>


