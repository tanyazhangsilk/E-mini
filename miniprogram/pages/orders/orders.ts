Page({
  data: {
    orders: [] as { id: string; orderNo: string; status: string; stationName: string; amount: string; time: string }[],
  },

  onLoad() {
    const orders = wx.getStorageSync('echarge_orders') || []
    this.setData({ orders })
  },
})
