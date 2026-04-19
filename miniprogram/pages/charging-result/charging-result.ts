import { OrderItem, findInvoiceByOrderId, getLatestCompletedOrder, getOrderById } from '../../services/mock'

Page({
  data: {
    order: null as OrderItem | null,
    invoiceReady: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const order = options.orderId ? getOrderById(options.orderId) : getLatestCompletedOrder()
    this.setData({
      order,
      invoiceReady: !!(order && findInvoiceByOrderId(order.id)),
    })
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  goInvoice() {
    const order = this.data.order
    if (!order) {
      return
    }

    if (this.data.invoiceReady) {
      wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
      return
    }

    wx.navigateTo({ url: `/pages/invoice-apply/invoice-apply?orderId=${order.id}` })
  },

  chargeAgain() {
    const order = this.data.order
    if (!order) {
      return
    }
    wx.setStorageSync('echarge_scan_context', {
      stationId: order.stationId,
      pileNo: order.pileNo,
    })
    wx.switchTab({ url: '/pages/scan/scan' })
  },
})
