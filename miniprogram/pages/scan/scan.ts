import {
  buildChargingSessionFromOrder,
  getChargerBySn,
  startOrder,
  withApiFallback,
} from '../../services/api'
import { createChargingSession, getStationById } from '../../services/mock'

type ScanStatus = 'idle' | 'recognizing' | 'ready'

function extractSnCode(value: string) {
  const input = value.trim()
  if (!input) {
    return ''
  }

  const matched = input.match(/sn_code=([^&]+)/i)
  if (matched?.[1]) {
    return decodeURIComponent(matched[1])
  }

  const segments = input.split(/[/?#=&\s]+/).filter(Boolean)
  return segments[segments.length - 1] || input
}

Page({
  data: {
    stationId: 'station-001',
    stationName: 'Station',
    pileNo: '',
    scanStatus: 'idle' as ScanStatus,
    scanStatusText: 'Idle',
    scanStatusClass: 'pending',
    quickPiles: ['TF-02', 'HQ-12', 'DK-21'],
    recentPiles: [
      { station: 'Station A', pileNo: 'TF-02' },
      { station: 'Station B', pileNo: 'DK-21' },
    ],
    notices: [
      'Make sure the vehicle and charger are connected before starting.',
      'If scanning fails, input the SN code manually or use a recent record.',
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
    const nextValue = e.detail.value.trim()
    const nextStatus = nextValue ? 'ready' : 'idle'
    this.updateScanStatus(nextStatus)
    this.setData({
      pileNo: nextValue,
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
    const snCode = extractSnCode(this.data.pileNo)
    if (!snCode) {
      wx.showToast({ title: 'Enter SN code', icon: 'none' })
      return
    }
    void this.beginChargeFlow(snCode)
  },

  onQuickScan() {
    this.updateScanStatus('recognizing')
    wx.scanCode({
      success: ({ result }) => {
        const snCode = extractSnCode(result || '')
        this.updateScanStatus(snCode ? 'ready' : 'idle')
        this.setData({
          pileNo: snCode,
        })

        if (!snCode) {
          wx.showToast({ title: 'SN code not found', icon: 'none' })
          return
        }

        void this.beginChargeFlow(snCode)
      },
      fail: () => {
        this.updateScanStatus(this.data.pileNo ? 'ready' : 'idle')
        wx.showToast({ title: 'Scan cancelled', icon: 'none' })
      },
    })
  },

  restoreScanContext(options: Record<string, string | undefined>) {
    const cachedContext = (wx.getStorageSync('echarge_scan_context') || {}) as {
      stationId?: string
      pileNo?: string
      snCode?: string
    }
    const stationId = options.stationId || cachedContext.stationId || 'station-001'
    const pileNo = options.pileNo || cachedContext.snCode || cachedContext.pileNo || this.data.pileNo
    const station = getStationById(stationId)

    this.setData({
      stationId: station.id,
      stationName: station.name,
      pileNo: pileNo || '',
    })
    this.updateScanStatus(pileNo ? 'ready' : 'idle')

    if (cachedContext.stationId || cachedContext.pileNo || cachedContext.snCode) {
      wx.removeStorageSync('echarge_scan_context')
    }
  },

  async beginChargeFlow(snCode: string) {
    wx.showLoading({ title: 'Connecting' })

    const charger = await withApiFallback(
      'scan:getChargerBySn',
      () => getChargerBySn(snCode),
      () => ({
        id: snCode,
        stationId: this.data.stationId,
        stationName: this.data.stationName,
        pileNo: snCode,
        snCode,
        gunNo: 'Gun 1',
        available: true,
        status: 'idle' as 'idle',
        statusText: 'Available',
        power: '--',
        connector: 'GBT DC',
      })
    )

    if (!charger.available) {
      wx.hideLoading()
      wx.showToast({
        title: charger.statusText || 'Pile unavailable',
        icon: 'none',
      })
      return
    }

    this.setData({
      stationId: charger.stationId || this.data.stationId,
      stationName: charger.stationName || this.data.stationName,
      pileNo: charger.snCode || charger.pileNo || snCode,
    })

    try {
      const order = await startOrder({
        sn_code: charger.snCode || snCode,
        station_id: charger.stationId || this.data.stationId,
      })
      wx.setStorageSync('echarge_charging_session', buildChargingSessionFromOrder(order))
      wx.hideLoading()
      wx.navigateTo({ url: `/pages/charging-monitor/charging-monitor?orderId=${order.id}` })
    } catch (error) {
      console.warn('[scan] startOrder failed, fallback to mock session', error)
      const session = createChargingSession(this.data.stationId, charger.pileNo || snCode)
      wx.hideLoading()
      wx.navigateTo({ url: `/pages/charging-monitor/charging-monitor?orderId=${session.orderId}` })
    }
  },

  updateScanStatus(status: ScanStatus) {
    const config =
      status === 'idle'
        ? { scanStatusText: 'Idle', scanStatusClass: 'pending' }
        : status === 'recognizing'
          ? { scanStatusText: 'Scanning', scanStatusClass: 'busy' }
          : { scanStatusText: 'Ready', scanStatusClass: 'completed' }

    this.setData({
      scanStatus: status,
      scanStatusText: config.scanStatusText,
      scanStatusClass: config.scanStatusClass,
    })
  },
})
