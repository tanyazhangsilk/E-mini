import { getStationList, StationApiItem, StationListResult } from '../../api/station'
import { STATIONS, ChargingStation } from '../../utils/data'

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeStation(item: StationApiItem, index: number): ChargingStation {
  const total = Math.max(
    normalizeNumber(item.total ?? item.total_piles ?? item.totalCount, 0),
    1
  )
  const available = Math.min(
    normalizeNumber(
      item.available ?? item.available_count ?? item.idle_piles ?? item.idleCount,
      0
    ),
    total
  )

  return {
    id: String(item.id ?? item.station_id ?? item.stationId ?? index + 1),
    name: String(item.name ?? item.station_name ?? item.stationName ?? `Station ${index + 1}`),
    address: String(item.address ?? item.location ?? item.detail_address ?? 'Address pending'),
    operator: String(item.operator ?? item.operator_name ?? item.brand ?? item.provider ?? 'E-Charge'),
    available,
    total,
  }
}

function normalizeStationList(response?: StationApiItem[] | StationListResult | null) {
  if (Array.isArray(response)) {
    return response.map(normalizeStation)
  }

  const list = response?.list || response?.results || response?.items || []
  return Array.isArray(list) ? list.map(normalizeStation) : []
}

function getDisplayStations(
  stations: ChargingStation[],
  keyword: string,
  filterIdle: boolean
) {
  let list = stations

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    list = list.filter(
      station =>
        station.name.toLowerCase().includes(lowerKeyword) ||
        station.address.toLowerCase().includes(lowerKeyword)
    )
  }

  if (filterIdle) {
    list = list.filter(station => station.available > 0)
  }

  return list
}

Page({
  data: {
    keyword: '',
    filterIdle: false,
    loading: false,
    errorMessage: '',
    empty: false,
    usingMockData: false,
    stations: STATIONS as ChargingStation[],
    displayStations: STATIONS as ChargingStation[],
  },

  onLoad() {
    this.loadStations()
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
    const keyword = e.detail.value
    const displayStations = getDisplayStations(this.data.stations, keyword, this.data.filterIdle)

    this.setData({
      keyword,
      displayStations,
      empty: displayStations.length === 0,
    })
  },

  onSearch() {
    this.filterStations()
  },

  toggleFilter() {
    const filterIdle = !this.data.filterIdle
    const displayStations = getDisplayStations(this.data.stations, this.data.keyword, filterIdle)

    this.setData({
      filterIdle,
      displayStations,
      empty: displayStations.length === 0,
    })
  },

  loadStations() {
    this.setData({
      loading: true,
      errorMessage: '',
    })

    getStationList()
      .then(response => {
        const stations = normalizeStationList(response)
        const displayStations = getDisplayStations(
          stations,
          this.data.keyword,
          this.data.filterIdle
        )

        this.setData({
          stations,
          displayStations,
          loading: false,
          errorMessage: '',
          empty: displayStations.length === 0,
          usingMockData: false,
        })
      })
      .catch(error => {
        console.error('[stations] load station list failed, fallback to mock data', error)

        const fallbackStations = STATIONS
        const displayStations = getDisplayStations(
          fallbackStations,
          this.data.keyword,
          this.data.filterIdle
        )

        this.setData({
          stations: fallbackStations,
          displayStations,
          loading: false,
          errorMessage: 'Load failed, showing local demo data.',
          empty: displayStations.length === 0,
          usingMockData: true,
        })

        wx.showToast({
          title: 'Using demo data',
          icon: 'none',
        })
      })
  },

  filterStations() {
    const { keyword, filterIdle, stations } = this.data
    const displayStations = getDisplayStations(stations, keyword, filterIdle)

    this.setData({
      displayStations,
      empty: displayStations.length === 0,
    })
  },

  onStationTap(_e: WechatMiniprogram.CustomEvent) {
    wx.showToast({ title: 'Detail page pending', icon: 'none' })
  },
})
