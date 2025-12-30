<script setup lang="ts">
import { MessageCircle, X } from 'lucide-vue-next'

const isOpen = ref(false)
const phoneNumber = '6281234567890'
const defaultMessage = 'Halo, saya ingin bertanya tentang produk di 4UrLoev'

const whatsappUrl = computed(() => {
  const message = encodeURIComponent(defaultMessage)
  return `https://wa.me/${phoneNumber}?text=${message}`
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const openWhatsApp = () => {
  window.open(whatsappUrl.value, '_blank')
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat Popup -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-16 right-0 w-80 glass-card-lg rounded-2xl shadow-2xl overflow-hidden mb-4"
      >
        <!-- Header -->
        <div class="bg-green-500 text-white p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle class="h-5 w-5" />
            </div>
            <div>
              <p class="font-semibold">4UrLoev Support</p>
              <p class="text-xs text-white/80">Biasanya membalas dalam beberapa menit</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-4">
          <div class="bg-muted/50 rounded-lg p-3">
            <p class="text-sm">
              Halo! 👋 Ada yang bisa kami bantu? Chat langsung dengan tim kami via WhatsApp.
            </p>
          </div>

          <button
            @click="openWhatsApp"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle class="h-5 w-5" />
            Mulai Chat
          </button>
        </div>
      </div>
    </Transition>

    <!-- Floating Button -->
    <button
      @click="toggleChat"
      class="relative w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center group"
      aria-label="WhatsApp Chat"
    >
      <Transition
        enter-active-class="transition-transform duration-200"
        enter-from-class="rotate-90 scale-0"
        enter-to-class="rotate-0 scale-100"
        leave-active-class="transition-transform duration-200"
        leave-from-class="rotate-0 scale-100"
        leave-to-class="rotate-90 scale-0"
        mode="out-in"
      >
        <X v-if="isOpen" class="h-6 w-6" />
        <MessageCircle v-else class="h-6 w-6" />
      </Transition>

      <!-- Pulse effect -->
      <span class="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
    </button>
  </div>
</template>


