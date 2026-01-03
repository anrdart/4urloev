<script setup lang="ts">
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-vue-next'
import { formatPrice } from '~/lib/utils'

// Always initialize store directly - Pinia handles SSR safely
const cartStore = useCartStore()

// Use isMounted pattern for UI display that depends on persisted state
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// SSR-safe computed values - show empty/default on server
const items = computed(() => isMounted.value ? cartStore.items : [])
const isEmpty = computed(() => isMounted.value ? cartStore.isEmpty : true)
const totalItems = computed(() => isMounted.value ? cartStore.totalItems : 0)
const totalPrice = computed(() => isMounted.value ? cartStore.totalPrice : 0)

// Direct store actions - no optional chaining needed
const handleUpdateQuantity = (productId: string, delta: number) => {
  const item = cartStore.items.find(i => i.product.id === productId)
  if (item) {
    const newQuantity = item.quantity + delta
    if (newQuantity > 0) {
      cartStore.updateQuantity(productId, newQuantity)
    }
  }
}

const handleRemoveItem = (productId: string) => {
  cartStore.removeItem(productId)
}

const handleClearCart = () => {
  cartStore.clearCart()
}

useSeoMeta({
  title: 'Keranjang - 4UrLoev',
  description: 'Lihat item di keranjang belanja Anda',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl sm:text-4xl font-bold mb-8 gradient-text animate-fade-up">
      Keranjang Belanja
    </h1>

    <div v-if="isEmpty" class="text-center py-16 animate-fade-up">
      <div class="glass-card rounded-3xl p-12 max-w-md mx-auto">
        <ShoppingCart class="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h2 class="text-2xl font-semibold mb-4">Keranjang Kosong</h2>
        <p class="text-muted-foreground mb-8">
          Belum ada item di keranjang Anda. Mulai belanja sekarang!
        </p>
        <NuxtLink to="/products">
          <UiButton size="lg">
            <ShoppingBag class="h-5 w-5" />
            Mulai Belanja
          </UiButton>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-4">
        <TransitionGroup
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-4"
        >
          <div
            v-for="(item, index) in items"
            :key="item.product.id"
            :class="`glass-card rounded-2xl p-4 sm:p-6 animate-fade-up animation-delay-${(index + 1) * 100}`"
          >
            <div class="flex gap-4">
              <!-- Product Image -->
              <NuxtLink :to="`/products/${item.product.id}`" class="shrink-0">
                <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted/50">
                  <NuxtImg
                    :src="item.product.product_images?.[0]?.url || '/placeholder.svg'"
                    :alt="item.product.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </NuxtLink>

              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/products/${item.product.id}`">
                  <h3 class="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                    {{ item.product.name }}
                  </h3>
                </NuxtLink>
                <p class="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {{ item.product.description }}
                </p>
                <p class="text-lg font-bold gradient-text mt-2">
                  {{ formatPrice(item.product.price) }}
                </p>

                <!-- Mobile: Quantity & Remove -->
                <div class="flex items-center justify-between mt-4 sm:hidden">
                  <div class="flex items-center gap-2 glass-card-sm rounded-lg p-1">
                    <button
                      @click="handleUpdateQuantity(item.product.id, -1)"
                      class="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Minus class="h-4 w-4" />
                    </button>
                    <span class="w-8 text-center font-semibold">{{ item.quantity }}</span>
                    <button
                      @click="handleUpdateQuantity(item.product.id, 1)"
                      class="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Plus class="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    @click="handleRemoveItem(item.product.id)"
                    class="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <!-- Desktop: Quantity & Actions -->
              <div class="hidden sm:flex flex-col items-end justify-between">
                <button
                  @click="handleRemoveItem(item.product.id)"
                  class="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 class="h-5 w-5" />
                </button>

                <div class="flex items-center gap-2 glass-card-sm rounded-lg p-1">
                  <button
                    @click="handleUpdateQuantity(item.product.id, -1)"
                    class="p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Minus class="h-4 w-4" />
                  </button>
                  <span class="w-10 text-center font-semibold">{{ item.quantity }}</span>
                  <button
                    @click="handleUpdateQuantity(item.product.id, 1)"
                    class="p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Plus class="h-4 w-4" />
                  </button>
                </div>

                <p class="font-bold text-lg">
                  {{ formatPrice(item.product.price * item.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Clear Cart -->
        <div class="flex justify-end pt-4">
          <UiButton variant="outline" @click="handleClearCart">
            <Trash2 class="h-4 w-4" />
            Kosongkan Keranjang
          </UiButton>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="glass-card rounded-2xl p-6 sticky top-24 animate-fade-up animation-delay-300">
          <h2 class="text-xl font-bold mb-6">Ringkasan Pesanan</h2>

          <div class="space-y-4 mb-6">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtotal ({{ totalItems }} item)</span>
              <span class="font-medium">{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Ongkir</span>
              <span class="text-sm text-muted-foreground">Dihitung saat checkout</span>
            </div>
            <UiSeparator />
            <div class="flex justify-between">
              <span class="font-semibold">Total</span>
              <span class="text-2xl font-bold gradient-text">{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>

          <NuxtLink to="/checkout" class="block">
            <UiButton size="lg" class="w-full group">
              Checkout
              <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </UiButton>
          </NuxtLink>

          <NuxtLink to="/products" class="block mt-4">
            <UiButton variant="outline" size="lg" class="w-full">
              Lanjut Belanja
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>


