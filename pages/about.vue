<script setup lang="ts">
import { Heart, Gift, Palette, Users, Star, Sparkles } from 'lucide-vue-next'

const values = [
  {
    icon: Heart,
    title: 'Dengan Cinta',
    description: 'Setiap produk dibuat dengan penuh cinta dan perhatian terhadap detail',
  },
  {
    icon: Palette,
    title: 'Kreativitas',
    description: 'Kami mendorong ekspresi kreatif melalui personalisasi tanpa batas',
  },
  {
    icon: Gift,
    title: 'Keunikan',
    description: 'Setiap hadiah unik dan bermakna, disesuaikan untuk penerima spesial',
  },
  {
    icon: Users,
    title: 'Komunitas',
    description: 'Membangun komunitas yang berbagi kebahagiaan melalui hadiah',
  },
]

const stats = [
  { value: '500+', label: 'Produk' },
  { value: '10K+', label: 'Pelanggan' },
  { value: '50K+', label: 'Pesanan' },
  { value: '4.9', label: 'Rating' },
]

useSeoMeta({
  title: 'Tentang Kami - 4UrLoev',
  description: 'Kenali lebih dekat 4UrLoev - platform DIY products dan personalized gifts terdepan di Indonesia',
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-24 px-4 overflow-hidden">
      <div class="absolute inset-0 animated-gradient-bg opacity-30" />
      
      <div class="container mx-auto relative z-10">
        <div class="max-w-3xl mx-auto text-center animate-fade-up">
          <UiBadge variant="glass" class="mb-4">Tentang Kami</UiBadge>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Ciptakan Momen
            <span class="gradient-text">Tak Terlupakan</span>
          </h1>
          <p class="text-lg text-muted-foreground">
            4UrLoev hadir untuk membantu Anda mengekspresikan cinta dan apresiasi 
            melalui hadiah personalisasi yang unik dan bermakna.
          </p>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="py-24 px-4">
      <div class="container mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="animate-fade-up">
            <h2 class="text-3xl sm:text-4xl font-bold mb-6 gradient-text">
              Cerita Kami
            </h2>
            <div class="space-y-4 text-muted-foreground">
              <p>
                Berawal dari keinginan sederhana untuk memberikan hadiah yang bermakna, 
                4UrLoev lahir pada tahun 2020 di Jakarta. Kami percaya bahwa hadiah 
                terbaik adalah yang dibuat dengan cinta dan personal.
              </p>
              <p>
                Dengan tim kreatif yang berdedikasi, kami terus berinovasi menghadirkan 
                produk DIY dan layanan personalisasi yang memungkinkan setiap orang 
                menciptakan hadiah unik untuk orang tersayang.
              </p>
              <p>
                Kini, 4UrLoev telah melayani lebih dari 10.000 pelanggan di seluruh 
                Indonesia, membantu mereka menciptakan momen spesial yang tak terlupakan.
              </p>
            </div>
          </div>
          
          <div class="relative animate-fade-up animation-delay-200">
            <div class="glass-card rounded-3xl p-8 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
              <div class="relative z-10 grid grid-cols-2 gap-6">
                <div
                  v-for="(stat, index) in stats"
                  :key="stat.label"
                  :class="`text-center p-4 glass-card-sm rounded-2xl animate-fade-up animation-delay-${(index + 3) * 100}`"
                >
                  <p class="text-3xl font-bold gradient-text">{{ stat.value }}</p>
                  <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-24 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div class="container mx-auto">
        <div class="text-center mb-16 animate-fade-up">
          <UiBadge variant="glass" class="mb-4">Nilai Kami</UiBadge>
          <h2 class="text-3xl sm:text-4xl font-bold gradient-text">
            Yang Kami Percaya
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(value, index) in values"
            :key="value.title"
            :class="`glass-card rounded-2xl p-8 text-center hover-lift animate-fade-up animation-delay-${(index + 1) * 100}`"
          >
            <div class="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6">
              <component :is="value.icon" class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-3">{{ value.title }}</h3>
            <p class="text-muted-foreground">{{ value.description }}</p>
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
            <Sparkles class="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 class="text-3xl sm:text-4xl font-bold mb-4">
              Bergabung Bersama Kami
            </h2>
            <p class="text-muted-foreground max-w-2xl mx-auto mb-8">
              Mulai perjalanan Anda dalam menciptakan hadiah yang bermakna. 
              Jelajahi koleksi kami atau hubungi tim kami untuk custom order.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <NuxtLink to="/products">
                <UiButton size="xl" variant="glow">
                  Jelajahi Produk
                </UiButton>
              </NuxtLink>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                <UiButton size="xl" variant="outline">
                  Hubungi Kami
                </UiButton>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


