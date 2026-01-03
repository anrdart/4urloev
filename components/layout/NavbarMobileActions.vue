<script setup lang="ts">
import { ShoppingCart, Heart, Sun, Moon } from 'lucide-vue-next'

const emit = defineEmits<{
  closeMenu: []
}>()

// Always initialize stores directly - Pinia handles SSR safely
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const themeStore = useThemeStore()

// Use isMounted pattern only for UI display that depends on persisted state
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

// Direct store action - no optional chaining needed
const toggleDark = () => {
  themeStore.toggleDark()
}
</script>

<template>
  <div class="flex items-center justify-between px-4">
    <div class="flex items-center gap-4">
      <button
        @click="toggleDark"
        class="p-2 rounded-full hover:bg-muted/50 transition-colors"
      >
        <template v-if="isMounted">
          <Sun v-if="themeStore.isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </template>
        <Moon v-else class="h-5 w-5" />
      </button>

      <NuxtLink to="/wishlist" class="relative p-2 rounded-full hover:bg-muted/50" @click="emit('closeMenu')">
        <Heart class="h-5 w-5" />
        <span
          v-if="isMounted && wishlistStore.totalItems > 0"
          class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
        >
          {{ wishlistStore.totalItems }}
        </span>
      </NuxtLink>

      <NuxtLink to="/cart" class="relative p-2 rounded-full hover:bg-muted/50" @click="emit('closeMenu')">
        <ShoppingCart class="h-5 w-5" />
        <span
          v-if="isMounted && cartStore.totalItems > 0"
          class="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
        >
          {{ cartStore.totalItems }}
        </span>
      </NuxtLink>
    </div>

    <template v-if="isMounted && authStore.isAuthenticated">
      <NuxtLink to="/account" @click="emit('closeMenu')">
        <UiButton variant="outline" size="sm">Akun</UiButton>
      </NuxtLink>
    </template>
    <template v-else>
      <NuxtLink to="/auth" @click="emit('closeMenu')">
        <UiButton variant="default" size="sm">Masuk</UiButton>
      </NuxtLink>
    </template>
  </div>
</template>
