import {
  OrderItem,
  PromotionCard,
  StationItem,
  getLatestCompletedOrder,
  getPromotions,
  getRecommendedStations,
} from '../../services/mock'

const app = getApp<IAppOption>()

Page({
  data: {
    nickname: '车主用户',
    balance: '0.00',
    stations: [] as StationItem[],
    promotions: [] as PromotionCard[],
    recentOrder: null as OrderItem | null,
    quickActions: [
      { id: 'scan', title: '扫码充电', desc: '快速连接充电设备', icon: '充', type: 'scan' },
      { id: 'stations', title: '附近电站', desc: '查看周边优质站点', icon: '站', type: 'stations' },
      { id: 'orders', title: '我的订单', desc: '管理充电订单记录', icon: '单', type: 'orders' },
      { id: 'wallet', title: '我的钱包', desc: '查看余额与交易明细', icon: '钱', type: 'wallet' },
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
    this.setData({
      nickname: app.globalData.echargeUser?.nickname || '车主用户',
      balance: app.globalData.balance.toFixed(2),
      stations: getRecommendedStations(),
      promotions: getPromotions(),
      recentOrder: getLatestCompletedOrder(),
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

  openRecentOrder() {
    const order = this.data.recentOrder
    if (!order) {
      return
    }
    wx.navigateTo({ url: `/pages/charging-result/charging-result?orderId=${order.id}` })
  },

  openCoupons() {
    wx.showModal({
      title: '优惠中心',
      content: '当前账户可用优惠券 3 张，支持在充电结算时自动抵扣。',
      showCancel: false,
    })
  },

  onPromotionTap() {
    wx.showToast({ title: '活动详情已同步', icon: 'none' })
  },
})
