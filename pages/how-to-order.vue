<script setup lang="ts">
import { Search, ShoppingCart, CreditCard, Package, CheckCircle, Palette } from 'lucide-vue-next'

useSeoMeta({
  title: 'Cara Pemesanan - 4UrLoev',
  description: 'Panduan lengkap cara memesan produk di 4UrLoev. Mudah, cepat, dan aman.',
})

const steps = [
  {
    icon: Search,
    title: 'Pilih Produk',
    description: 'Jelajahi katalog produk kami dan temukan item yang Anda sukai. Gunakan filter untuk mempermudah pencarian.',
  },
  {
    icon: Palette,
    title: 'Kustomisasi (Opsional)',
    description: 'Untuk produk yang bisa dikustomisasi, tambahkan desain personal Anda menggunakan editor kami.',
  },
  {
    icon: ShoppingCart,
    title: 'Tambah ke Keranjang',
    description: 'Klik tombol "Tambah ke Keranjang" dan lanjutkan belanja atau langsung checkout.',
  },
  {
    icon: CreditCard,
    title: 'Pembayaran',
    description: 'Pilih metode pembayaran yang tersedia. Kami menerima berbagai metode pembayaran yang aman.',
  },
  {
    icon: Package,
    title: 'Pengiriman',
    description: 'Pesanan akan diproses dan dikirim ke alamat Anda. Lacak status pengiriman melalui akun Anda.',
  },
  {
    icon: CheckCircle,
    title: 'Selesai!',
    description: 'Terima pesanan Anda dan nikmati produk berkualitas dari 4UrLoev.',
  },
]
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold gradient-text mb-4">Cara Pemesanan</h1>
        <p class="text-muted-foreground text-lg">
          Ikuti langkah-langkah mudah berikut untuk memesan produk di 4UrLoev
        </p>
      </div>

      <!-- Steps -->
      <div class="space-y-6">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="glass-card p-6 rounded-2xl flex items-start gap-6"
        >
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <component :is="step.icon" class="h-6 w-6 text-primary" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm font-medium text-primary">Langkah {{ index + 1 }}</span>
              <h3 class="text-lg font-semibold">{{ step.title }}</h3>
            </div>
            <p class="text-muted-foreground">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-12 grid md:grid-cols-2 gap-6">
        <div class="glass-card p-6 rounded-2xl">
          <h3 class="font-semibold mb-3">Metode Pembayaran</h3>
          <ul class="text-muted-foreground text-sm space-y-2">
            <li>• Transfer Bank (BCA, Mandiri, BNI, BRI)</li>
            <li>• E-Wallet (GoPay, OVO, DANA, ShopeePay)</li>
            <li>• Kartu Kredit/Debit</li>
            <li>• Virtual Account</li>
          </ul>
        </div>

        <div class="glass-card p-6 rounded-2xl">
          <h3 class="font-semibold mb-3">Pengiriman</h3>
          <ul class="text-muted-foreground text-sm space-y-2">
            <li>• JNE, J&T, SiCepat, AnterAja</li>
            <li>• Estimasi 2-5 hari kerja</li>
            <li>• Gratis ongkir untuk pembelian tertentu</li>
            <li>• Tracking number dikirim via email</li>
          </ul>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-12 text-center">
        <p class="text-muted-foreground mb-4">Siap untuk berbelanja?</p>
        <NuxtLink to="/products">
          <UiButton size="lg">
            Lihat Produk
          </UiButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
