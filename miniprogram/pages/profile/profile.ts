import { getInvoices, getOrders } from '../../services/mock'
import { setStoredUser } from '../../utils/storage'

const app = getApp<IAppOption>()

Page({
  data: {
    nickname: '车主用户',
    email: 'user@echarge.com',
    balance: '0.00',
    level: '银卡车主',
    status: '账户状态正常',
    orderCount: 0,
    invoiceCount: 0,
    coupons: 3,
    quickServices: [
      { key: 'orders', title: '我的订单', desc: '查看充电记录' },
      { key: 'invoices', title: '发票记录', desc: '管理开票申请' },
      { key: 'wallet', title: '钱包', desc: '查看余额明细' },
      { key: 'coupons', title: '优惠券', desc: '管理优惠权益' },
    ],
    menuItems: [
      { key: 'messages', title: '消息中心', desc: '活动消息与订单通知' },
      { key: 'settings', title: '设置', desc: '账户与偏好配置' },
      { key: 'about', title: '关于平台', desc: '查看平台服务说明' },
    ],
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

  handleQuickService(e: WechatMiniprogram.CustomEvent) {
    const { key } = e.currentTarget.dataset as { key: string }
    if (key === 'orders') {
      wx.navigateTo({ url: '/pages/orders/orders' })
      return
    }
    if (key === 'invoices') {
      wx.navigateTo({ url: '/pages/invoice-records/invoice-records' })
      return
    }
    if (key === 'wallet') {
      wx.switchTab({ url: '/pages/wallet/wallet' })
      return
    }
    wx.showModal({
      title: '优惠券中心',
      content: '当前账户可用优惠券 3 张，支持在充电结算页自动抵扣。',
      showCancel: false,
    })
  },

  handleMenu(e: WechatMiniprogram.CustomEvent) {
    const { key } = e.currentTarget.dataset as { key: string }
    if (key === 'messages') {
      wx.showToast({ title: '当前暂无新消息', icon: 'none' })
      return
    }
    if (key === 'settings') {
      wx.showToast({ title: '设置中心已准备完成', icon: 'none' })
      return
    }
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
