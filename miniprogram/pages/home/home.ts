import { getPromotions, getRecommendedStations } from '../../services/mock'

const app = getApp<IAppOption>()

Page({
  data: {
    nickname: '演示用户',
    balance: '0.00',
    stations: getRecommendedStations(),
    promotions: getPromotions(),
    quickActions: [
      { id: 'scan', title: '扫码充电', desc: '快速开始充电', icon: '充', type: 'scan' },
      { id: 'stations', title: '附近电站', desc: '查找空闲站点', icon: '站', type: 'stations' },
      { id: 'wallet', title: '我的钱包', desc: '充值与交易记录', icon: '钱', type: 'wallet' },
      { id: 'orders', title: '我的订单', desc: '查看充电记录', icon: '单', type: 'orders' },
    ],
  },

  onShow() {
    this.refreshPage()
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 0 })
      }
    }
  },

  refreshPage() {
    const nickname = app.globalData.echargeUser?.nickname || '演示用户'
    const balance = app.globalData.balance.toFixed(2)
    this.setData({
      nickname,
      balance,
      stations: getRecommendedStations(),
      promotions: getPromotions(),
    })
  },

  onActionTap(e: WechatMiniprogram.CustomEvent) {
    const { type } = e.currentTarget.dataset as { type: string }

    switch (type) {
      case 'scan':
        wx.switchTab({ url: '/pages/scan/scan' })
        break
      case 'stations':
        wx.switchTab({ url: '/pages/stations/stations' })
        break
      case 'wallet':
        wx.switchTab({ url: '/pages/wallet/wallet' })
        break
      case 'orders':
        wx.navigateTo({ url: '/pages/orders/orders' })
        break
      default:
        break
    }
  },

  onStationTap(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset as { id: string }
    wx.navigateTo({ url: `/pages/station-detail/station-detail?id=${id}` })
  },

  onPromotionTap() {
    wx.showToast({ title: '优惠活动已加入演示区', icon: 'none' })
  },
})
