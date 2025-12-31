<script setup lang="ts">
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-vue-next'

// SEO Meta Tags (Requirements: 5.1, 5.2, 5.3, 7.3)
useSeo(defaultSeoConfigs.contact)

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  // TODO: Implement contact form submission
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSubmitting.value = false
  form.value = { name: '', email: '', subject: '', message: '' }
}
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold gradient-text mb-4">Hubungi Kami</h1>
        <p class="text-muted-foreground text-lg">
          Ada pertanyaan atau saran? Kami senang mendengar dari Anda!
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact Info -->
        <div class="space-y-6">
          <div class="glass-card p-6 rounded-2xl">
            <h2 class="text-xl font-semibold mb-6">Informasi Kontak</h2>
            
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="p-3 rounded-full bg-primary/10">
                  <Mail class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p class="font-medium">Email</p>
                  <a href="mailto:hello@4urloev.com" class="text-muted-foreground hover:text-primary transition-colors">
                    hello@4urloev.com
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="p-3 rounded-full bg-primary/10">
                  <Phone class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p class="font-medium">Telepon / WhatsApp</p>
                  <a href="tel:+6281234567890" class="text-muted-foreground hover:text-primary transition-colors">
                    +62 812-3456-7890
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="p-3 rounded-full bg-primary/10">
                  <MapPin class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p class="font-medium">Lokasi</p>
                  <p class="text-muted-foreground">Jakarta, Indonesia</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="p-3 rounded-full bg-green-500/10">
                  <MessageCircle class="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p class="font-medium">WhatsApp</p>
                  <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank"
                    class="text-muted-foreground hover:text-green-500 transition-colors"
                  >
                    Chat langsung dengan kami
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl">
            <h3 class="font-semibold mb-2">Jam Operasional</h3>
            <p class="text-muted-foreground text-sm">
              Senin - Jumat: 09:00 - 18:00 WIB<br />
              Sabtu: 09:00 - 15:00 WIB<br />
              Minggu: Tutup
            </p>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="glass-card p-6 rounded-2xl">
          <h2 class="text-xl font-semibold mb-6">Kirim Pesan</h2>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nama</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Subjek</label>
              <input
                v-model="form.subject"
                type="text"
                required
                class="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Subjek pesan"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Pesan</label>
              <textarea
                v-model="form.message"
                required
                rows="4"
                class="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Tulis pesan Anda..."
              />
            </div>

            <UiButton type="submit" class="w-full" :disabled="isSubmitting">
              <Send class="h-4 w-4 mr-2" />
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Pesan' }}
            </UiButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
