<script setup lang="ts">
import { ChevronDown, Search, HelpCircle } from 'lucide-vue-next'

const searchQuery = ref('')

const faqCategories = [
  {
    name: 'Pemesanan',
    faqs: [
      {
        question: 'Bagaimana cara memesan produk?',
        answer: 'Anda dapat memesan produk melalui website kami dengan menambahkan item ke keranjang, lalu melanjutkan ke proses checkout. Isi data pengiriman dan pilih metode pembayaran yang diinginkan.',
      },
      {
        question: 'Apakah bisa melakukan custom order?',
        answer: 'Ya, kami menyediakan layanan custom order. Anda dapat mengunjungi halaman Customize atau menghubungi kami melalui WhatsApp untuk konsultasi lebih lanjut.',
      },
      {
        question: 'Berapa lama proses produksi?',
        answer: 'Untuk produk ready stock, proses pengiriman dilakukan dalam 1-2 hari kerja. Untuk produk custom, waktu produksi berkisar 3-7 hari kerja tergantung kompleksitas desain.',
      },
    ],
  },
  {
    name: 'Pembayaran',
    faqs: [
      {
        question: 'Metode pembayaran apa saja yang tersedia?',
        answer: 'Kami menerima pembayaran melalui Bank Transfer (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, DANA), dan kartu kredit/debit.',
      },
      {
        question: 'Apakah pembayaran aman?',
        answer: 'Ya, semua transaksi dilindungi dengan enkripsi SSL dan kami bermitra dengan payment gateway terpercaya untuk keamanan transaksi Anda.',
      },
    ],
  },
  {
    name: 'Pengiriman',
    faqs: [
      {
        question: 'Berapa biaya pengiriman?',
        answer: 'Biaya pengiriman dihitung otomatis berdasarkan berat paket dan lokasi tujuan. Kami bekerja sama dengan JNE, J&T, SiCepat, dan ekspedisi lainnya.',
      },
      {
        question: 'Apakah bisa menggunakan ekspedisi pilihan sendiri?',
        answer: 'Saat ini kami menyediakan beberapa opsi ekspedisi yang dapat Anda pilih saat checkout. Untuk request khusus, silakan hubungi customer service kami.',
      },
      {
        question: 'Bagaimana cara melacak pesanan?',
        answer: 'Setelah pesanan dikirim, Anda akan menerima nomor resi via email dan dapat melacak status pengiriman melalui halaman Akun atau langsung ke website ekspedisi.',
      },
    ],
  },
  {
    name: 'Pengembalian',
    faqs: [
      {
        question: 'Bagaimana jika produk rusak saat diterima?',
        answer: 'Segera hubungi kami dalam waktu 1x24 jam dengan menyertakan foto/video unboxing. Kami akan memproses penggantian atau refund sesuai kebijakan.',
      },
      {
        question: 'Apakah ada garansi produk?',
        answer: 'Kami memberikan garansi 7 hari untuk kerusakan produksi. Untuk custom order, pastikan preview desain sudah sesuai sebelum konfirmasi produksi.',
      },
    ],
  },
]

const filteredCategories = computed(() => {
  if (!searchQuery.value) return faqCategories

  return faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.value.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0)
})

const openItems = ref<string[]>([])

const toggleItem = (id: string) => {
  const index = openItems.value.indexOf(id)
  if (index > -1) {
    openItems.value.splice(index, 1)
  } else {
    openItems.value.push(id)
  }
}

// SEO Meta Tags (Requirements: 5.1, 5.2, 5.3, 7.3)
useSeo(defaultSeoConfigs.faq)

// Structured Data - FAQPage schema (Requirement 6.5)
// Flatten all FAQs from all categories for structured data
const allFaqs = faqCategories.flatMap(category => 
  category.faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer,
  }))
)
useFAQSchema(allFaqs)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-12 animate-fade-up">
      <UiBadge variant="glass" class="mb-4">FAQ</UiBadge>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
        Pertanyaan Umum
      </h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        Temukan jawaban untuk pertanyaan yang sering diajukan
      </p>
    </div>

    <!-- Search -->
    <div class="max-w-xl mx-auto mb-12 animate-fade-up animation-delay-100">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <UiInput
          v-model="searchQuery"
          placeholder="Cari pertanyaan..."
          class="pl-12 h-14 text-lg rounded-2xl"
        />
      </div>
    </div>

    <!-- FAQ Categories -->
    <div class="max-w-3xl mx-auto space-y-8">
      <div
        v-for="(category, catIndex) in filteredCategories"
        :key="category.name"
        :class="`animate-fade-up animation-delay-${(catIndex + 2) * 100}`"
      >
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <HelpCircle class="h-5 w-5 text-primary" />
          {{ category.name }}
        </h2>

        <div class="glass-card rounded-2xl divide-y divide-border/50">
          <div
            v-for="(faq, faqIndex) in category.faqs"
            :key="`${category.name}-${faqIndex}`"
          >
            <button
              @click="toggleItem(`${category.name}-${faqIndex}`)"
              class="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
            >
              <span class="font-medium pr-4">{{ faq.question }}</span>
              <ChevronDown
                :class="[
                  'h-5 w-5 shrink-0 transition-transform duration-200',
                  openItems.includes(`${category.name}-${faqIndex}`) ? 'rotate-180' : ''
                ]"
              />
            </button>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="openItems.includes(`${category.name}-${faqIndex}`)"
                class="px-6 pb-6"
              >
                <p class="text-muted-foreground">{{ faq.answer }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredCategories.length === 0" class="text-center py-12">
        <Search class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Tidak ditemukan</h3>
        <p class="text-muted-foreground">
          Tidak ada pertanyaan yang cocok dengan pencarian Anda
        </p>
      </div>
    </div>

    <!-- Contact CTA -->
    <div class="text-center mt-16 animate-fade-up">
      <div class="glass-card rounded-2xl p-8 max-w-xl mx-auto">
        <h3 class="text-xl font-bold mb-4">Masih Ada Pertanyaan?</h3>
        <p class="text-muted-foreground mb-6">
          Tim kami siap membantu Anda. Hubungi kami melalui WhatsApp atau email.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
            <UiButton size="lg">
              Chat WhatsApp
            </UiButton>
          </a>
          <a href="mailto:hello@4urloev.com">
            <UiButton variant="outline" size="lg">
              Kirim Email
            </UiButton>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>


