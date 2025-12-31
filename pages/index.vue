<script setup lang="ts">
import { ArrowRight, Sparkles, Package, Palette, Gift, Star } from 'lucide-vue-next'

const { getFeaturedProducts, getBundles } = useProducts()

// Fetch featured products
const { data: featuredProducts, pending: productsLoading } = await useAsyncData(
  'featured-products',
  () => getFeaturedProducts(6)
)

// Fetch bundles
const { data: bundles, pending: bundlesLoading } = await useAsyncData(
  'bundles',
  () => getBundles(true)
)

// SEO Meta Tags (Requirements: 5.1, 5.2, 5.3, 7.3)
useSeo(defaultSeoConfigs.home)

// Structured Data - Organization and Website schemas (Requirements: 6.2, 5.5)
useHomepageStructuredData()

// LCP Optimization (Requirement 8.1)
useHomepageLCP()

const features = [
  {
    icon: Package,
    title: 'Produk DIY',
    description: 'Barang kerajinan tangan unik dan produk yang dapat disesuaikan untuk setiap kesempatan',
    gradient: 'from-primary to-primary/50',
  },
  {
    icon: Palette,
    title: 'Pengalaman Personal',
    description: 'Sesuaikan lingkungan belanja Anda dengan tema, warna, dan efek yang Anda inginkan',
    gradient: 'from-secondary to-secondary/50',
  },
  {
    icon: Sparkles,
    title: 'Hadiah Spesial',
    description: 'Ciptakan hadiah yang unik dengan alat kustomisasi canggih kami',
    gradient: 'from-accent to-accent/50',
  },
]

const testimonials = [
  {
    name: 'Sarah A.',
    role: 'Happy Customer',
    content: 'Produk DIY dari 4UrLoev sangat berkualitas! Saya bisa membuat hadiah ulang tahun yang sangat personal untuk pacar saya.',
    rating: 5,
  },
  {
    name: 'Budi R.',
    role: 'Regular Buyer',
    content: 'Proses customization sangat mudah dan hasilnya luar biasa. Recommended banget!',
    rating: 5,
  },
  {
    name: 'Dewi K.',
    role: 'DIY Enthusiast',
    content: 'Bundling package-nya worth it banget. Dapat banyak item dengan harga terjangkau.',
    rating: 5,
  },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <!-- Animated background -->
      <div class="absolute inset-0 animated-gradient-bg opacity-50" />
      
      <!-- Hero content -->
      <div class="container mx-auto px-4 py-20 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left side - Text content -->
          <div class="space-y-8 animate-fade-up">
            <div class="inline-flex items-center gap-2 glass-card-sm px-4 py-2 rounded-full">
              <Sparkles class="h-4 w-4 text-primary" />
              <span class="text-sm font-medium">DIY & Personalized Gifts</span>
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Ciptakan 
              <span class="gradient-text">Momen Spesial</span>
              dengan Hadiah Personal
            </h1>
            
            <p class="text-lg text-muted-foreground max-w-xl">
              Pilih jalur yang tepat: Desain siap pakai instant download atau 
              desain kustom eksklusif. Solusi lengkap untuk kebutuhan desain Anda.
            </p>
            
            <div class="flex flex-wrap gap-4">
              <NuxtLink to="/products">
                <UiButton size="xl" class="group">
                  Jelajahi Produk
                  <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </UiButton>
              </NuxtLink>
              <NuxtLink to="/customize">
                <UiButton variant="outline" size="xl">
                  Custom Design
                </UiButton>
              </NuxtLink>
            </div>
            
            <!-- Stats -->
            <div class="flex gap-8 pt-4">
              <div>
                <p class="text-3xl font-bold gradient-text">500+</p>
                <p class="text-sm text-muted-foreground">Produk</p>
              </div>
              <div>
                <p class="text-3xl font-bold gradient-text">10K+</p>
                <p class="text-sm text-muted-foreground">Pelanggan</p>
              </div>
              <div>
                <p class="text-3xl font-bold gradient-text">4.9</p>
                <p class="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
          
          <!-- Right side - Visual -->
          <div class="relative animate-fade-up animation-delay-200">
            <div class="relative aspect-square max-w-lg mx-auto">
              <!-- Floating cards -->
              <div class="absolute top-0 left-0 w-48 h-48 glass-card rounded-3xl p-4 animate-float shadow-glow-sm">
                <Gift class="h-8 w-8 text-primary mb-2" />
                <p class="font-semibold">Gift Box</p>
                <p class="text-sm text-muted-foreground">Custom packaging</p>
              </div>
              
              <div class="absolute top-1/4 right-0 w-40 h-40 glass-card rounded-3xl p-4 animate-float animation-delay-300 shadow-glow-sm">
                <Palette class="h-8 w-8 text-secondary mb-2" />
                <p class="font-semibold">Designs</p>
                <p class="text-sm text-muted-foreground">200+ templates</p>
              </div>
              
              <div class="absolute bottom-0 left-1/4 w-52 h-52 glass-card rounded-3xl p-4 animate-float animation-delay-500 shadow-glow-sm">
                <Sparkles class="h-8 w-8 text-accent mb-2" />
                <p class="font-semibold">Personalization</p>
                <p class="text-sm text-muted-foreground">Make it unique</p>
              </div>
              
              <!-- Center decoration -->
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="py-24 px-4">
      <div class="container mx-auto">
        <div class="text-center mb-16 animate-fade-up">
          <UiBadge variant="glass" class="mb-4">Produk Unggulan</UiBadge>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
            Favorit Pelanggan
          </h2>
          <p class="text-muted-foreground max-w-2xl mx-auto">
            Temukan koleksi produk terlaris kami yang dipilih dengan cermat untuk Anda
          </p>
        </div>
        
        <div v-if="productsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Fixed height skeleton for CLS prevention (Requirement 8.4) -->
          <UiLoadingSkeleton v-for="i in 6" :key="i" variant="product" />
        </div>
        
        <div v-else-if="featuredProducts?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductsProductCard
            v-for="(product, index) in featuredProducts"
            :key="product.id"
            :product="product"
            :priority="index < 3"
            :class="`animate-fade-up animation-delay-${(index + 1) * 100}`"
          />
        </div>
        
        <div v-else class="text-center py-12">
          <p class="text-muted-foreground">Belum ada produk tersedia</p>
        </div>
        
        <div class="text-center mt-12">
          <NuxtLink to="/products">
            <UiButton variant="outline" size="lg" class="group">
              Lihat Semua Produk
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 px-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div class="container mx-auto relative z-10">
        <div class="text-center mb-16 animate-fade-up">
          <UiBadge variant="glass" class="mb-4">Fitur Unggulan</UiBadge>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
            Kenapa Memilih Kami?
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            :class="`glass-card rounded-3xl p-8 hover-lift group animate-fade-up animation-delay-${(index + 1) * 100}`"
          >
            <div
              :class="`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`"
            >
              <component :is="feature.icon" class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
              {{ feature.title }}
            </h3>
            <p class="text-muted-foreground">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-24 px-4">
      <div class="container mx-auto">
        <div class="text-center mb-16 animate-fade-up">
          <UiBadge variant="glass" class="mb-4">Testimoni</UiBadge>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
            Apa Kata Mereka?
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            :class="`glass-card rounded-3xl p-8 animate-fade-up animation-delay-${(index + 1) * 100}`"
          >
            <div class="flex gap-1 mb-4">
              <Star
                v-for="i in testimonial.rating"
                :key="i"
                class="h-5 w-5 text-yellow-500 fill-yellow-500"
              />
            </div>
            <p class="text-muted-foreground mb-6">
              "{{ testimonial.content }}"
            </p>
            <div class="flex items-center gap-3">
              <UiAvatar>
                <UiAvatarFallback>{{ testimonial.name.charAt(0) }}</UiAvatarFallback>
              </UiAvatar>
              <div>
                <p class="font-semibold">{{ testimonial.name }}</p>
                <p class="text-sm text-muted-foreground">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 px-4">
      <div class="container mx-auto">
        <div class="glass-card-lg rounded-3xl p-12 text-center relative overflow-hidden">
          <div class="absolute inset-0 animated-gradient-bg opacity-20" />
          
          <div class="relative z-10">
            <Sparkles class="h-12 w-12 text-primary mx-auto mb-6 animate-pulse" />
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Siap Membuat Hadiah Spesial?
            </h2>
            <p class="text-muted-foreground max-w-2xl mx-auto mb-8">
              Mulai jelajahi koleksi kami dan temukan inspirasi untuk hadiah yang sempurna.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <NuxtLink to="/products">
                <UiButton size="xl" variant="glow">
                  Mulai Sekarang
                  <ArrowRight class="h-5 w-5" />
                </UiButton>
              </NuxtLink>
              <NuxtLink to="/bundles">
                <UiButton size="xl" variant="outline">
                  Lihat Bundles
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


