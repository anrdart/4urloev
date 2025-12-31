<script setup lang="ts">
import { Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, Minus, Plus, Check } from 'lucide-vue-next'
import { formatPrice } from '~/lib/utils'

const route = useRoute()
const { getProductById } = useProducts()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const productId = route.params.id as string
const quantity = ref(1)
const selectedImageIndex = ref(0)
const isAddedToCart = ref(false)

// Fetch product
const { data: product, pending, error } = await useAsyncData(
  `product-${productId}`,
  () => getProductById(productId)
)

if (error.value || !product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  })
}

const isInWishlist = computed(() => wishlistStore.hasItem(productId))
const images = computed(() => product.value?.product_images || [])
const currentImage = computed(() => images.value[selectedImageIndex.value]?.url || '/placeholder.svg')

// LCP Optimization - Preload main product image (Requirement 8.1)
watchEffect(() => {
  if (product.value && currentImage.value) {
    useProductPageLCP(currentImage.value)
  }
})

const incrementQuantity = () => {
  if (product.value?.stock && quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = () => {
  if (!product.value) return
  cartStore.addItem(product.value, quantity.value)
  isAddedToCart.value = true
  setTimeout(() => {
    isAddedToCart.value = false
  }, 2000)
}

const handleToggleWishlist = () => {
  if (!product.value) return
  wishlistStore.toggleItem(product.value)
}

const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: product.value?.name,
      text: product.value?.description || '',
      url: window.location.href,
    })
  } else {
    await navigator.clipboard.writeText(window.location.href)
  }
}

const nextImage = () => {
  if (selectedImageIndex.value < images.value.length - 1) {
    selectedImageIndex.value++
  } else {
    selectedImageIndex.value = 0
  }
}

const prevImage = () => {
  if (selectedImageIndex.value > 0) {
    selectedImageIndex.value--
  } else {
    selectedImageIndex.value = images.value.length - 1
  }
}

// SEO Meta Tags (Requirements: 5.1, 5.2, 5.3, 5.4, 7.3)
// Using reactive product SEO - will update when product data changes
watchEffect(() => {
  if (product.value) {
    useProductSeo({
      product: product.value,
      currentImage: currentImage.value,
    })
    
    // Structured Data - Product and Breadcrumb schemas (Requirements: 6.1, 6.3, 6.4)
    useProductPageStructuredData({
      product: product.value,
      currentImage: currentImage.value,
    })
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-8 animate-fade-up">
      <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/products" class="hover:text-primary transition-colors">Produk</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ product?.name }}</span>
    </div>

    <div v-if="pending" class="grid lg:grid-cols-2 gap-12">
      <UiSkeleton class="aspect-square rounded-3xl" />
      <div class="space-y-4">
        <UiSkeleton class="h-10 w-3/4" />
        <UiSkeleton class="h-6 w-1/4" />
        <UiSkeleton class="h-24" />
        <UiSkeleton class="h-12 w-1/2" />
      </div>
    </div>

    <div v-else-if="product" class="grid lg:grid-cols-2 gap-12">
      <!-- Image Gallery -->
      <div class="space-y-4 animate-fade-up">
        <div class="relative aspect-square rounded-3xl overflow-hidden glass-card">
          <!-- Main product image with LCP optimization (Requirement 8.1) -->
          <NuxtImg
            :src="currentImage"
            :alt="product.name"
            class="w-full h-full object-cover"
            loading="eager"
            :fetchpriority="selectedImageIndex === 0 ? 'high' : 'auto'"
            width="800"
            height="800"
            preset="productDetail"
          />
          
          <!-- Navigation arrows -->
          <template v-if="images.length > 1">
            <button
              @click="prevImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass-card hover:bg-white/30 transition-colors"
            >
              <ChevronLeft class="h-6 w-6" />
            </button>
            <button
              @click="nextImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass-card hover:bg-white/30 transition-colors"
            >
              <ChevronRight class="h-6 w-6" />
            </button>
          </template>
          
          <!-- Image counter -->
          <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card-sm px-3 py-1 rounded-full text-sm">
            {{ selectedImageIndex + 1 }} / {{ images.length }}
          </div>
        </div>
        
        <!-- Thumbnails -->
        <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="(image, index) in images"
            :key="image.id"
            @click="selectedImageIndex = index"
            :class="[
              'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
              selectedImageIndex === index ? 'border-primary shadow-glow-sm' : 'border-transparent opacity-70 hover:opacity-100'
            ]"
          >
            <NuxtImg :src="image.url" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-6 animate-fade-up animation-delay-200">
        <!-- Title & Price -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <UiBadge v-if="product.featured" variant="default">Featured</UiBadge>
            <UiBadge v-if="product.stock && product.stock < 5" variant="warning">Low Stock</UiBadge>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold mb-4">{{ product.name }}</h1>
          <p class="text-3xl font-bold gradient-text">{{ formatPrice(product.price) }}</p>
        </div>

        <!-- Description -->
        <div class="glass-card rounded-2xl p-6">
          <h3 class="font-semibold mb-3">Deskripsi</h3>
          <p class="text-muted-foreground whitespace-pre-line">{{ product.description }}</p>
        </div>

        <!-- Stock Info -->
        <div v-if="product.stock" class="flex items-center gap-2 text-sm">
          <div :class="product.stock > 10 ? 'bg-green-500' : 'bg-yellow-500'" class="w-2 h-2 rounded-full" />
          <span class="text-muted-foreground">
            {{ product.stock > 10 ? 'Stok tersedia' : `Sisa ${product.stock} item` }}
          </span>
        </div>

        <!-- Quantity Selector -->
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Jumlah:</span>
          <div class="flex items-center gap-2 glass-card-sm rounded-lg p-1">
            <button
              @click="decrementQuantity"
              class="p-2 rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50"
              :disabled="quantity <= 1"
            >
              <Minus class="h-4 w-4" />
            </button>
            <span class="w-12 text-center font-semibold">{{ quantity }}</span>
            <button
              @click="incrementQuantity"
              class="p-2 rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50"
              :disabled="product.stock !== null && quantity >= product.stock"
            >
              <Plus class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <UiButton
            size="xl"
            class="flex-1"
            @click="handleAddToCart"
            :variant="isAddedToCart ? 'secondary' : 'default'"
          >
            <Check v-if="isAddedToCart" class="h-5 w-5" />
            <ShoppingCart v-else class="h-5 w-5" />
            {{ isAddedToCart ? 'Ditambahkan!' : 'Tambah ke Keranjang' }}
          </UiButton>
          
          <UiButton
            size="xl"
            variant="outline"
            @click="handleToggleWishlist"
            :class="isInWishlist ? 'text-red-500 border-red-500' : ''"
          >
            <Heart class="h-5 w-5" :class="{ 'fill-current': isInWishlist }" />
          </UiButton>
          
          <UiButton
            size="xl"
            variant="outline"
            @click="handleShare"
          >
            <Share2 class="h-5 w-5" />
          </UiButton>
        </div>

        <!-- Total -->
        <div class="glass-card rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Total</span>
            <span class="text-2xl font-bold gradient-text">
              {{ formatPrice(product.price * quantity) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


