<script setup lang="ts">
import { Menu, X, ShoppingCart, Heart, User, Sun, Moon, Sparkles } from 'lucide-vue-next'

const isMenuOpen = ref(false)
const isScrolled = ref(false)

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

const closeMenu = () => {
  isMenuOpen.value = false
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
          <LayoutNavbarActions />
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
            @click="closeMenu"
          >
            {{ item.name }}
          </NuxtLink>

          <UiSeparator />

          <LayoutNavbarMobileActions @close-menu="closeMenu" />
        </div>
      </Transition>
    </nav>
  </header>
</template>
