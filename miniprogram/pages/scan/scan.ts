import { createChargingSession, getStationById } from '../../services/mock'

type ScanStatus = 'idle' | 'recognizing' | 'ready'

Page({
  data: {
    stationId: 'station-001',
    stationName: '天府软件园综合充电站',
    pileNo: '',
    scanStatus: 'idle' as ScanStatus,
    scanStatusText: '待识别',
    scanStatusClass: 'pending',
    quickPiles: ['TF-02', 'HQ-12', 'DK-21'],
    recentPiles: [
      { station: '天府软件园综合充电站', pileNo: 'TF-02' },
      { station: '东客站出行服务充电站', pileNo: 'DK-21' },
    ],
    notices: [
      '请确认车辆已停稳并连接充电枪后再开始充电。',
      '扫码失败时可手动输入桩号或选择最近使用记录。',
    ],
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
    const nextStatus = e.detail.value ? 'ready' : 'idle'
    this.updateScanStatus(nextStatus)
    this.setData({
      pileNo: e.detail.value,
    })
  },

  fillQuickPile(e: WechatMiniprogram.CustomEvent) {
    const { value } = e.currentTarget.dataset as { value: string }
    this.updateScanStatus('ready')
    this.setData({
      pileNo: value,
    })
  },

  fillRecentPile(e: WechatMiniprogram.CustomEvent) {
    const { value } = e.currentTarget.dataset as { value: string }
    this.updateScanStatus('ready')
    this.setData({
      pileNo: value,
    })
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
    this.updateScanStatus('recognizing')
    setTimeout(() => {
      const pileNo = this.data.pileNo.trim() || 'TF-02'
      this.updateScanStatus('ready')
      this.setData({
        pileNo,
      })
      this.startCharging(pileNo)
    }, 350)
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
    this.updateScanStatus(pileNo ? 'ready' : 'idle')

    if (cachedContext.stationId) {
      wx.removeStorageSync('echarge_scan_context')
    }
  },

  startCharging(pileNo: string) {
    const session = createChargingSession(this.data.stationId, pileNo)
    wx.navigateTo({ url: `/pages/charging-monitor/charging-monitor?orderId=${session.orderId}` })
  },

  updateScanStatus(status: ScanStatus) {
    const config =
      status === 'idle'
        ? { scanStatusText: '待识别', scanStatusClass: 'pending' }
        : status === 'recognizing'
          ? { scanStatusText: '识别中', scanStatusClass: 'busy' }
          : { scanStatusText: '已识别', scanStatusClass: 'completed' }

    this.setData({
      scanStatus: status,
      scanStatusText: config.scanStatusText,
      scanStatusClass: config.scanStatusClass,
    })
  },
})
