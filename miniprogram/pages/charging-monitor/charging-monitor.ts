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
    progressPercent: `${Math.min(session.currentBattery, 96)}%`,
    powerText: `${session.currentPower.toFixed(0)} kW`,
    feeText: session.currentFee.toFixed(2),
    energyText: `${session.energy.toFixed(1)} kWh`,
    electricityFeeText: session.electricityFee.toFixed(2),
    serviceFeeText: session.serviceFee.toFixed(2),
    discountFeeText: session.discountFee.toFixed(2),
    priceNote: session.priceNote,
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
    progressPercent: '0%',
    powerText: '0 kW',
    feeText: '0.00',
    energyText: '0.0 kWh',
    electricityFeeText: '0.00',
    serviceFeeText: '0.00',
    discountFeeText: '0.00',
    priceNote: '',
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
      const energy = Number((Number(this.data.energyText.replace(' kWh', '')) + 1.1).toFixed(1))
      const electricityFee = Number((energy * 0.78).toFixed(2))
      const serviceFee = Number((energy * 0.48).toFixed(2))
      const discountFee = 0.8
      const currentFee = Number((electricityFee + serviceFee - discountFee).toFixed(2))

      const nextSession: ChargingSession = {
        orderId: this.data.orderId,
        orderNo: this.data.orderNo,
        stationId: this.data.stationId,
        stationName: this.data.stationName,
        pileNo: this.data.pileNo,
        gunNo: this.data.gunNo,
        startedAt: this.data.startedAt,
        durationMinutes: this.data.durationMinutes + 1,
        currentBattery: Math.min(Number(this.data.batteryText.replace('%', '')) + 2, 96),
        currentPower: Math.max(Math.min(Number(this.data.powerText.replace(' kW', '')) + 1.4, 52), 36),
        currentFee,
        energy,
        electricityFee,
        serviceFee,
        discountFee,
        priceNote: '当前按平时段电价计费，夜间时段可享服务费优惠。',
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
      electricityFee: Number(this.data.electricityFeeText),
      serviceFee: Number(this.data.serviceFeeText),
      discountFee: Number(this.data.discountFeeText),
      priceNote: this.data.priceNote,
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
