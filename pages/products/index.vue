<script setup lang="ts">
import { Search, SlidersHorizontal, Grid, List, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { getProducts, getCategories } = useProducts()

// Query params
const search = ref((route.query.search as string) || '')
const categoryId = ref((route.query.category as string) || '')
const sortBy = ref<'price' | 'created_at' | 'name'>((route.query.sort as any) || 'created_at')
const sortOrder = ref<'asc' | 'desc'>((route.query.order as any) || 'desc')
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(false)

// Fetch categories
const { data: categories } = await useAsyncData('categories', () => getCategories())

// Fetch products
const { data: products, pending, refresh } = await useAsyncData(
  'products',
  () => getProducts({
    categoryId: categoryId.value || undefined,
    search: search.value || undefined,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  }),
  { watch: [categoryId, sortBy, sortOrder] }
)

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  refresh()
}, 300)

watch(search, () => {
  debouncedSearch()
})

// Update URL when filters change
watch([categoryId, sortBy, sortOrder, search], () => {
  router.replace({
    query: {
      ...(search.value && { search: search.value }),
      ...(categoryId.value && { category: categoryId.value }),
      sort: sortBy.value,
      order: sortOrder.value,
    },
  })
})

const clearFilters = () => {
  search.value = ''
  categoryId.value = ''
  sortBy.value = 'created_at'
  sortOrder.value = 'desc'
}

const sortOptions = [
  { label: 'Terbaru', value: 'created_at', order: 'desc' },
  { label: 'Terlama', value: 'created_at', order: 'asc' },
  { label: 'Harga: Rendah ke Tinggi', value: 'price', order: 'asc' },
  { label: 'Harga: Tinggi ke Rendah', value: 'price', order: 'desc' },
  { label: 'Nama: A-Z', value: 'name', order: 'asc' },
  { label: 'Nama: Z-A', value: 'name', order: 'desc' },
]

const handleSort = (option: typeof sortOptions[0]) => {
  sortBy.value = option.value as any
  sortOrder.value = option.order as any
}

// SEO Meta Tags (Requirements: 5.1, 5.2, 5.3, 7.3)
useSeo(defaultSeoConfigs.products)

// Structured Data - Breadcrumb schema (Requirement 6.4)
useBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Produk', url: '/products' },
])
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 animate-fade-up">
      <h1 class="text-3xl sm:text-4xl font-bold mb-4 gradient-text">Semua Produk</h1>
      <p class="text-muted-foreground">
        Temukan koleksi lengkap produk DIY dan hadiah personalisasi kami
      </p>
    </div>

    <!-- Filters Bar -->
    <div class="glass-card rounded-2xl p-4 mb-8 animate-fade-up animation-delay-100">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <UiInput
            v-model="search"
            placeholder="Cari produk..."
            class="pl-10"
          />
        </div>

        <!-- Category Filter -->
        <select
          v-model="categoryId"
          class="flex h-10 w-full lg:w-48 rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Semua Kategori</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <!-- Sort -->
        <select
          @change="handleSort(sortOptions.find(o => `${o.value}-${o.order}` === ($event.target as HTMLSelectElement).value)!)"
          class="flex h-10 w-full lg:w-56 rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option
            v-for="option in sortOptions"
            :key="`${option.value}-${option.order}`"
            :value="`${option.value}-${option.order}`"
            :selected="sortBy === option.value && sortOrder === option.order"
          >
            {{ option.label }}
          </option>
        </select>

        <!-- View Mode Toggle -->
        <div class="flex gap-1 glass-card-sm rounded-lg p-1">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
            ]"
          >
            <Grid class="h-5 w-5" />
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
            ]"
          >
            <List class="h-5 w-5" />
          </button>
        </div>

        <!-- Clear Filters -->
        <UiButton
          v-if="search || categoryId"
          variant="ghost"
          size="sm"
          @click="clearFilters"
        >
          <X class="h-4 w-4 mr-1" />
          Clear
        </UiButton>
      </div>
    </div>

    <!-- Results Info -->
    <div class="flex items-center justify-between mb-6 animate-fade-up animation-delay-200">
      <p class="text-sm text-muted-foreground">
        <template v-if="pending">Loading...</template>
        <template v-else>
          Menampilkan {{ products?.length || 0 }} produk
          <span v-if="search"> untuk "{{ search }}"</span>
        </template>
      </p>
    </div>

    <!-- Products Grid -->
    <div v-if="pending" :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'">
      <!-- Fixed height skeleton for CLS prevention (Requirement 8.4) -->
      <UiLoadingSkeleton 
        v-for="i in 8" 
        :key="i" 
        :variant="viewMode === 'grid' ? 'product' : 'card'"
        :height="viewMode === 'list' ? 128 : undefined"
      />
    </div>

    <div v-else-if="products?.length" :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'">
      <ProductsProductCard
        v-for="(product, index) in products"
        :key="product.id"
        :product="product"
        :class="`animate-fade-up animation-delay-${Math.min((index + 1) * 100, 500)}`"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 glass-card rounded-2xl">
      <Search class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-xl font-semibold mb-2">Tidak ada produk ditemukan</h3>
      <p class="text-muted-foreground mb-6">
        Coba ubah filter atau kata kunci pencarian Anda
      </p>
      <UiButton @click="clearFilters">
        Reset Filter
      </UiButton>
    </div>
  </div>
</template>


