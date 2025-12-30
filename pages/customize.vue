<script setup lang="ts">
import { Sparkles, Wand2 } from 'lucide-vue-next'

useSeoMeta({
  title: 'Customize - 4UrLoev',
  description: 'Buat desain custom Anda sendiri dengan alat kustomisasi canggih kami',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-12 animate-fade-up">
      <UiBadge variant="glass" class="mb-4">
        <Wand2 class="h-3 w-3 mr-1" />
        Custom Design
      </UiBadge>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
        Buat Desain Unik Anda
      </h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        Gunakan alat kustomisasi kami untuk membuat desain yang benar-benar personal. 
        Tambahkan teks, gambar, dan pilih warna sesuai keinginan Anda.
      </p>
    </div>

    <!-- Tips -->
    <div class="glass-card rounded-2xl p-6 mb-8 animate-fade-up animation-delay-100">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shrink-0">
          <Sparkles class="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 class="font-semibold mb-2">Tips Kustomisasi</h3>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• Klik dan tarik objek untuk memindahkannya</li>
            <li>• Gunakan handle di sudut untuk mengubah ukuran</li>
            <li>• Pilih objek dan tekan Delete untuk menghapus</li>
            <li>• Download hasil desain Anda dalam format PNG berkualitas tinggi</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Customizer -->
    <div class="animate-fade-up animation-delay-200">
      <ClientOnly>
        <ProductsLivePreviewCustomizer />
        <template #fallback>
          <div class="glass-card rounded-2xl p-12 text-center">
            <div class="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p class="text-muted-foreground">Memuat customizer...</p>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- CTA Section -->
    <div class="mt-16 text-center animate-fade-up animation-delay-300">
      <div class="glass-card rounded-2xl p-8 max-w-xl mx-auto">
        <h3 class="text-xl font-bold mb-4">Butuh Bantuan Custom Order?</h3>
        <p class="text-muted-foreground mb-6">
          Tim kami siap membantu mewujudkan desain impian Anda. 
          Hubungi kami untuk konsultasi gratis!
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
            <UiButton size="lg">
              Chat WhatsApp
            </UiButton>
          </a>
          <NuxtLink to="/products">
            <UiButton variant="outline" size="lg">
              Lihat Produk
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>


