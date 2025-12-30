<script setup lang="ts">
import { Search, Eye, Download } from 'lucide-vue-next'
import { formatPrice, formatDate } from '~/lib/utils'
import type { Order } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const supabase = useSupabaseClient()
const searchQuery = ref('')
const statusFilter = ref('')

// Fetch orders
const { data: orders, pending, refresh } = await useAsyncData('admin-orders', async () => {
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  return data as Order[]
})

const filteredOrders = computed(() => {
  if (!orders.value) return []

  return orders.value.filter(order => {
    const matchesSearch = !searchQuery.value ||
      order.order_number.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || order.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const updateStatus = async (orderId: string, newStatus: Order['status']) => {
  await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  refresh()
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'default',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'destructive',
  }
  return colors[status] || 'outline'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Diterima',
    cancelled: 'Dibatalkan',
  }
  return labels[status] || status
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

useSeoMeta({
  title: 'Kelola Pesanan - Admin 4UrLoev',
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
      <div>
        <h1 class="text-3xl font-bold gradient-text">Pesanan</h1>
        <p class="text-muted-foreground">Kelola semua pesanan</p>
      </div>
      <UiButton variant="outline">
        <Download class="h-4 w-4" />
        Export
      </UiButton>
    </div>

    <!-- Filters -->
    <div class="glass-card rounded-2xl p-4 mb-6 animate-fade-up animation-delay-100">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <UiInput
            v-model="searchQuery"
            placeholder="Cari nomor pesanan..."
            class="pl-10"
          />
        </div>
        <select
          v-model="statusFilter"
          class="h-10 rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
        >
          <option value="">Semua Status</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ getStatusLabel(status) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="glass-card rounded-2xl overflow-hidden animate-fade-up animation-delay-200">
      <div v-if="pending" class="p-8 text-center">
        <UiSkeleton class="h-12 mb-4" />
        <UiSkeleton class="h-12 mb-4" />
        <UiSkeleton class="h-12" />
      </div>

      <div v-else-if="!filteredOrders.length" class="p-8 text-center">
        <p class="text-muted-foreground">Tidak ada pesanan ditemukan</p>
      </div>

      <table v-else class="w-full">
        <thead class="border-b border-border/50">
          <tr>
            <th class="text-left p-4 font-medium">Pesanan</th>
            <th class="text-left p-4 font-medium hidden md:table-cell">Tanggal</th>
            <th class="text-left p-4 font-medium">Total</th>
            <th class="text-left p-4 font-medium">Status</th>
            <th class="text-right p-4 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in filteredOrders"
            :key="order.id"
            class="border-b border-border/30 hover:bg-muted/30 transition-colors"
          >
            <td class="p-4">
              <div>
                <p class="font-medium">{{ order.order_number }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ order.order_items?.length || 0 }} item
                </p>
              </div>
            </td>
            <td class="p-4 hidden md:table-cell">
              {{ formatDate(order.created_at) }}
            </td>
            <td class="p-4">
              <span class="font-medium">{{ formatPrice(order.total) }}</span>
            </td>
            <td class="p-4">
              <select
                :value="order.status"
                @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value as Order['status'])"
                class="text-sm rounded-lg border border-input bg-background/50 px-2 py-1"
              >
                <option v-for="status in statuses" :key="status" :value="status">
                  {{ getStatusLabel(status) }}
                </option>
              </select>
            </td>
            <td class="p-4 text-right">
              <UiButton variant="ghost" size="icon">
                <Eye class="h-4 w-4" />
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


