import { getWalletRecords } from '../../services/mock'

const app = getApp<IAppOption>()

Page({
  data: {
    balance: '0.00',
    records: getWalletRecords(),
  },

  onShow() {
    this.refreshPage()
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 3 })
      }
    }
  },

  refreshPage() {
    this.setData({
      balance: app.globalData.balance.toFixed(2),
      records: getWalletRecords(),
    })
  },

  onRecharge() {
    wx.navigateTo({ url: '/pages/recharge/recharge' })
  },

  onRefresh() {
    this.refreshPage()
    wx.showToast({ title: '账户信息已更新', icon: 'none' })
  },
})
