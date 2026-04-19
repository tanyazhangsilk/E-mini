import { createChargingSession, getStationById } from '../../services/mock'

Page({
  data: {
    stationId: 'station-001',
    stationName: '天府软件园综合充电站',
    pileNo: '',
    quickPiles: ['TF-02', 'HQ-12', 'DK-21'],
  },

  onLoad(options: Record<string, string | undefined>) {
    this.restoreScanContext(options)
  },

  onShow() {
    this.restoreScanContext({})
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 2 })
      }
    }
  },

  onPileInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ pileNo: e.detail.value })
  },

  fillQuickPile(e: WechatMiniprogram.CustomEvent) {
    const { value } = e.currentTarget.dataset as { value: string }
    this.setData({ pileNo: value })
  },

  onSearchPile() {
    const pileNo = this.data.pileNo.trim()
    if (!pileNo) {
      wx.showToast({ title: '请输入充电桩编号', icon: 'none' })
      return
    }
    this.startCharging(pileNo)
  },

  onQuickScan() {
    const pileNo = this.data.pileNo.trim() || 'TF-02'
    this.startCharging(pileNo)
  },

  restoreScanContext(options: Record<string, string | undefined>) {
    const cachedContext = (wx.getStorageSync('echarge_scan_context') || {}) as {
      stationId?: string
      pileNo?: string
    }
    const stationId = options.stationId || cachedContext.stationId || 'station-001'
    const pileNo = options.pileNo || cachedContext.pileNo || this.data.pileNo
    const station = getStationById(stationId)

    this.setData({
      stationId: station.id,
      stationName: station.name,
      pileNo: pileNo || '',
    })

    if (cachedContext.stationId) {
      wx.removeStorageSync('echarge_scan_context')
    }
  },

  startCharging(pileNo: string) {
    const session = createChargingSession(this.data.stationId, pileNo)
    wx.navigateTo({ url: `/pages/charging-monitor/charging-monitor?orderId=${session.orderId}` })
  },
})
