<script setup lang="ts">
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const showPassword = ref(false)
const isLoading = ref(false)

const form = ref({
  email: '',
  password: '',
  displayName: '',
})

const errors = ref({
  email: '',
  password: '',
  displayName: '',
})

const validateForm = () => {
  errors.value = { email: '', password: '', displayName: '' }
  let isValid = true

  if (!form.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Invalid email format'
    isValid = false
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
    isValid = false
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    isValid = false
  }

  if (mode.value === 'register' && !form.value.displayName) {
    errors.value.displayName = 'Name is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    if (mode.value === 'login') {
      await authStore.signIn(form.value.email, form.value.password)
      toast.success('Berhasil masuk!')
    } else {
      await authStore.signUp(form.value.email, form.value.password, form.value.displayName)
      toast.success('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.')
    }

    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    toast.error(error.message || 'Terjadi kesalahan')
  } finally {
    isLoading.value = false
  }
}

const handleGoogleSignIn = async () => {
  try {
    await authStore.signInWithGoogle()
  } catch (error: any) {
    toast.error(error.message || 'Gagal masuk dengan Google')
  }
}

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errors.value = { email: '', password: '', displayName: '' }
}

useSeoMeta({
  title: () => mode.value === 'login' ? 'Masuk - 4UrLoev' : 'Daftar - 4UrLoev',
  description: 'Masuk atau daftar untuk mulai berbelanja di 4UrLoev',
})
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md animate-fade-up">
      <UiCard glass class="p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold mb-2 gradient-text">
            {{ mode === 'login' ? 'Selamat Datang!' : 'Buat Akun' }}
          </h1>
          <p class="text-muted-foreground">
            {{ mode === 'login' ? 'Masuk ke akun Anda' : 'Daftar untuk memulai' }}
          </p>
        </div>

        <!-- Google Sign In -->
        <UiButton
          variant="outline"
          size="lg"
          class="w-full mb-6"
          @click="handleGoogleSignIn"
        >
          <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Lanjutkan dengan Google
        </UiButton>

        <!-- Divider -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <UiSeparator />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">atau</span>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Display Name (Register only) -->
          <div v-if="mode === 'register'" class="space-y-2">
            <UiLabel for="displayName">Nama</UiLabel>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <UiInput
                id="displayName"
                v-model="form.displayName"
                type="text"
                placeholder="Nama Lengkap"
                class="pl-10"
                :class="{ 'border-destructive': errors.displayName }"
              />
            </div>
            <p v-if="errors.displayName" class="text-sm text-destructive">{{ errors.displayName }}</p>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <UiLabel for="email">Email</UiLabel>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <UiInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="nama@email.com"
                class="pl-10"
                :class="{ 'border-destructive': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <UiLabel for="password">Password</UiLabel>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <UiInput
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="pl-10 pr-10"
                :class="{ 'border-destructive': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
          </div>

          <!-- Forgot Password (Login only) -->
          <div v-if="mode === 'login'" class="flex justify-end">
            <NuxtLink to="/forgot-password" class="text-sm text-primary hover:underline">
              Lupa password?
            </NuxtLink>
          </div>

          <!-- Submit Button -->
          <UiButton type="submit" size="lg" class="w-full" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
            <template v-else>
              {{ mode === 'login' ? 'Masuk' : 'Daftar' }}
            </template>
          </UiButton>
        </form>

        <!-- Toggle Mode -->
        <p class="text-center mt-6 text-sm text-muted-foreground">
          {{ mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?' }}
          <button
            type="button"
            @click="toggleMode"
            class="text-primary font-medium hover:underline ml-1"
          >
            {{ mode === 'login' ? 'Daftar' : 'Masuk' }}
          </button>
        </p>
      </UiCard>
    </div>
  </div>
</template>


