<script setup lang="ts">
import { Sparkles, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()

const footerLinks = {
  shop: [
    { name: 'Semua Produk', path: '/products' },
    { name: 'Bundles', path: '/bundles' },
    { name: 'Customize', path: '/customize' },
    { name: 'New Arrivals', path: '/products?sort=newest' },
  ],
  support: [
    { name: 'FAQ', path: '/faq' },
    { name: 'Tentang Kami', path: '/about' },
    { name: 'Hubungi Kami', path: '/contact' },
    { name: 'Cara Pemesanan', path: '/how-to-order' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/legal/privacy' },
    { name: 'Terms of Service', path: '/legal/terms' },
    { name: 'Refund Policy', path: '/legal/refund' },
  ],
}

const socialLinks = [
  { icon: Instagram, url: 'https://instagram.com/4urloev', label: 'Instagram' },
  { icon: Facebook, url: 'https://facebook.com/4urloev', label: 'Facebook' },
  { icon: Twitter, url: 'https://twitter.com/4urloev', label: 'Twitter' },
]
</script>

<template>
  <footer class="relative mt-auto">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
    
    <div class="relative glass-card border-t">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <!-- Brand Section -->
          <div class="lg:col-span-2 space-y-4">
            <NuxtLink to="/" class="flex items-center gap-2 group">
              <div class="relative">
                <Sparkles class="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              </div>
              <span class="text-2xl font-bold gradient-text">4UrLoev</span>
            </NuxtLink>
            
            <p class="text-muted-foreground max-w-sm">
              Ciptakan momen spesial dengan hadiah personalisasi unik. 
              Setiap produk dibuat dengan cinta untuk orang tersayang.
            </p>

            <div class="space-y-2 text-sm text-muted-foreground">
              <div class="flex items-center gap-2">
                <Mail class="h-4 w-4 text-primary" />
                <a href="mailto:hello@4urloev.com" class="hover:text-primary transition-colors">
                  hello@4urloev.com
                </a>
              </div>
              <div class="flex items-center gap-2">
                <Phone class="h-4 w-4 text-primary" />
                <a href="tel:+6281234567890" class="hover:text-primary transition-colors">
                  +62 812-3456-7890
                </a>
              </div>
              <div class="flex items-center gap-2">
                <MapPin class="h-4 w-4 text-primary" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>

            <!-- Social Links -->
            <div class="flex items-center gap-3 pt-2">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 rounded-full glass-card-sm hover:bg-primary/10 hover:text-primary transition-all hover:-translate-y-1"
                :aria-label="social.label"
              >
                <component :is="social.icon" class="h-5 w-5" />
              </a>
            </div>
          </div>

          <!-- Shop Links -->
          <div>
            <h3 class="font-semibold text-foreground mb-4">Shop</h3>
            <ul class="space-y-2">
              <li v-for="link in footerLinks.shop" :key="link.path">
                <NuxtLink
                  :to="link.path"
                  class="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Support Links -->
          <div>
            <h3 class="font-semibold text-foreground mb-4">Bantuan</h3>
            <ul class="space-y-2">
              <li v-for="link in footerLinks.support" :key="link.path">
                <NuxtLink
                  :to="link.path"
                  class="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div>
            <h3 class="font-semibold text-foreground mb-4">Legal</h3>
            <ul class="space-y-2">
              <li v-for="link in footerLinks.legal" :key="link.path">
                <NuxtLink
                  :to="link.path"
                  class="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-12 pt-8 border-t border-border/50">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="text-sm text-muted-foreground">
              &copy; {{ currentYear }} 4UrLoev. All rights reserved.
            </p>
            <p class="text-sm text-muted-foreground">
              Made with <span class="text-secondary">&hearts;</span> in Indonesia
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>


