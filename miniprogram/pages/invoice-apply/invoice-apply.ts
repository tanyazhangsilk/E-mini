import {
  createInvoiceApplication,
  findInvoiceByOrderId,
  getOrderById,
  OrderItem,
} from '../../services/mock'

const app = getApp<IAppOption>()

Page({
  data: {
    order: null as OrderItem | null,
    title: '',
    email: '',
    note: '',
  },

  onLoad(options: Record<string, string | undefined>) {
    const order = getOrderById(options.orderId || '')
    const email = app.globalData.echargeUser?.email || 'demo@echarge.com'
    this.setData({
      order,
      title: '个人',
      email,
      note: '电子普通发票',
    })
  },

  onTitleInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ title: e.detail.value })
  },

  onEmailInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ email: e.detail.value })
  },

  onNoteInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ note: e.detail.value })
  },

  submitInvoice() {
    const order = this.data.order
    const title = this.data.title.trim()
    const email = this.data.email.trim()

    if (!order) {
      wx.showToast({ title: '未找到关联订单', icon: 'none' })
      return
    }

    if (!title || !email) {
      wx.showToast({ title: '请填写发票信息', icon: 'none' })
      return
    }

    const existing = findInvoiceByOrderId(order.id)
    if (existing) {
      wx.showToast({ title: '该订单已提交发票申请', icon: 'none' })
      wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
      return
    }

    createInvoiceApplication({
      orderId: order.id,
      title,
      email,
      note: this.data.note.trim(),
    })

    wx.showToast({ title: '申请已提交', icon: 'success' })
    setTimeout(() => {
      wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
    }, 1000)
  },
})
