<script setup lang="ts">
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-vue-next'

const route = useRoute()
const orderNumber = computed(() => route.query.order as string)

useSeoMeta({
  title: 'Pesanan Berhasil - 4UrLoev',
  description: 'Terima kasih atas pesanan Anda',
})
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <div class="max-w-xl mx-auto text-center animate-fade-up">
      <div class="glass-card-lg rounded-3xl p-12 relative overflow-hidden">
        <div class="absolute inset-0 animated-gradient-bg opacity-10" />
        
        <div class="relative z-10">
          <div class="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle class="h-12 w-12 text-green-500" />
          </div>

          <h1 class="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
            Pesanan Berhasil!
          </h1>

          <p class="text-muted-foreground mb-6">
            Terima kasih atas pesanan Anda. Kami akan segera memproses dan 
            mengirimkan update melalui email.
          </p>

          <div v-if="orderNumber" class="glass-card-sm rounded-xl p-4 mb-8">
            <p class="text-sm text-muted-foreground mb-1">Nomor Pesanan</p>
            <p class="text-xl font-bold font-mono">{{ orderNumber }}</p>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-4 glass-card-sm rounded-xl p-4">
              <div class="p-3 rounded-lg bg-primary/10">
                <Package class="h-6 w-6 text-primary" />
              </div>
              <div class="text-left">
                <p class="font-medium">Langkah Selanjutnya</p>
                <p class="text-sm text-muted-foreground">
                  Cek email untuk konfirmasi pesanan dan instruksi pembayaran
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mt-8">
            <NuxtLink to="/account" class="flex-1">
              <UiButton variant="outline" size="lg" class="w-full">
                <Package class="h-4 w-4" />
                Lihat Pesanan
              </UiButton>
            </NuxtLink>
            <NuxtLink to="/" class="flex-1">
              <UiButton size="lg" class="w-full">
                <Home class="h-4 w-4" />
                Ke Beranda
              </UiButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


