<script setup lang="ts">
import { Menu, X, ShoppingCart, Heart, User, Sun, Moon, Sparkles } from 'lucide-vue-next'

const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isMounted = ref(false)

// Store refs - will be populated on mount
const authStore = ref<ReturnType<typeof useAuthStore> | null>(null)
const cartStore = ref<ReturnType<typeof useCartStore> | null>(null)
const wishlistStore = ref<ReturnType<typeof useWishlistStore> | null>(null)
const themeStore = ref<ReturnType<typeof useThemeStore> | null>(null)

// SSR-safe computed values
const isDark = computed(() => themeStore.value?.isDark ?? false)
const totalCartItems = computed(() => cartStore.value?.totalItems ?? 0)
const totalWishlistItems = computed(() => wishlistStore.value?.totalItems ?? 0)
const isAuthenticated = computed(() => authStore.value?.isAuthenticated ?? false)
const avatarUrl = computed(() => authStore.value?.avatarUrl ?? null)
const displayName = computed(() => authStore.value?.displayName ?? 'User')

const navItems = [
  { name: 'Produk', path: '/products' },
  { name: 'Bundles', path: '/bundles' },
  { name: 'Customize', path: '/customize' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Tentang', path: '/about' },
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleDark = () => {
  themeStore.value?.toggleDark()
}

onMounted(() => {
  // Initialize stores on client only
  authStore.value = useAuthStore()
  cartStore.value = useCartStore()
  wishlistStore.value = useWishlistStore()
  themeStore.value = useThemeStore()
  isMounted.value = true
  
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled
        ? 'glass-card border-b py-2'
        : 'bg-transparent py-4'
    ]"
  >
    <nav class="container mx-auto px-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="relative">
            <Sparkles class="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          </div>
          <span class="text-xl font-bold gradient-text">4UrLoev</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
          >
            {{ item.name }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </NuxtLink>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden md:flex items-center gap-3">
          <!-- Theme Toggle -->
          <button
            @click="toggleDark"
            class="p-2 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Toggle theme"
          >
            <Sun v-if="isDark" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>

          <!-- Wishlist -->
          <NuxtLink to="/wishlist" class="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
            <Heart class="h-5 w-5" />
            <span
              v-if="isMounted && totalWishlistItems > 0"
              class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ totalWishlistItems }}
            </span>
          </NuxtLink>

          <!-- Cart -->
          <NuxtLink to="/cart" class="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
            <ShoppingCart class="h-5 w-5" />
            <span
              v-if="isMounted && totalCartItems > 0"
              class="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ totalCartItems }}
            </span>
          </NuxtLink>

          <!-- User Menu -->
          <template v-if="isMounted && isAuthenticated">
            <NuxtLink to="/account" class="p-2 rounded-full hover:bg-muted/50 transition-colors">
              <UiAvatar size="sm">
                <UiAvatarImage v-if="avatarUrl" :src="avatarUrl" />
                <UiAvatarFallback>{{ displayName.charAt(0).toUpperCase() }}</UiAvatarFallback>
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

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMenu"
          class="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Toggle menu"
        >
          <X v-if="isMenuOpen" class="h-6 w-6" />
          <Menu v-else class="h-6 w-6" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="isMenuOpen" class="md:hidden mt-4 glass-card rounded-2xl p-4 space-y-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="block px-4 py-2 rounded-lg text-foreground/80 hover:bg-muted/50 hover:text-primary transition-colors"
            @click="isMenuOpen = false"
          >
            {{ item.name }}
          </NuxtLink>

          <UiSeparator />

          <div class="flex items-center justify-between px-4">
            <div class="flex items-center gap-4">
              <button
                @click="toggleDark"
                class="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <Sun v-if="isDark" class="h-5 w-5" />
                <Moon v-else class="h-5 w-5" />
              </button>

              <NuxtLink to="/wishlist" class="relative p-2 rounded-full hover:bg-muted/50" @click="isMenuOpen = false">
                <Heart class="h-5 w-5" />
                <span
                  v-if="isMounted && totalWishlistItems > 0"
                  class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {{ totalWishlistItems }}
                </span>
              </NuxtLink>

              <NuxtLink to="/cart" class="relative p-2 rounded-full hover:bg-muted/50" @click="isMenuOpen = false">
                <ShoppingCart class="h-5 w-5" />
                <span
                  v-if="isMounted && totalCartItems > 0"
                  class="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {{ totalCartItems }}
                </span>
              </NuxtLink>
            </div>

            <template v-if="isMounted && isAuthenticated">
              <NuxtLink to="/account" @click="isMenuOpen = false">
                <UiButton variant="outline" size="sm">Akun</UiButton>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/auth" @click="isMenuOpen = false">
                <UiButton variant="default" size="sm">Masuk</UiButton>
              </NuxtLink>
            </template>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>
