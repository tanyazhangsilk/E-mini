import { getInvoices, getOrders } from '../../services/mock'
import { setStoredUser } from '../../utils/storage'

const app = getApp<IAppOption>()

Page({
  data: {
    nickname: '演示用户',
    email: 'demo@echarge.com',
    balance: '0.00',
    orderCount: 0,
    invoiceCount: 0,
    coupons: 3,
  },

  onShow() {
    this.refreshPage()
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 4 })
      }
    }
  },

  refreshPage() {
    this.setData({
      nickname: app.globalData.echargeUser?.nickname || '演示用户',
      email: app.globalData.echargeUser?.email || 'demo@echarge.com',
      balance: app.globalData.balance.toFixed(2),
      orderCount: getOrders().length,
      invoiceCount: getInvoices().length,
    })
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  goInvoices() {
    wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
  },

  goWallet() {
    wx.switchTab({ url: '/pages/wallet/wallet' })
  },

  showCoupons() {
    wx.showModal({
      title: '优惠活动 / 优惠券',
      content: '当前可用优惠券 3 张，首页已展示活动卡片，可用于论文截图说明用户优惠模块。',
      showCancel: false,
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于平台',
      content: 'E-Charge 聚合充电平台聚焦用户找站、扫码充电、钱包支付、订单发票等核心业务流程。',
      showCancel: false,
    })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前演示账号吗？',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        setStoredUser(null)
        app.globalData.echargeUser = null
        wx.reLaunch({ url: '/pages/login/login' })
      },
    })
  },
})
