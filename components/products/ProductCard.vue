<script setup lang="ts">
import { Heart, ShoppingCart, Eye } from 'lucide-vue-next'
import type { Product } from '~/types'
import { formatPrice } from '~/lib/utils'

const props = withDefaults(defineProps<{
  product: Product
  priority?: boolean
}>(), {
  priority: false,
})

// SSR-safe store access
const cartStore = import.meta.client ? useCartStore() : null
const wishlistStore = import.meta.client ? useWishlistStore() : null

// Track if component is mounted (client-side)
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// SSR-safe computed - always return false on server to prevent hydration mismatch
const isInWishlist = computed(() => isMounted.value && wishlistStore?.hasItem(props.product.id))
const isInCart = computed(() => isMounted.value && cartStore?.hasItem(props.product.id))

const primaryImage = computed(() => {
  const primary = props.product.product_images?.find(img => img.is_primary)
  return primary?.url || props.product.product_images?.[0]?.url || '/placeholder.svg'
})

const handleAddToCart = () => {
  cartStore?.addItem(props.product, 1)
}

const handleToggleWishlist = () => {
  wishlistStore?.toggleItem(props.product)
}
</script>

<template>
  <div class="group glass-card rounded-2xl overflow-hidden hover-lift">
    <!-- Image Container -->
    <div class="relative aspect-square overflow-hidden bg-muted/50">
      <UiOptimizedImage
        :src="primaryImage"
        :alt="product.name"
        :width="400"
        :height="400"
        :priority="priority"
        preset="productCard"
        placeholder="skeleton"
        fit="cover"
        class="w-full h-full"
        img-class="transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      
      <!-- Overlay actions -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div class="absolute bottom-4 left-4 right-4 flex gap-2">
          <NuxtLink :to="`/products/${product.id}`" class="flex-1">
            <UiButton variant="glass" size="sm" class="w-full">
              <Eye class="h-4 w-4" />
              View
            </UiButton>
          </NuxtLink>
          <UiButton
            variant="glass"
            size="icon"
            @click.prevent="handleAddToCart"
            :class="{ 'text-secondary': isInCart }"
          >
            <ShoppingCart class="h-4 w-4" />
          </UiButton>
        </div>
      </div>
      
      <!-- Wishlist button -->
      <button
        @click.prevent="handleToggleWishlist"
        class="absolute top-4 right-4 p-2 rounded-full glass-card-sm transition-all hover:scale-110"
        :class="isInWishlist ? 'text-red-500' : 'text-foreground'"
      >
        <Heart class="h-5 w-5" :class="{ 'fill-current': isInWishlist }" />
      </button>
      
      <!-- Badges -->
      <div class="absolute top-4 left-4 flex flex-col gap-2">
        <UiBadge v-if="product.featured" variant="default">Featured</UiBadge>
        <UiBadge v-if="product.stock && product.stock < 5" variant="warning">Low Stock</UiBadge>
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-5">
      <NuxtLink :to="`/products/${product.id}`">
        <h3 class="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {{ product.name }}
        </h3>
      </NuxtLink>
      
      <p class="text-sm text-muted-foreground line-clamp-2 mb-4">
        {{ product.description }}
      </p>
      
      <div class="flex items-center justify-between">
        <p class="text-xl font-bold gradient-text">
          {{ formatPrice(product.price) }}
        </p>
        
        <UiButton
          size="sm"
          @click="handleAddToCart"
          :variant="isInCart ? 'secondary' : 'default'"
        >
          <ShoppingCart class="h-4 w-4" />
          {{ isInCart ? 'Added' : 'Add' }}
        </UiButton>
      </div>
    </div>
  </div>
</template>


