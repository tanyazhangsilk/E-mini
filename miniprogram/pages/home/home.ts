import { STATIONS } from '../../utils/data'

const app = getApp<IAppOption>()

Page({
  data: {
    nickname: '用户',
    balance: '0.00',
    stations: STATIONS,
  },

  onLoad() {
    this.refreshUser()
  },

  onShow() {
    this.refreshUser()
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 0 })
      }
    }
  },

  refreshUser() {
    const user = app.globalData.echargeUser
    const balance = app.globalData.balance
    this.setData({
      nickname: (user && user.nickname) || '用户',
      balance: balance.toFixed(2),
    })
  },

  goSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  goScan() {
    wx.switchTab({ url: '/pages/scan/scan' })
  },

  goStations() {
    wx.switchTab({ url: '/pages/stations/stations' })
  },

  goWallet() {
    wx.switchTab({ url: '/pages/wallet/wallet' })
  },

  onStationTap(_e: WechatMiniprogram.CustomEvent) {
    wx.showToast({ title: '电站详情开发中', icon: 'none' })
  },
})
