import {
  OrderItem,
  createInvoiceApplication,
  findInvoiceByOrderId,
  getOrderById,
} from '../../services/mock'

const app = getApp<IAppOption>()

Page({
  data: {
    order: null as OrderItem | null,
    title: '',
    email: '',
    note: '',
    invoiceType: '电子普通发票',
    invoiceTypes: ['电子普通发票', '个人普通发票'],
    notices: [
      '发票金额以订单实付金额为准，优惠抵扣部分不再重复开具。',
      '提交申请后可在发票记录页查看处理进度与附件状态。',
    ],
  },

  onLoad(options: Record<string, string | undefined>) {
    const order = getOrderById(options.orderId || '')
    const email = app.globalData.echargeUser?.email || 'user@echarge.com'
    this.setData({
      order,
      title: '个人',
      email,
      note: '电子普通发票',
    })
  },

  selectType(e: WechatMiniprogram.CustomEvent) {
    const { value } = e.currentTarget.dataset as { value: string }
    this.setData({
      invoiceType: value,
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
      wx.showToast({ title: '请填写开票信息', icon: 'none' })
      return
    }

    const existing = findInvoiceByOrderId(order.id)
    if (existing) {
      wx.showToast({ title: '该订单已提交开票申请', icon: 'none' })
      wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
      return
    }

    createInvoiceApplication({
      orderId: order.id,
      title,
      email,
      note: `${this.data.invoiceType} · ${this.data.note.trim()}`,
    })

    wx.showToast({ title: '发票申请已提交', icon: 'success' })
    setTimeout(() => {
      wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
    }, 900)
  },
})
