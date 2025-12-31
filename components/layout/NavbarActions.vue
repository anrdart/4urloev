<script setup lang="ts">
import { ShoppingCart, Heart, User, Sun, Moon } from 'lucide-vue-next'

const isMounted = ref(false)
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const themeStore = useThemeStore()

onMounted(() => {
  isMounted.value = true
})

const toggleDark = () => {
  themeStore.toggleDark()
}
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Theme Toggle -->
    <button
      @click="toggleDark"
      class="p-2 rounded-full hover:bg-muted/50 transition-colors"
      aria-label="Toggle theme"
    >
      <template v-if="isMounted">
        <Sun v-if="themeStore.isDark" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </template>
      <Moon v-else class="h-5 w-5" />
    </button>

    <!-- Wishlist -->
    <NuxtLink to="/wishlist" class="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
      <Heart class="h-5 w-5" />
      <span
        v-if="isMounted && wishlistStore.totalItems > 0"
        class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
      >
        {{ wishlistStore.totalItems }}
      </span>
    </NuxtLink>

    <!-- Cart -->
    <NuxtLink to="/cart" class="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
      <ShoppingCart class="h-5 w-5" />
      <span
        v-if="isMounted && cartStore.totalItems > 0"
        class="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
      >
        {{ cartStore.totalItems }}
      </span>
    </NuxtLink>

    <!-- User Menu -->
    <template v-if="isMounted && authStore.isAuthenticated">
      <NuxtLink to="/account" class="p-2 rounded-full hover:bg-muted/50 transition-colors">
        <UiAvatar size="sm">
          <UiAvatarImage v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
          <UiAvatarFallback>{{ authStore.displayName.charAt(0).toUpperCase() }}</UiAvatarFallback>
        </UiAvatar>
      </NuxtLink>
    </template>
    <template v-else>
      <NuxtLink to="/auth">
        <UiButton variant="default" size="sm">
          <User class="h-4 w-4 mr-2" />
          Masuk
        </UiButton>
      </NuxtLink>
    </template>
  </div>
</template>
