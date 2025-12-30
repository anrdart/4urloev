<script setup lang="ts">
import { Package, ShoppingBag, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import { formatPrice } from '~/lib/utils'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const supabase = useSupabaseClient()

// Fetch dashboard stats
const { data: stats } = await useAsyncData('admin-stats', async () => {
  const [products, orders, users] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('orders').select('id, total, created_at', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ])

  const totalRevenue = orders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

  return {
    products: products.count || 0,
    orders: orders.count || 0,
    users: users.count || 0,
    revenue: totalRevenue,
  }
})

const dashboardCards = computed(() => [
  {
    title: 'Total Produk',
    value: stats.value?.products || 0,
    icon: Package,
    change: '+12%',
    isPositive: true,
    color: 'from-primary to-primary/50',
  },
  {
    title: 'Total Pesanan',
    value: stats.value?.orders || 0,
    icon: ShoppingBag,
    change: '+8%',
    isPositive: true,
    color: 'from-secondary to-secondary/50',
  },
  {
    title: 'Total Pengguna',
    value: stats.value?.users || 0,
    icon: Users,
    change: '+24%',
    isPositive: true,
    color: 'from-accent to-accent/50',
  },
  {
    title: 'Total Pendapatan',
    value: formatPrice(stats.value?.revenue || 0),
    icon: TrendingUp,
    change: '+18%',
    isPositive: true,
    color: 'from-green-500 to-green-500/50',
  },
])

useSeoMeta({
  title: 'Dashboard Admin - 4UrLoev',
})
</script>

<template>
  <div>
    <div class="mb-8 animate-fade-up">
      <h1 class="text-3xl font-bold gradient-text">Dashboard</h1>
      <p class="text-muted-foreground">Selamat datang di panel admin 4UrLoev</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="(card, index) in dashboardCards"
        :key="card.title"
        :class="`glass-card rounded-2xl p-6 hover-lift animate-fade-up animation-delay-${(index + 1) * 100}`"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground mb-1">{{ card.title }}</p>
            <p class="text-2xl font-bold">{{ card.value }}</p>
          </div>
          <div :class="`p-3 rounded-xl bg-gradient-to-br ${card.color}`">
            <component :is="card.icon" class="h-5 w-5 text-white" />
          </div>
        </div>
        <div class="flex items-center gap-1 mt-4 text-sm">
          <ArrowUpRight v-if="card.isPositive" class="h-4 w-4 text-green-500" />
          <ArrowDownRight v-else class="h-4 w-4 text-red-500" />
          <span :class="card.isPositive ? 'text-green-500' : 'text-red-500'">
            {{ card.change }}
          </span>
          <span class="text-muted-foreground">dari bulan lalu</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="glass-card rounded-2xl p-6 animate-fade-up animation-delay-500">
        <h2 class="text-xl font-bold mb-4">Aksi Cepat</h2>
        <div class="grid grid-cols-2 gap-4">
          <NuxtLink to="/admin/products">
            <UiButton variant="outline" class="w-full h-24 flex-col gap-2">
              <Package class="h-6 w-6" />
              Kelola Produk
            </UiButton>
          </NuxtLink>
          <NuxtLink to="/admin/orders">
            <UiButton variant="outline" class="w-full h-24 flex-col gap-2">
              <ShoppingBag class="h-6 w-6" />
              Kelola Pesanan
            </UiButton>
          </NuxtLink>
          <NuxtLink to="/admin/users">
            <UiButton variant="outline" class="w-full h-24 flex-col gap-2">
              <Users class="h-6 w-6" />
              Kelola Pengguna
            </UiButton>
          </NuxtLink>
          <NuxtLink to="/" target="_blank">
            <UiButton variant="outline" class="w-full h-24 flex-col gap-2">
              <ArrowUpRight class="h-6 w-6" />
              Lihat Website
            </UiButton>
          </NuxtLink>
        </div>
      </div>

      <div class="glass-card rounded-2xl p-6 animate-fade-up animation-delay-600">
        <h2 class="text-xl font-bold mb-4">Pesanan Terbaru</h2>
        <p class="text-muted-foreground text-center py-8">
          Lihat halaman pesanan untuk detail lebih lanjut
        </p>
        <NuxtLink to="/admin/orders" class="block">
          <UiButton variant="outline" class="w-full">
            Lihat Semua Pesanan
          </UiButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>


