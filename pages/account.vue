<script setup lang="ts">
import { User, Package, Heart, Settings, LogOut, Camera } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { formatPrice, formatDate } from '~/lib/utils'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const authStore = useAuthStore()
const { getUserOrders } = useOrders()

const activeTab = ref('profile')

// Fetch user orders
const { data: orders, pending: ordersLoading } = await useAsyncData(
  'user-orders',
  () => getUserOrders(),
  { lazy: true }
)

// Profile form
const profileForm = ref({
  displayName: authStore.profile?.display_name || '',
  bio: authStore.profile?.bio || '',
})

const isUpdatingProfile = ref(false)

const handleUpdateProfile = async () => {
  isUpdatingProfile.value = true
  try {
    await authStore.updateProfile({
      display_name: profileForm.value.displayName,
      bio: profileForm.value.bio,
    })
    toast.success('Profil berhasil diperbarui')
  } catch (error: any) {
    toast.error(error.message || 'Gagal memperbarui profil')
  } finally {
    isUpdatingProfile.value = false
  }
}

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/')
  toast.success('Berhasil keluar')
}

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'orders', label: 'Pesanan', icon: Package },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  }
  return colors[status] || 'bg-gray-500'
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

useSeoMeta({
  title: 'Akun Saya - 4UrLoev',
  description: 'Kelola profil dan pesanan Anda',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl sm:text-4xl font-bold mb-8 gradient-text animate-fade-up">
      Akun Saya
    </h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="glass-card rounded-2xl p-6 sticky top-24 animate-fade-up">
          <!-- User Info -->
          <div class="text-center mb-6">
            <div class="relative inline-block">
              <UiAvatar size="xl" class="mx-auto">
                <UiAvatarImage v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
                <UiAvatarFallback class="text-2xl">
                  {{ authStore.displayName.charAt(0).toUpperCase() }}
                </UiAvatarFallback>
              </UiAvatar>
              <button class="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform">
                <Camera class="h-4 w-4" />
              </button>
            </div>
            <h2 class="font-bold text-lg mt-4">{{ authStore.displayName }}</h2>
            <p class="text-sm text-muted-foreground">{{ authStore.user?.email }}</p>
          </div>

          <!-- Navigation -->
          <nav class="space-y-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted/50 text-muted-foreground'
              ]"
            >
              <component :is="tab.icon" class="h-5 w-5" />
              {{ tab.label }}
            </button>
            
            <UiSeparator class="my-4" />
            
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut class="h-5 w-5" />
              Keluar
            </button>
          </nav>
        </div>
      </div>

      <!-- Content -->
      <div class="lg:col-span-3">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="space-y-6 animate-fade-up">
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-xl font-bold mb-6">Informasi Profil</h3>
            
            <form @submit.prevent="handleUpdateProfile" class="space-y-4">
              <div class="space-y-2">
                <UiLabel for="displayName">Nama Tampilan</UiLabel>
                <UiInput
                  id="displayName"
                  v-model="profileForm.displayName"
                  placeholder="Nama Anda"
                />
              </div>
              
              <div class="space-y-2">
                <UiLabel for="email">Email</UiLabel>
                <UiInput
                  id="email"
                  :model-value="authStore.user?.email"
                  disabled
                  class="opacity-60"
                />
              </div>
              
              <div class="space-y-2">
                <UiLabel for="bio">Bio</UiLabel>
                <textarea
                  id="bio"
                  v-model="profileForm.bio"
                  rows="3"
                  class="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Ceritakan tentang diri Anda..."
                />
              </div>
              
              <UiButton type="submit" :disabled="isUpdatingProfile">
                {{ isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </UiButton>
            </form>
          </div>
        </div>

        <!-- Orders Tab -->
        <div v-else-if="activeTab === 'orders'" class="space-y-4 animate-fade-up">
          <div v-if="ordersLoading" class="space-y-4">
            <UiSkeleton v-for="i in 3" :key="i" class="h-32 rounded-2xl" />
          </div>
          
          <div v-else-if="!orders?.length" class="glass-card rounded-2xl p-12 text-center">
            <Package class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-xl font-semibold mb-2">Belum Ada Pesanan</h3>
            <p class="text-muted-foreground mb-6">Anda belum memiliki pesanan. Mulai belanja sekarang!</p>
            <NuxtLink to="/products">
              <UiButton>Mulai Belanja</UiButton>
            </NuxtLink>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="order in orders"
              :key="order.id"
              class="glass-card rounded-2xl p-6"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p class="font-bold">{{ order.order_number }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ formatDate(order.created_at) }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <UiBadge
                    :class="getStatusColor(order.status)"
                    class="text-white"
                  >
                    {{ getStatusLabel(order.status) }}
                  </UiBadge>
                  <span class="font-bold">{{ formatPrice(order.total) }}</span>
                </div>
              </div>
              
              <UiSeparator class="my-4" />
              
              <div class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">
                  {{ order.order_items?.length || 0 }} item
                </p>
                <NuxtLink :to="`/orders/${order.id}`">
                  <UiButton variant="outline" size="sm">
                    Lihat Detail
                  </UiButton>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="space-y-6 animate-fade-up">
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-xl font-bold mb-6">Pengaturan Akun</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p class="font-medium">Notifikasi Email</p>
                  <p class="text-sm text-muted-foreground">Terima update pesanan via email</p>
                </div>
                <input type="checkbox" checked class="w-5 h-5 accent-primary" />
              </div>
              
              <div class="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p class="font-medium">Notifikasi Promo</p>
                  <p class="text-sm text-muted-foreground">Terima info promo dan diskon</p>
                </div>
                <input type="checkbox" class="w-5 h-5 accent-primary" />
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-2xl p-6 border-destructive/50">
            <h3 class="text-xl font-bold mb-4 text-destructive">Zona Berbahaya</h3>
            <p class="text-muted-foreground mb-4">
              Tindakan di bawah ini tidak dapat dibatalkan. Harap berhati-hati.
            </p>
            <UiButton variant="destructive">
              Hapus Akun
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


