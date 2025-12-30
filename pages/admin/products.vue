<script setup lang="ts">
import { Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-vue-next'
import { formatPrice, formatDate } from '~/lib/utils'
import type { Product } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const supabase = useSupabaseClient()
const searchQuery = ref('')

// Fetch products
const { data: products, pending, refresh } = await useAsyncData('admin-products', async () => {
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .order('created_at', { ascending: false })
  return data as Product[]
})

const filteredProducts = computed(() => {
  if (!products.value) return []
  if (!searchQuery.value) return products.value

  return products.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleDelete = async (productId: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

  await supabase.from('products').delete().eq('id', productId)
  refresh()
}

useSeoMeta({
  title: 'Kelola Produk - Admin 4UrLoev',
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
      <div>
        <h1 class="text-3xl font-bold gradient-text">Produk</h1>
        <p class="text-muted-foreground">Kelola semua produk Anda</p>
      </div>
      <UiButton>
        <Plus class="h-4 w-4" />
        Tambah Produk
      </UiButton>
    </div>

    <!-- Search -->
    <div class="glass-card rounded-2xl p-4 mb-6 animate-fade-up animation-delay-100">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <UiInput
          v-model="searchQuery"
          placeholder="Cari produk..."
          class="pl-10"
        />
      </div>
    </div>

    <!-- Products Table -->
    <div class="glass-card rounded-2xl overflow-hidden animate-fade-up animation-delay-200">
      <div v-if="pending" class="p-8 text-center">
        <UiSkeleton class="h-12 mb-4" />
        <UiSkeleton class="h-12 mb-4" />
        <UiSkeleton class="h-12" />
      </div>

      <div v-else-if="!filteredProducts.length" class="p-8 text-center">
        <p class="text-muted-foreground">Tidak ada produk ditemukan</p>
      </div>

      <table v-else class="w-full">
        <thead class="border-b border-border/50">
          <tr>
            <th class="text-left p-4 font-medium">Produk</th>
            <th class="text-left p-4 font-medium hidden md:table-cell">Kategori</th>
            <th class="text-left p-4 font-medium">Harga</th>
            <th class="text-left p-4 font-medium hidden sm:table-cell">Stok</th>
            <th class="text-left p-4 font-medium hidden lg:table-cell">Status</th>
            <th class="text-right p-4 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            class="border-b border-border/30 hover:bg-muted/30 transition-colors"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-muted/50 shrink-0">
                  <img
                    :src="product.product_images?.[0]?.url || '/placeholder.svg'"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="min-w-0">
                  <p class="font-medium truncate">{{ product.name }}</p>
                  <p class="text-sm text-muted-foreground hidden sm:block">
                    {{ formatDate(product.created_at) }}
                  </p>
                </div>
              </div>
            </td>
            <td class="p-4 hidden md:table-cell">
              <UiBadge variant="outline">
                {{ (product.category as any)?.name || 'Uncategorized' }}
              </UiBadge>
            </td>
            <td class="p-4">
              <span class="font-medium">{{ formatPrice(product.price) }}</span>
            </td>
            <td class="p-4 hidden sm:table-cell">
              <span :class="product.stock && product.stock < 5 ? 'text-destructive' : ''">
                {{ product.stock ?? 'N/A' }}
              </span>
            </td>
            <td class="p-4 hidden lg:table-cell">
              <UiBadge :variant="product.is_active ? 'success' : 'secondary'">
                {{ product.is_active ? 'Aktif' : 'Nonaktif' }}
              </UiBadge>
            </td>
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <UiButton variant="ghost" size="icon">
                  <Edit class="h-4 w-4" />
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="icon"
                  @click="handleDelete(product.id)"
                  class="text-destructive hover:text-destructive"
                >
                  <Trash2 class="h-4 w-4" />
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


