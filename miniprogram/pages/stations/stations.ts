import { STATIONS, ChargingStation } from '../../utils/data'

Page({
  data: {
    keyword: '',
    filterIdle: false,
    stations: STATIONS,
    displayStations: STATIONS as ChargingStation[],
  },

  onLoad() {
    this.filterStations()
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 1 })
      }
    }
  },

  onSearchInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ keyword: e.detail.value })
    this.filterStations()
  },

  onSearch() {
    this.filterStations()
  },

  toggleFilter() {
    this.setData({ filterIdle: !this.data.filterIdle })
    this.filterStations()
  },

  filterStations() {
    const { keyword, filterIdle, stations } = this.data
    let list = stations
    if (keyword) {
      const k = keyword.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(k) || s.address.toLowerCase().includes(k)
      )
    }
    if (filterIdle) {
      list = list.filter(s => s.available > 0)
    }
    this.setData({ displayStations: list })
  },

  onStationTap(e: WechatMiniprogram.CustomEvent) {
    wx.showToast({ title: '电站详情开发中', icon: 'none' })
  },
})
