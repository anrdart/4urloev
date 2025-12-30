import type { Order, OrderItem } from '~/types'
import { generateOrderNumber } from '~/lib/utils'

export const useOrders = () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  const createOrder = async (orderData: {
    shippingAddress: Record<string, unknown>
    billingAddress: Record<string, unknown>
    items: {
      productId: string
      productName: string
      productDescription?: string
      quantity: number
      unitPrice: number
      customizations?: Record<string, unknown>
    }[]
    subtotal: number
    tax?: number
    shipping?: number
    total: number
    notes?: string
    shippingInfo?: {
      provinceId?: string
      provinceName?: string
      cityId?: string
      cityName?: string
      courierCode?: string
      courierService?: string
      shippingCost?: number
      estimatedDelivery?: string
    }
  }) => {
    const orderNumber = generateOrderNumber()

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: authStore.user?.id || null,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress,
        subtotal: orderData.subtotal,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total,
        notes: orderData.notes,
        province_id: orderData.shippingInfo?.provinceId,
        province_name: orderData.shippingInfo?.provinceName,
        city_id: orderData.shippingInfo?.cityId,
        city_name: orderData.shippingInfo?.cityName,
        courier_code: orderData.shippingInfo?.courierCode,
        courier_service: orderData.shippingInfo?.courierService,
        shipping_cost: orderData.shippingInfo?.shippingCost,
        estimated_delivery: orderData.shippingInfo?.estimatedDelivery,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_description: item.productDescription,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice,
      customizations: item.customizations,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order as Order
  }

  const getOrders = async (userId?: string) => {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Order[]
  }

  const getOrderById = async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data as Order
  }

  const getOrderByNumber = async (orderNumber: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single()

    if (error) throw error
    return data as Order
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data as Order
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status'], paymentIntentId?: string) => {
    const updateData: Record<string, unknown> = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    }

    if (paymentIntentId) {
      updateData.payment_intent_id = paymentIntentId
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data as Order
  }

  const getUserOrders = async () => {
    if (!authStore.user) {
      throw new Error('User not authenticated')
    }

    return getOrders(authStore.user.id)
  }

  return {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByNumber,
    updateOrderStatus,
    updatePaymentStatus,
    getUserOrders,
  }
}


