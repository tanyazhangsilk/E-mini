import { getLatestCompletedOrder, getOrderById, OrderItem } from '../../services/mock'

Page({
  data: {
    order: null as OrderItem | null,
  },

  onLoad(options: Record<string, string | undefined>) {
    const order = options.orderId ? getOrderById(options.orderId) : getLatestCompletedOrder()
    this.setData({ order })
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },
})
