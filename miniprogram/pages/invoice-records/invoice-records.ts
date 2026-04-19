import { getInvoices, InvoiceRecord } from '../../services/mock'

Page({
  data: {
    records: [] as InvoiceRecord[],
  },

  onShow() {
    this.setData({
      records: getInvoices(),
    })
  },

  viewAttachment(e: WechatMiniprogram.CustomEvent) {
    const { name, status } = e.currentTarget.dataset as { name: string; status: string }
    wx.showModal({
      title: '发票附件信息',
      content: `${status}\n附件：${name}`,
      showCancel: false,
    })
  },
})
