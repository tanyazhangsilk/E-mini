Page({
  data: {
    pileNo: '',
  },

  onLoad() {
    // 可在此调用 wx.scanCode，需真机
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 2 })
      }
    }
  },

  onPileInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ pileNo: e.detail.value })
  },

  onSearchPile() {
    const { pileNo } = this.data
    if (!pileNo.trim()) {
      wx.showToast({ title: '请输入桩号', icon: 'none' })
      return
    }
    wx.showToast({ title: '查找充电桩: ' + pileNo, icon: 'none' })
    // TODO: 调用接口查找充电桩，跳转充电详情
  },
})
