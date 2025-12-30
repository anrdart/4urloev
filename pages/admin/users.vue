<script setup lang="ts">
import { Search, Shield, User, Mail } from 'lucide-vue-next'
import { formatDate } from '~/lib/utils'
import type { Profile } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const supabase = useSupabaseClient()
const searchQuery = ref('')

// Fetch users
const { data: users, pending } = await useAsyncData('admin-users', async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return data as Profile[]
})

const filteredUsers = computed(() => {
  if (!users.value) return []
  if (!searchQuery.value) return users.value

  return users.value.filter(user =>
    user.display_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

useSeoMeta({
  title: 'Kelola Pengguna - Admin 4UrLoev',
})
</script>

<template>
  <div>
    <div class="mb-8 animate-fade-up">
      <h1 class="text-3xl font-bold gradient-text">Pengguna</h1>
      <p class="text-muted-foreground">Kelola semua pengguna terdaftar</p>
    </div>

    <!-- Search -->
    <div class="glass-card rounded-2xl p-4 mb-6 animate-fade-up animation-delay-100">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <UiInput
          v-model="searchQuery"
          placeholder="Cari pengguna..."
          class="pl-10"
        />
      </div>
    </div>

    <!-- Users Grid -->
    <div v-if="pending" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiSkeleton v-for="i in 6" :key="i" class="h-40 rounded-2xl" />
    </div>

    <div v-else-if="!filteredUsers.length" class="glass-card rounded-2xl p-8 text-center">
      <p class="text-muted-foreground">Tidak ada pengguna ditemukan</p>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(user, index) in filteredUsers"
        :key="user.id"
        :class="`glass-card rounded-2xl p-6 hover-lift animate-fade-up animation-delay-${Math.min((index + 2) * 100, 500)}`"
      >
        <div class="flex items-start gap-4">
          <UiAvatar size="lg">
            <UiAvatarImage v-if="user.avatar_url" :src="user.avatar_url" />
            <UiAvatarFallback>
              {{ (user.display_name || 'U').charAt(0).toUpperCase() }}
            </UiAvatarFallback>
          </UiAvatar>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold truncate">
                {{ user.display_name || 'Unnamed User' }}
              </h3>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              Bergabung {{ formatDate(user.created_at) }}
            </p>
            <p v-if="user.bio" class="text-sm text-muted-foreground mt-2 line-clamp-2">
              {{ user.bio }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


