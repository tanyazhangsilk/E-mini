import {
  OrderItem,
  findInvoiceByOrderId,
  getChargingSession,
  getOrders,
} from '../../services/mock'

type TabKey = 'all' | 'charging' | 'completed' | 'abnormal'

function filterOrders(orders: OrderItem[], tab: TabKey) {
  if (tab === 'all') {
    return orders
  }
  return orders.filter(item => item.status === tab)
}

Page({
  data: {
    currentTab: 'all' as TabKey,
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'charging', label: '充电中' },
      { key: 'completed', label: '已完成' },
      { key: 'abnormal', label: '异常' },
    ],
    orders: [] as OrderItem[],
    displayOrders: [] as OrderItem[],
  },

  onShow() {
    const orders = getOrders()
    this.setData({
      orders,
      displayOrders: filterOrders(orders, this.data.currentTab),
    })
  },

  switchTab(e: WechatMiniprogram.CustomEvent) {
    const { key } = e.currentTarget.dataset as { key: TabKey }
    this.setData({
      currentTab: key,
      displayOrders: filterOrders(this.data.orders, key),
    })
  },

  onOrderTap(e: WechatMiniprogram.CustomEvent) {
    const { id, status } = e.currentTarget.dataset as { id: string; status: string }
    const session = getChargingSession()

    if (status === 'charging' && session && session.orderId === id) {
      wx.navigateTo({ url: `/pages/charging-monitor/charging-monitor?orderId=${id}` })
      return
    }

    wx.navigateTo({ url: `/pages/charging-result/charging-result?orderId=${id}` })
  },

  applyInvoice(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset as { id: string }
    const existing = findInvoiceByOrderId(id)

    if (existing) {
      wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
      return
    }

    wx.navigateTo({ url: `/pages/invoice-apply/invoice-apply?orderId=${id}` })
  },
})
