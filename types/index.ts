import type { User, Session } from '@supabase/supabase-js'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  customization_options: Json | null
  stock: number | null
  featured: boolean | null
  is_active?: boolean | null
  stripe_price_id?: string | null
  weight?: number | null
  created_at: string
  updated_at: string
  product_images?: ProductImage[]
  category?: Category | null
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface ProductBundle {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  discount_percentage: number | null
  image_url: string | null
  theme: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
  bundle_items?: BundleItem[]
}

export interface BundleItem {
  id: string
  bundle_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface Theme {
  id: string
  user_id: string
  name: string
  is_active: boolean
  primary_color: string
  secondary_color: string
  accent_color: string
  background_gradient: string[]
  glassmorphism_intensity: number
  pointer_style: string
  custom_css: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null
  order_number: string
  status: OrderStatus
  shipping_address: Json
  billing_address: Json
  subtotal: number
  tax: number
  shipping: number
  total: number
  payment_status: PaymentStatus
  payment_intent_id: string | null
  notes: string | null
  tracking_number: string | null
  courier_code: string | null
  courier_service: string | null
  shipping_cost: number | null
  weight: number | null
  province_id: string | null
  province_name: string | null
  city_id: string | null
  city_name: string | null
  subdistrict: string | null
  postal_code: string | null
  estimated_delivery: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_description: string | null
  customizations: Json | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface EventReminder {
  id: string
  user_id: string | null
  email: string
  event_name: string
  event_date: string
  remind_days_before: number
  product_id: string | null
  bundle_id: string | null
  notes: string | null
  is_sent: boolean | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  customizations?: Json | null
}

export interface WishlistItem {
  product: Product
  addedAt: string
}

export type AppRole = 'user' | 'admin' | 'moderator'

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Form types
export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  province: string
  city: string
  district: string
  postalCode: string
}

export interface BillingAddress extends ShippingAddress {
  email: string
}


