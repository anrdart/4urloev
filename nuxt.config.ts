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
    '@nuxtjs/sitemap',
  ],

  // ============================================
  // Sitemap configuration (Requirement 7.1)
  // ============================================
  site: {
    url: process.env.SITE_URL || 'https://4urloev.com',
  },
  
  sitemap: {
    // Exclude admin and private routes
    exclude: [
      '/admin/**',
      '/account/**',
      '/checkout/**',
      '/auth/**',
      '/confirm',
    ],
    // Static routes
    urls: [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/products', changefreq: 'daily', priority: 0.9 },
      { loc: '/bundles', changefreq: 'weekly', priority: 0.8 },
      { loc: '/customize', changefreq: 'monthly', priority: 0.7 },
      { loc: '/about', changefreq: 'monthly', priority: 0.5 },
      { loc: '/faq', changefreq: 'monthly', priority: 0.5 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.5 },
    ],
    // Enable automatic route discovery
    autoLastmod: true,
    // Default values for all URLs
    defaults: {
      changefreq: 'weekly',
      priority: 0.5,
    },
  },

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
        // ============================================
        // Preconnect hints for external domains (Requirements: 4.2, 4.3)
        // ============================================
        // Google Fonts - preconnect for faster font loading
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Supabase - preconnect for faster API/image loading
        { rel: 'preconnect', href: process.env.SUPABASE_URL || 'https://supabase.co' },
        { rel: 'dns-prefetch', href: process.env.SUPABASE_URL || 'https://supabase.co' },
        // Stripe - preconnect for payment processing
        { rel: 'preconnect', href: 'https://js.stripe.com' },
        { rel: 'dns-prefetch', href: 'https://js.stripe.com' },
        { rel: 'preconnect', href: 'https://api.stripe.com' },
        { rel: 'dns-prefetch', href: 'https://api.stripe.com' },
        // Cloudflare CDN - preconnect for static assets
        { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
        // ============================================
        // Font loading optimization (Requirements: 4.5)
        // ============================================
        // Google Fonts stylesheet with font-display: swap for FOIT prevention
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
        },
      ],
      // Script loading optimization (Requirements: 2.4)
      script: [
        // Noscript fallback for fonts
        {
          innerHTML: '',
          tagPosition: 'bodyClose',
        },
      ],
      // Add noscript for font fallback
      noscript: [
        {
          innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap">',
        },
      ],
      htmlAttrs: {
        lang: 'id',
      },
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
    presets: {
      // Product card images - optimized for grid display
      productCard: {
        modifiers: {
          format: 'webp',
          quality: 80,
          width: 400,
          height: 400,
          fit: 'cover',
        },
      },
      // Product thumbnails - smaller size for lists/carousels
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 75,
          width: 150,
          height: 150,
          fit: 'cover',
        },
      },
      // Hero images - high quality for above-the-fold
      hero: {
        modifiers: {
          format: 'webp',
          quality: 85,
          width: 1920,
          height: 1080,
          fit: 'cover',
        },
      },
      // Product detail images - larger size for detail view
      productDetail: {
        modifiers: {
          format: 'webp',
          quality: 85,
          width: 800,
          height: 800,
          fit: 'contain',
        },
      },
      // Avatar/profile images
      avatar: {
        modifiers: {
          format: 'webp',
          quality: 80,
          width: 100,
          height: 100,
          fit: 'cover',
        },
      },
    },
    // Densities for responsive images
    densities: [1, 2],
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

  // Transpile radix-vue for SSR compatibility
  build: {
    transpile: ['radix-vue'],
  },

  // ============================================
  // Experimental features for prefetching (Requirements: 4.2)
  // ============================================
  experimental: {
    // Enable payload extraction for better prefetching
    payloadExtraction: true,
    // Async context for better performance
    asyncContext: true,
  },

  // ============================================
  // Features configuration for INP optimization (Requirements: 8.2)
  // ============================================
  features: {
    // Inline styles for faster initial render
    inlineStyles: true,
  },

  // ============================================
  // Router configuration for link prefetching (Requirements: 4.2)
  // ============================================
  router: {
    options: {
      // Enable link prefetching on hover/intersection
      linkPrefetchedClass: 'nuxt-link-prefetched',
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
    // Compression for better performance
    compressPublicAssets: true,
    // Route-level caching configuration
    routeRules: {
      // Static assets - long-term caching (1 year)
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Images and media - long-term caching
      '/images/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Favicon and static files
      '/favicon/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // API routes - stale-while-revalidate pattern (Requirements: 4.4)
      '/api/**': {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
        },
      },
    },
  },

  routeRules: {
    // ============================================
    // SSR Configuration (Requirements: 9.1, 9.5)
    // ============================================
    // Homepage - SSR enabled for SEO
    '/': { ssr: true },
    // Admin pages - SSR disabled (private area)
    '/admin/**': { ssr: false },
    // Account pages - SSR disabled (requires auth)
    '/account': { ssr: false },
    '/account/**': { ssr: false },
    // Checkout pages - SSR disabled (requires auth)
    '/checkout/**': { ssr: false },
    // Auth pages - SSR disabled
    '/auth/**': { ssr: false },
    // Static assets caching (Requirements: 4.1)
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    // Product pages - enable SSR with SWR caching for SEO
    '/products': {
      ssr: true,
      swr: 3600, // Cache for 1 hour, revalidate in background
    },
    '/products/**': {
      ssr: true,
      swr: 3600,
    },
    // Public pages with SSR and SWR
    '/bundles': {
      ssr: true,
      swr: 3600,
    },
    '/faq': {
      ssr: true,
      swr: 86400, // Cache for 24 hours
    },
    '/about': {
      ssr: true,
      swr: 86400,
    },
    '/contact': {
      ssr: true,
      swr: 86400,
    },
    '/customize': {
      ssr: true,
      swr: 3600,
    },
  },

  // Vite optimization for code splitting and bundle optimization
  vite: {
    build: {
      // Enable chunk splitting for better caching
      rollupOptions: {
        output: {
          // Manual chunk splitting strategy
          manualChunks: (id: string) => {
            // Vendor chunks - split large dependencies
            if (id.includes('node_modules')) {
              // Three.js and TresJS - large 3D libraries
              if (id.includes('three') || id.includes('@tresjs')) {
                return 'vendor-three'
              }
              // Fabric.js - canvas library for customization
              if (id.includes('fabric')) {
                return 'vendor-fabric'
              }
              // Vue ecosystem
              if (id.includes('vue') || id.includes('pinia') || id.includes('@vueuse')) {
                return 'vendor-vue'
              }
              // UI components
              if (id.includes('radix-vue') || id.includes('lucide')) {
                return 'vendor-ui'
              }
              // Supabase client
              if (id.includes('@supabase')) {
                return 'vendor-supabase'
              }
              // Stripe
              if (id.includes('stripe')) {
                return 'vendor-stripe'
              }
              // Other node_modules
              return 'vendor-common'
            }
          },
          // Optimize chunk file names for caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // Increase chunk size warning limit for large libraries
      chunkSizeWarningLimit: 1000,
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'vue',
        'pinia',
        '@vueuse/core',
        'radix-vue',
        'lucide-vue-next',
      ],
      // Exclude heavy libraries from pre-bundling (will be lazy loaded)
      exclude: [
        'three',
        '@tresjs/core',
        '@tresjs/cientos',
        'fabric',
      ],
    },
  },
})
