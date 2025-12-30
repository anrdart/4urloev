<script setup lang="ts">
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
]

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/')
}

onMounted(async () => {
  await authStore.initialize()
})
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <!-- Sidebar -->
    <aside class="w-64 glass-card border-r flex flex-col">
      <div class="p-6 border-b border-border/50">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <span class="text-xl font-bold gradient-text">4UrLoev</span>
          <UiBadge variant="secondary" class="text-xs">Admin</UiBadge>
        </NuxtLink>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          active-class="bg-primary/10 text-primary"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-border/50">
        <div class="flex items-center gap-3 mb-4">
          <UiAvatar size="sm">
            <UiAvatarImage v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
            <UiAvatarFallback>{{ authStore.displayName.charAt(0).toUpperCase() }}</UiAvatarFallback>
          </UiAvatar>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ authStore.displayName }}</p>
            <p class="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut class="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <div class="p-8">
        <slot />
      </div>
    </main>

    <UiToast />
  </div>
</template>


