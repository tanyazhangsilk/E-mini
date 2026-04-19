import { StationItem, getStationById } from '../../services/mock'

Page({
  data: {
    station: null as StationItem | null,
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      station: getStationById(options.id || 'station-001'),
    })
  },

  toggleFavorite() {
    const station = this.data.station
    if (!station) {
      return
    }
    this.setData({
      station: {
        ...station,
        favorite: !station.favorite,
      },
    })
  },

  goNavigate() {
    wx.showToast({ title: '已唤起路线规划', icon: 'none' })
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
