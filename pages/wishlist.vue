<script setup lang="ts">
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-vue-next'
import { formatPrice } from '~/lib/utils'

// SSR-safe store access
const wishlistStore = import.meta.client ? useWishlistStore() : null

// SSR-safe computed values
const items = computed(() => wishlistStore?.items ?? [])
const isEmpty = computed(() => wishlistStore?.isEmpty ?? true)

const handleMoveToCart = (productId: string) => {
  wishlistStore?.moveToCart(productId)
}

const handleRemoveItem = (productId: string) => {
  wishlistStore?.removeItem(productId)
}

const handleMoveAllToCart = () => {
  wishlistStore?.moveAllToCart()
}

useSeoMeta({
  title: 'Wishlist - 4UrLoev',
  description: 'Lihat produk yang Anda simpan untuk dibeli nanti',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8 animate-fade-up">
      <h1 class="text-3xl sm:text-4xl font-bold gradient-text">
        Wishlist
      </h1>
      <UiButton
        v-if="!isEmpty"
        variant="outline"
        @click="handleMoveAllToCart"
      >
        <ShoppingCart class="h-4 w-4" />
        Tambah Semua ke Keranjang
      </UiButton>
    </div>

    <div v-if="isEmpty" class="text-center py-16 animate-fade-up">
      <div class="glass-card rounded-3xl p-12 max-w-md mx-auto">
        <Heart class="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h2 class="text-2xl font-semibold mb-4">Wishlist Kosong</h2>
        <p class="text-muted-foreground mb-8">
          Belum ada produk yang disimpan. Jelajahi produk kami dan tambahkan ke wishlist!
        </p>
        <NuxtLink to="/products">
          <UiButton size="lg">
            <ShoppingBag class="h-5 w-5" />
            Jelajahi Produk
          </UiButton>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-for="(item, index) in items"
          :key="item.product.id"
          :class="`glass-card rounded-2xl overflow-hidden hover-lift animate-fade-up animation-delay-${(index + 1) * 100}`"
        >
          <!-- Image -->
          <NuxtLink :to="`/products/${item.product.id}`">
            <div class="aspect-square bg-muted/50 relative group">
              <NuxtImg
                :src="item.product.product_images?.[0]?.url || '/placeholder.svg'"
                :alt="item.product.name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <button
                @click.prevent="handleRemoveItem(item.product.id)"
                class="absolute top-4 right-4 p-2 rounded-full glass-card-sm text-destructive opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </NuxtLink>

          <!-- Content -->
          <div class="p-5">
            <NuxtLink :to="`/products/${item.product.id}`">
              <h3 class="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                {{ item.product.name }}
              </h3>
            </NuxtLink>
            <p class="text-xl font-bold gradient-text mt-2">
              {{ formatPrice(item.product.price) }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Ditambahkan {{ new Date(item.addedAt).toLocaleDateString('id-ID') }}
            </p>

            <UiButton
              class="w-full mt-4"
              @click="handleMoveToCart(item.product.id)"
            >
              <ShoppingCart class="h-4 w-4" />
              Tambah ke Keranjang
            </UiButton>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>


