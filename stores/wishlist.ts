import { defineStore } from 'pinia'
import type { Product, WishlistItem } from '~/types'

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const items = ref<WishlistItem[]>([])

  // Computed
  const totalItems = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)
  
  const productIds = computed(() => 
    items.value.map(item => item.product.id)
  )

  // Actions
  const addItem = (product: Product) => {
    const exists = items.value.some(item => item.product.id === product.id)
    
    if (!exists) {
      items.value.push({
        product,
        addedAt: new Date().toISOString(),
      })
    }
  }

  const removeItem = (productId: string) => {
    const index = items.value.findIndex(item => item.product.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const toggleItem = (product: Product) => {
    const exists = hasItem(product.id)
    if (exists) {
      removeItem(product.id)
    } else {
      addItem(product)
    }
  }

  const hasItem = (productId: string): boolean => {
    return items.value.some(item => item.product.id === productId)
  }

  const clearWishlist = () => {
    items.value = []
  }

  const moveToCart = (productId: string) => {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      const cartStore = useCartStore()
      cartStore.addItem(item.product, 1)
      removeItem(productId)
    }
  }

  const moveAllToCart = () => {
    const cartStore = useCartStore()
    items.value.forEach(item => {
      cartStore.addItem(item.product, 1)
    })
    clearWishlist()
  }

  return {
    // State
    items,
    
    // Computed
    totalItems,
    isEmpty,
    productIds,
    
    // Actions
    addItem,
    removeItem,
    toggleItem,
    hasItem,
    clearWishlist,
    moveToCart,
    moveAllToCart,
  }
}, {
  persist: true,
})


