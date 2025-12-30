# Project Structure

```
├── app/                    # Nuxt app entry
│   └── app.vue            # Root component
├── assets/
│   └── css/main.css       # Global styles, Tailwind config, CSS variables
├── components/
│   ├── 3d/                # Three.js/TresJS 3D components
│   ├── admin/             # Admin dashboard components
│   ├── animations/        # Animation wrapper components
│   ├── auth/              # Authentication components
│   ├── home/              # Homepage-specific components
│   ├── layout/            # Header, footer, navigation
│   ├── products/          # Product cards, customizer
│   ├── theme/             # Theme customization
│   └── ui/                # shadcn-vue base components
├── composables/           # Vue composables (useProducts, useOrders)
├── layouts/               # Nuxt layouts
├── lib/
│   └── utils.ts           # Utility functions (cn, formatPrice, formatDate)
├── middleware/            # Route middleware (auth, admin)
├── pages/                 # File-based routing
│   ├── admin/             # Admin pages (SSR disabled)
│   ├── checkout/          # Checkout flow (SSR disabled)
│   ├── legal/             # Terms, privacy pages
│   └── products/          # Product listing and detail ([id].vue)
├── plugins/               # Nuxt plugins
├── public/                # Static assets
├── server/api/            # Nitro API routes
├── stores/                # Pinia stores (auth, cart, theme, wishlist)
└── types/
    └── index.ts           # TypeScript type definitions
```

## Conventions

### Components
- UI components in `components/ui/` follow shadcn-vue patterns
- Use `<script setup lang="ts">` syntax
- Props defined with `defineProps<T>()`
- Use `cn()` utility for conditional class merging

### Composables
- Prefix with `use` (e.g., `useProducts`)
- Return object with methods and reactive state
- Handle Supabase queries internally

### Stores
- Use Pinia Composition API style (`defineStore` with setup function)
- Enable persistence where needed via `persist: true`
- Export computed getters and action methods

### Pages
- Use `useAsyncData` for data fetching
- Set SEO meta with `useSeoMeta`
- Admin/checkout pages have SSR disabled via `routeRules`

### Styling
- HSL CSS variables for theming (`hsl(var(--primary))`)
- Glassmorphism effects via `.glass-card` classes
- Animation utilities: `animate-fade-up`, `animation-delay-*`
- Dark mode via `.dark` class on root

### Types
- All shared types in `types/index.ts`
- Supabase types aligned with database schema
- Use strict TypeScript
