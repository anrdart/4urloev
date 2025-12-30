<script setup lang="ts">
import { Gift, Star, ShoppingCart } from 'lucide-vue-next'
import { formatPrice } from '~/lib/utils'

const { getBundles } = useProducts()
const cartStore = useCartStore()

const { data: bundles, pending } = await useAsyncData('bundles', () => getBundles(true))

useSeoMeta({
  title: 'Bundles - 4UrLoev',
  description: 'Hemat lebih banyak dengan bundle package spesial dari 4UrLoev',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-12 animate-fade-up">
      <UiBadge variant="glass" class="mb-4">
        <Gift class="h-3 w-3 mr-1" />
        Special Bundles
      </UiBadge>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
        Paket Hemat Spesial
      </h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        Dapatkan value lebih dengan bundle package pilihan kami. 
        Hemat hingga 30% dibanding beli satuan!
      </p>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <UiSkeleton v-for="i in 3" :key="i" class="h-96 rounded-2xl" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!bundles?.length" class="text-center py-16">
      <div class="glass-card rounded-3xl p-12 max-w-md mx-auto">
        <Gift class="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h2 class="text-2xl font-semibold mb-4">Belum Ada Bundle</h2>
        <p class="text-muted-foreground mb-8">
          Bundle spesial sedang disiapkan. Pantau terus update dari kami!
        </p>
        <NuxtLink to="/products">
          <UiButton size="lg">
            Lihat Produk Lainnya
          </UiButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Bundles Grid -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="(bundle, index) in bundles"
        :key="bundle.id"
        :class="`glass-card rounded-2xl overflow-hidden hover-lift animate-fade-up animation-delay-${(index + 1) * 100}`"
      >
        <!-- Image -->
        <div class="aspect-video bg-muted/50 relative">
          <img
            :src="bundle.image_url || '/placeholder.svg'"
            :alt="bundle.name"
            class="w-full h-full object-cover"
          />
          <div v-if="bundle.discount_percentage" class="absolute top-4 left-4">
            <UiBadge variant="destructive" class="text-sm font-bold">
              -{{ bundle.discount_percentage }}%
            </UiBadge>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-bold">{{ bundle.name }}</h3>
            <div class="flex items-center gap-1 text-yellow-500">
              <Star class="h-4 w-4 fill-current" />
              <span class="text-sm font-medium">4.9</span>
            </div>
          </div>

          <p class="text-muted-foreground text-sm mb-4 line-clamp-2">
            {{ bundle.description }}
          </p>

          <!-- Bundle Items -->
          <div v-if="bundle.bundle_items?.length" class="mb-4">
            <p class="text-xs text-muted-foreground mb-2">Termasuk:</p>
            <div class="flex flex-wrap gap-1">
              <UiBadge
                v-for="item in bundle.bundle_items.slice(0, 3)"
                :key="item.id"
                variant="outline"
                class="text-xs"
              >
                {{ item.quantity }}x {{ (item.product as any)?.name || 'Product' }}
              </UiBadge>
              <UiBadge
                v-if="bundle.bundle_items.length > 3"
                variant="outline"
                class="text-xs"
              >
                +{{ bundle.bundle_items.length - 3 }} lainnya
              </UiBadge>
            </div>
          </div>

          <!-- Price -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-bold gradient-text">
                {{ formatPrice(bundle.price) }}
              </p>
              <p v-if="bundle.discount_percentage" class="text-sm text-muted-foreground line-through">
                {{ formatPrice(bundle.price / (1 - bundle.discount_percentage / 100)) }}
              </p>
            </div>

            <UiButton>
              <ShoppingCart class="h-4 w-4" />
              Beli
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


