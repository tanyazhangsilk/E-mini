import { getStations, StationItem } from '../../services/mock'

function filterStations(stations: StationItem[], keyword: string, onlyIdle: boolean) {
  const lowerKeyword = keyword.trim().toLowerCase()

  return stations.filter(item => {
    const matchedKeyword =
      !lowerKeyword ||
      item.name.toLowerCase().includes(lowerKeyword) ||
      item.address.toLowerCase().includes(lowerKeyword) ||
      item.operator.toLowerCase().includes(lowerKeyword)

    const matchedFilter = !onlyIdle || item.available / item.total >= 0.4
    return matchedKeyword && matchedFilter
  })
}

Page({
  data: {
    keyword: '',
    onlyIdle: false,
    stations: [] as StationItem[],
    displayStations: [] as StationItem[],
  },

  onLoad() {
    const stations = getStations()
    this.setData({
      stations,
      displayStations: stations,
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 1 })
      }
    }
  },

  onSearchInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const keyword = e.detail.value
    this.setData({
      keyword,
      displayStations: filterStations(this.data.stations, keyword, this.data.onlyIdle),
    })
  },

  toggleFilter() {
    const onlyIdle = !this.data.onlyIdle
    this.setData({
      onlyIdle,
      displayStations: filterStations(this.data.stations, this.data.keyword, onlyIdle),
    })
  },

  clearKeyword() {
    this.setData({
      keyword: '',
      displayStations: filterStations(this.data.stations, '', this.data.onlyIdle),
    })
  },

  onStationTap(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset as { id: string }
    wx.navigateTo({ url: `/pages/station-detail/station-detail?id=${id}` })
  },
})
