import { defineStore } from 'pinia'
import type { CartItem, Product, Json } from '~/types'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])

  // Computed
  const totalItems = computed(() => 
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  const totalPrice = computed(() => 
    items.value.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  const totalWeight = computed(() =>
    items.value.reduce((total, item) => {
      const weight = item.product.weight || 0
      return total + (weight * item.quantity)
    }, 0)
  )

  // Actions
  const addItem = (product: Product, quantity = 1, customizations?: Json | null) => {
    const existingItem = items.value.find(
      (item) => item.product.id === product.id
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        product,
        quantity,
        customizations,
      })
    }
  }

  const removeItem = (productId: string) => {
    const index = items.value.findIndex((item) => item.product.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const incrementQuantity = (productId: string) => {
    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      item.quantity++
    }
  }

  const decrementQuantity = (productId: string) => {
    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        removeItem(productId)
      }
    }
  }

  const updateCustomizations = (productId: string, customizations: Json | null) => {
    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      item.customizations = customizations
    }
  }

  const clearCart = () => {
    items.value = []
  }

  const getItemQuantity = (productId: string): number => {
    const item = items.value.find((item) => item.product.id === productId)
    return item?.quantity || 0
  }

  const hasItem = (productId: string): boolean => {
    return items.value.some((item) => item.product.id === productId)
  }

  return {
    // State
    items,
    
    // Computed
    totalItems,
    totalPrice,
    isEmpty,
    totalWeight,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    updateCustomizations,
    clearCart,
    getItemQuantity,
    hasItem,
  }
}, {
  persist: true,
})


