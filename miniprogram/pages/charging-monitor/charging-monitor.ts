import {
  ChargingSession,
  completeChargingSession,
  createChargingSession,
  formatDuration,
  getChargingSession,
  updateChargingSessionSnapshot,
} from '../../services/mock'
import { getStoredBalance } from '../../utils/storage'

const app = getApp<IAppOption>()
let monitorTimer = 0

function buildDisplayState(session: ChargingSession) {
  return {
    orderId: session.orderId,
    orderNo: session.orderNo,
    stationId: session.stationId,
    stationName: session.stationName,
    pileNo: session.pileNo,
    gunNo: session.gunNo,
    startedAt: session.startedAt,
    durationMinutes: session.durationMinutes,
    durationText: formatDuration(session.durationMinutes),
    batteryText: `${session.currentBattery}%`,
    powerText: `${session.currentPower.toFixed(0)} kW`,
    feeText: session.currentFee.toFixed(2),
    energyText: `${session.energy.toFixed(1)} kWh`,
  }
}

Page({
  data: {
    orderId: '',
    orderNo: '',
    stationId: '',
    stationName: '',
    pileNo: '',
    gunNo: '',
    startedAt: '',
    durationMinutes: 0,
    durationText: '0 分钟',
    batteryText: '0%',
    powerText: '0 kW',
    feeText: '0.00',
    energyText: '0.0 kWh',
    statusText: '充电中',
  },

  onLoad(options: Record<string, string | undefined>) {
    const currentSession = getChargingSession()
    const matchedSession =
      currentSession && (!options.orderId || currentSession.orderId === options.orderId)
        ? currentSession
        : createChargingSession()

    this.setData(buildDisplayState(matchedSession))
    this.startMonitor()
  },

  onUnload() {
    if (monitorTimer) {
      clearInterval(monitorTimer)
      monitorTimer = 0
    }
  },

  startMonitor() {
    if (monitorTimer) {
      clearInterval(monitorTimer)
    }

    monitorTimer = setInterval(() => {
      const nextSession: ChargingSession = {
        orderId: this.data.orderId,
        orderNo: this.data.orderNo,
        stationId: this.data.stationId,
        stationName: this.data.stationName,
        pileNo: this.data.pileNo,
        gunNo: this.data.gunNo,
        startedAt: this.data.startedAt,
        durationMinutes: this.data.durationMinutes + 1,
        currentBattery: Math.min(Number(this.data.batteryText.replace('%', '')) + 2, 95),
        currentPower: Math.min(Number(this.data.powerText.replace(' kW', '')) + 1.2, 52),
        currentFee: Number((Number(this.data.feeText) + 1.36).toFixed(2)),
        energy: Number((Number(this.data.energyText.replace(' kWh', '')) + 1.1).toFixed(1)),
      }

      updateChargingSessionSnapshot(nextSession)
      this.setData(buildDisplayState(nextSession))
    }, 1000)
  },

  endCharging() {
    const currentSession: ChargingSession = {
      orderId: this.data.orderId,
      orderNo: this.data.orderNo,
      stationId: this.data.stationId,
      stationName: this.data.stationName,
      pileNo: this.data.pileNo,
      gunNo: this.data.gunNo,
      startedAt: this.data.startedAt,
      durationMinutes: this.data.durationMinutes,
      currentBattery: Number(this.data.batteryText.replace('%', '')),
      currentPower: Number(this.data.powerText.replace(' kW', '')),
      currentFee: Number(this.data.feeText),
      energy: Number(this.data.energyText.replace(' kWh', '')),
    }

    const result = completeChargingSession(currentSession)
    app.globalData.balance = getStoredBalance()

    if (monitorTimer) {
      clearInterval(monitorTimer)
      monitorTimer = 0
    }

    wx.navigateTo({ url: `/pages/charging-result/charging-result?orderId=${result.id}` })
  },
})
