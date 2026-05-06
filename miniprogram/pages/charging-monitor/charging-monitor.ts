import {
  buildChargingSessionFromOrder,
  finishOrder,
  getOrderDetail,
  getWalletSummary,
  withApiFallback,
} from '../../services/api'
import {
  ChargingSession,
  clearChargingSession,
  completeChargingSession,
  createChargingSession,
  formatDuration,
  getChargingSession,
  getOrderById,
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
    durationText: '0 min',
    batteryText: '0%',
    progressPercent: '0%',
    powerText: '0 kW',
    feeText: '0.00',
    energyText: '0.0 kWh',
    electricityFeeText: '0.00',
    serviceFeeText: '0.00',
    discountFeeText: '0.00',
    priceNote: '',
    statusText: 'Charging',
  },

  async onLoad(options: Record<string, string | undefined>) {
    const orderId = options.orderId || ''
    const currentSession = getChargingSession()
    const matchedSession = await withApiFallback(
      'charging-monitor:getOrderDetail',
      async () => {
        if (!orderId) {
          throw new Error('missing order id')
        }
        const order = await getOrderDetail(orderId)
        return buildChargingSessionFromOrder(order)
      },
      () => {
        if (currentSession && (!orderId || currentSession.orderId === orderId)) {
          return currentSession
        }

        const fallbackOrder = orderId ? getOrderById(orderId) : null
        if (fallbackOrder) {
          return {
            orderId: fallbackOrder.id,
            orderNo: fallbackOrder.orderNo,
            stationId: fallbackOrder.stationId,
            stationName: fallbackOrder.stationName,
            pileNo: fallbackOrder.pileNo,
            gunNo: fallbackOrder.gunNo,
            startedAt: fallbackOrder.startTime,
            durationMinutes: 0,
            currentBattery: 32,
            currentPower: 38,
            currentFee: fallbackOrder.amountValue,
            energy: Number(fallbackOrder.powerText.replace(/[^\d.]/g, '')) || 0,
            electricityFee: 0,
            serviceFee: 0,
            discountFee: fallbackOrder.discountValue,
            priceNote: 'Fallback demo mode. Backend order remains source of truth.',
          } as ChargingSession
        }

        return createChargingSession()
      }
    )

    updateChargingSessionSnapshot(matchedSession)
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
        priceNote: 'Realtime values are simulated locally for demo continuity.',
      }

      updateChargingSessionSnapshot(nextSession)
      this.setData(buildDisplayState(nextSession))
    }, 1000)
  },

  async endCharging() {
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

    wx.showLoading({ title: 'Ending' })

    try {
      const result = await finishOrder(currentSession.orderId)
      clearChargingSession()

      try {
        const walletSummary = await getWalletSummary()
        app.globalData.balance = walletSummary.balance
      } catch (error) {
        console.warn('[charging-monitor] refresh wallet summary failed', error)
      }

      if (monitorTimer) {
        clearInterval(monitorTimer)
        monitorTimer = 0
      }

      wx.hideLoading()
      wx.navigateTo({ url: `/pages/charging-result/charging-result?orderId=${result.id}` })
      return
    } catch (error) {
      console.warn('[charging-monitor] finishOrder failed, fallback to mock completion', error)
    }

    const result = completeChargingSession(currentSession)
    app.globalData.balance = getStoredBalance()

    if (monitorTimer) {
      clearInterval(monitorTimer)
      monitorTimer = 0
    }

    wx.hideLoading()
    wx.navigateTo({ url: `/pages/charging-result/charging-result?orderId=${result.id}` })
  },
})
