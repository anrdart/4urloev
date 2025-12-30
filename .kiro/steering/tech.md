# Tech Stack

## Framework
- **Nuxt 4** - Vue 3 meta-framework with SSR/SSG support
- **Vue 3** - Composition API with `<script setup>` syntax
- **TypeScript** - Strict mode enabled

## Backend & Database
- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Stripe** - Payment processing

## Styling
- **Tailwind CSS 3** - Utility-first CSS with custom configuration
- **shadcn-vue** - Radix Vue-based UI components
- **class-variance-authority (CVA)** - Component variant management
- **tailwindcss-animate** - Animation utilities

## State Management
- **Pinia** - Vue store with persistence plugin
- **VueUse** - Composition utilities

## 3D & Graphics
- **Three.js** - 3D rendering
- **TresJS** - Vue Three.js integration
- **Fabric.js** - Canvas-based product customization

## Key Libraries
- `lucide-vue-next` - Icons
- `radix-vue` - Headless UI primitives
- `zod` + `vee-validate` - Form validation
- `date-fns` - Date formatting
- `embla-carousel-vue` - Carousels
- `vue-sonner` - Toast notifications

## Common Commands

```bash
# Install dependencies
npm install

# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate

# Prepare Nuxt (run after install)
npm run postinstall
```

## Environment Variables
Required in `.env`:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
- `STRIPE_SECRET_KEY` - Stripe secret key (server-side)
- `STRIPE_PUBLIC_KEY` - Stripe publishable key (client-side)
- `SITE_URL` - Production site URL
