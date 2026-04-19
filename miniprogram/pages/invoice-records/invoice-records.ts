import { InvoiceRecord, getInvoices } from '../../services/mock'

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
      title: '发票文件信息',
      content: `${status}\n文件：${name}`,
      showCancel: false,
    })
  },
})
