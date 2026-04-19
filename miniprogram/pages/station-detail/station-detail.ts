import { getStationById, StationItem } from '../../services/mock'

Page({
  data: {
    station: null as StationItem | null,
  },

  onLoad(options: Record<string, string | undefined>) {
    const station = getStationById(options.id || 'station-001')
    this.setData({ station })
  },

  goNavigate() {
    wx.showToast({ title: '导航功能已预留', icon: 'none' })
  },

  goCharge() {
    const station = this.data.station
    if (!station) {
      return
    }
    wx.setStorageSync('echarge_scan_context', {
      stationId: station.id,
      pileNo: station.piles[0].id,
    })
    wx.switchTab({ url: '/pages/scan/scan' })
  },
})
