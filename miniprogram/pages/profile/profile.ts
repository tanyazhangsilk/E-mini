import { getInvoices, getOrders } from '../../services/mock'
import { setStoredUser } from '../../utils/storage'

const app = getApp<IAppOption>()

Page({
  data: {
    nickname: '车主用户',
    email: 'user@echarge.com',
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
      nickname: app.globalData.echargeUser?.nickname || '车主用户',
      email: app.globalData.echargeUser?.email || 'user@echarge.com',
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
      content: '当前账户可用优惠券 3 张，可在充电下单与钱包支付场景中抵扣使用。',
      showCancel: false,
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于平台',
      content: 'E-Charge 聚焦车主找站、扫码充电、钱包支付、订单查询与发票服务等核心场景。',
      showCancel: false,
    })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前账户吗？',
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
