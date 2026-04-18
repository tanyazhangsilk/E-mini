import { setStoredUser } from '../../utils/storage'

const app = getApp<IAppOption>()

Page({
  data: {
    nickname: '用户',
    email: '',
    balance: '0.00',
  },

  onLoad() {
    this.refreshUser()
  },

  onShow() {
    this.refreshUser()
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 4 })
      }
    }
  },

  refreshUser() {
    const user = app.globalData.echargeUser
    const balance = app.globalData.balance
    this.setData({
      nickname: (user && user.nickname) || '用户',
      email: (user && user.email) || '',
      balance: balance.toFixed(2),
    })
  },

  goWallet() {
    wx.switchTab({ url: '/pages/wallet/wallet' })
  },

  goChargingRecords() {
    wx.navigateTo({ url: '/pages/charging-records/charging-records' })
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          setStoredUser(null)
          app.globalData.echargeUser = null
          wx.reLaunch({ url: '/pages/login/login' })
        }
      },
    })
  },
})
