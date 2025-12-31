<script setup lang="ts">
import { Menu, X, ShoppingCart, Heart, User, Sun, Moon, Sparkles } from 'lucide-vue-next'

const isMenuOpen = ref(false)
const isScrolled = ref(false)

// Direct store access - Nuxt handles SSR safety for Pinia
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const themeStore = useThemeStore()

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
  themeStore.toggleDark()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})

const handleScroll = () => {
  if (import.meta.client) {
    isScrolled.value = window.scrollY > 20
  }
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
          <ClientOnly>
            <button
              @click="toggleDark"
              class="p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Toggle theme"
            >
              <Sun v-if="themeStore.isDark" class="h-5 w-5" />
              <Moon v-else class="h-5 w-5" />
            </button>
            <template #fallback>
              <button class="p-2 rounded-full hover:bg-muted/50 transition-colors" aria-label="Toggle theme">
                <Moon class="h-5 w-5" />
              </button>
            </template>
          </ClientOnly>

          <!-- Wishlist -->
          <NuxtLink to="/wishlist" class="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
            <Heart class="h-5 w-5" />
            <ClientOnly>
              <span
                v-if="wishlistStore.totalItems > 0"
                class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                {{ wishlistStore.totalItems }}
              </span>
            </ClientOnly>
          </NuxtLink>

          <!-- Cart -->
          <NuxtLink to="/cart" class="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
            <ShoppingCart class="h-5 w-5" />
            <ClientOnly>
              <span
                v-if="cartStore.totalItems > 0"
                class="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                {{ cartStore.totalItems }}
              </span>
            </ClientOnly>
          </NuxtLink>

          <!-- User Menu -->
          <ClientOnly>
            <template v-if="authStore.isAuthenticated">
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
            <template #fallback>
              <NuxtLink to="/auth">
                <UiButton variant="default" size="sm">
                  <User class="h-4 w-4 mr-2" />
                  Masuk
                </UiButton>
              </NuxtLink>
            </template>
          </ClientOnly>
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
              <ClientOnly>
                <button
                  @click="toggleDark"
                  class="p-2 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <Sun v-if="themeStore.isDark" class="h-5 w-5" />
                  <Moon v-else class="h-5 w-5" />
                </button>
                <template #fallback>
                  <button class="p-2 rounded-full hover:bg-muted/50 transition-colors">
                    <Moon class="h-5 w-5" />
                  </button>
                </template>
              </ClientOnly>

              <NuxtLink to="/wishlist" class="relative p-2 rounded-full hover:bg-muted/50" @click="isMenuOpen = false">
                <Heart class="h-5 w-5" />
                <ClientOnly>
                  <span
                    v-if="wishlistStore.totalItems > 0"
                    class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {{ wishlistStore.totalItems }}
                  </span>
                </ClientOnly>
              </NuxtLink>

              <NuxtLink to="/cart" class="relative p-2 rounded-full hover:bg-muted/50" @click="isMenuOpen = false">
                <ShoppingCart class="h-5 w-5" />
                <ClientOnly>
                  <span
                    v-if="cartStore.totalItems > 0"
                    class="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {{ cartStore.totalItems }}
                  </span>
                </ClientOnly>
              </NuxtLink>
            </div>

            <ClientOnly>
              <template v-if="authStore.isAuthenticated">
                <NuxtLink to="/account" @click="isMenuOpen = false">
                  <UiButton variant="outline" size="sm">Akun</UiButton>
                </NuxtLink>
              </template>
              <template v-else>
                <NuxtLink to="/auth" @click="isMenuOpen = false">
                  <UiButton variant="default" size="sm">Masuk</UiButton>
                </NuxtLink>
              </template>
              <template #fallback>
                <NuxtLink to="/auth" @click="isMenuOpen = false">
                  <UiButton variant="default" size="sm">Masuk</UiButton>
                </NuxtLink>
              </template>
            </ClientOnly>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>
