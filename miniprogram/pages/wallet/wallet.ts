import { WalletRecord, getWalletRecords } from '../../services/mock'

const app = getApp<IAppOption>()

type FilterKey = 'all' | 'recharge' | 'consume'

function filterRecords(records: WalletRecord[], filterKey: FilterKey) {
  if (filterKey === 'all') {
    return records
  }
  return records.filter(item => item.category === filterKey)
}

Page({
  data: {
    balance: '0.00',
    currentFilter: 'all' as FilterKey,
    filters: [
      { key: 'all', label: '全部' },
      { key: 'recharge', label: '充值' },
      { key: 'consume', label: '消费' },
    ],
    records: [] as WalletRecord[],
    displayRecords: [] as WalletRecord[],
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
    const records = getWalletRecords()
    this.setData({
      balance: app.globalData.balance.toFixed(2),
      records,
      displayRecords: filterRecords(records, this.data.currentFilter),
    })
  },

  onRecharge() {
    wx.navigateTo({ url: '/pages/recharge/recharge' })
  },

  onRefresh() {
    this.refreshPage()
    wx.showToast({ title: '账户信息已更新', icon: 'none' })
  },

  switchFilter(e: WechatMiniprogram.CustomEvent) {
    const { key } = e.currentTarget.dataset as { key: FilterKey }
    this.setData({
      currentFilter: key,
      displayRecords: filterRecords(this.data.records, key),
    })
  },

  openCoupons() {
    wx.showModal({
      title: '优惠券中心',
      content: '当前账户可用优惠券 3 张，支持在充电结算页自动抵扣。',
      showCancel: false,
    })
  },
})
