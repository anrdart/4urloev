// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  future: {
    compatibilityVersion: 4,
  },
  
  devServer: {
    port: 3005,
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@tresjs/nuxt',
  ],

  tailwindcss: {
    cssPath: ['~/assets/css/main.css', { injectPosition: 'first' }],
    configPath: 'tailwind.config.ts',
  },

  // css: ['~/assets/css/main.css'], // Handled by tailwindcss module

  app: {
    head: {
      title: '4UrLoev - DIY Products & Personalized Gifts',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Pilih jalur yang tepat: Desain siap pakai instant download atau desain kustom eksklusif. Solusi lengkap untuk kebutuhan desain Anda.' 
        },
        { name: 'keywords', content: 'DIY products, personalized gifts, custom shopping, desain kustom, hadiah personal' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap' 
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/auth',
      callback: '/confirm',
      include: undefined,
      exclude: ['/', '/products', '/products/*', '/faq', '/about', '/bundles'],
      cookieRedirect: false,
    },
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  image: {
    quality: 80,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Enable in production
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  routeRules: {
    '/': { ssr: false },
    '/admin/**': { ssr: false },
    '/account': { ssr: false },
    '/checkout/**': { ssr: false },
  },
})
