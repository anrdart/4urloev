<script setup lang="ts">
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-vue-next'
import { formatPrice } from '~/lib/utils'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const cartStore = useCartStore()
const { createOrder } = useOrders()

const isProcessing = ref(false)

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  province: '',
  city: '',
  postalCode: '',
  notes: '',
})

const handleSubmit = async () => {
  if (cartStore.isEmpty) {
    toast.error('Keranjang kosong')
    return
  }

  isProcessing.value = true

  try {
    const order = await createOrder({
      shippingAddress: {
        fullName: form.value.fullName,
        phone: form.value.phone,
        address: form.value.address,
        province: form.value.province,
        city: form.value.city,
        postalCode: form.value.postalCode,
      },
      billingAddress: {
        fullName: form.value.fullName,
        email: form.value.email,
        phone: form.value.phone,
        address: form.value.address,
        province: form.value.province,
        city: form.value.city,
        postalCode: form.value.postalCode,
      },
      items: cartStore.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productDescription: item.product.description || undefined,
        quantity: item.quantity,
        unitPrice: item.product.price,
        customizations: item.customizations as Record<string, unknown> | undefined,
      })),
      subtotal: cartStore.totalPrice,
      total: cartStore.totalPrice,
      notes: form.value.notes,
    })

    cartStore.clearCart()
    router.push(`/checkout/success?order=${order.order_number}`)
  } catch (error: any) {
    toast.error(error.message || 'Gagal membuat pesanan')
  } finally {
    isProcessing.value = false
  }
}

useSeoMeta({
  title: 'Checkout - 4UrLoev',
  description: 'Selesaikan pembelian Anda',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <NuxtLink to="/cart" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 animate-fade-up">
      <ArrowLeft class="h-4 w-4" />
      Kembali ke Keranjang
    </NuxtLink>

    <h1 class="text-3xl sm:text-4xl font-bold mb-8 gradient-text animate-fade-up">
      Checkout
    </h1>

    <div v-if="cartStore.isEmpty" class="text-center py-16 glass-card rounded-2xl animate-fade-up">
      <p class="text-muted-foreground mb-4">Keranjang Anda kosong</p>
      <NuxtLink to="/products">
        <UiButton>Mulai Belanja</UiButton>
      </NuxtLink>
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-8">
      <!-- Form -->
      <div class="lg:col-span-2 animate-fade-up">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Contact Info -->
          <div class="glass-card rounded-2xl p-6">
            <h2 class="text-xl font-bold mb-6">Informasi Kontak</h2>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <UiLabel for="fullName">Nama Lengkap *</UiLabel>
                <UiInput id="fullName" v-model="form.fullName" required />
              </div>
              <div class="space-y-2">
                <UiLabel for="email">Email *</UiLabel>
                <UiInput id="email" v-model="form.email" type="email" required />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <UiLabel for="phone">Nomor Telepon *</UiLabel>
                <UiInput id="phone" v-model="form.phone" type="tel" required />
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="glass-card rounded-2xl p-6">
            <h2 class="text-xl font-bold mb-6">Alamat Pengiriman</h2>
            <div class="space-y-4">
              <div class="space-y-2">
                <UiLabel for="address">Alamat Lengkap *</UiLabel>
                <textarea
                  id="address"
                  v-model="form.address"
                  rows="3"
                  required
                  class="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
                />
              </div>
              <div class="grid sm:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <UiLabel for="province">Provinsi *</UiLabel>
                  <UiInput id="province" v-model="form.province" required />
                </div>
                <div class="space-y-2">
                  <UiLabel for="city">Kota *</UiLabel>
                  <UiInput id="city" v-model="form.city" required />
                </div>
                <div class="space-y-2">
                  <UiLabel for="postalCode">Kode Pos *</UiLabel>
                  <UiInput id="postalCode" v-model="form.postalCode" required />
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="glass-card rounded-2xl p-6">
            <h2 class="text-xl font-bold mb-6">Catatan (Opsional)</h2>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Catatan tambahan untuk pesanan Anda..."
              class="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
            />
          </div>

          <UiButton type="submit" size="xl" class="w-full" :disabled="isProcessing">
            <Loader2 v-if="isProcessing" class="h-5 w-5 animate-spin" />
            <CreditCard v-else class="h-5 w-5" />
            {{ isProcessing ? 'Memproses...' : 'Konfirmasi Pesanan' }}
          </UiButton>
        </form>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="glass-card rounded-2xl p-6 sticky top-24 animate-fade-up animation-delay-200">
          <h2 class="text-xl font-bold mb-6">Ringkasan Pesanan</h2>

          <div class="space-y-4 mb-6">
            <div
              v-for="item in cartStore.items"
              :key="item.product.id"
              class="flex gap-3"
            >
              <div class="w-16 h-16 rounded-lg overflow-hidden bg-muted/50 shrink-0">
                <img
                  :src="item.product.product_images?.[0]?.url || '/placeholder.svg'"
                  :alt="item.product.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium line-clamp-1">{{ item.product.name }}</p>
                <p class="text-sm text-muted-foreground">Qty: {{ item.quantity }}</p>
                <p class="text-sm font-medium">{{ formatPrice(item.product.price * item.quantity) }}</p>
              </div>
            </div>
          </div>

          <UiSeparator class="my-4" />

          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtotal</span>
              <span class="font-medium">{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Ongkir</span>
              <span class="text-sm text-muted-foreground">Akan dikonfirmasi</span>
            </div>
            <UiSeparator />
            <div class="flex justify-between">
              <span class="font-bold">Total</span>
              <span class="text-xl font-bold gradient-text">{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


