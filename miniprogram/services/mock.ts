import { getStoredBalance, setStoredBalance } from '../utils/storage'

export interface StationPile {
  id: string
  label: string
  power: string
  status: 'idle' | 'busy' | 'fault'
  statusText: string
}

export interface StationItem {
  id: string
  name: string
  address: string
  operator: string
  available: number
  total: number
  distance: string
  statusText: string
  businessHours: string
  parkingTips: string
  serviceTips: string
  priceText: string
  score: string
  tags: string[]
  piles: StationPile[]
}

export interface PromotionCard {
  id: string
  title: string
  desc: string
  tag: string
}

export interface WalletRecord {
  id: string
  title: string
  time: string
  amountText: string
  type: 'income' | 'expense'
  channel: string
}

export type OrderStatus = 'charging' | 'completed' | 'abnormal'

export interface OrderItem {
  id: string
  orderNo: string
  stationId: string
  stationName: string
  pileNo: string
  gunNo: string
  startTime: string
  endTime: string
  durationText: string
  powerText: string
  amountText: string
  amountValue: number
  status: OrderStatus
  statusText: string
  canInvoice: boolean
}

export interface InvoiceRecord {
  id: string
  orderId: string
  orderNo: string
  title: string
  email: string
  amountText: string
  status: 'pending' | 'issued' | 'rejected'
  statusText: string
  applyTime: string
  note: string
  attachmentName: string
}

export interface ChargingSession {
  orderId: string
  orderNo: string
  stationId: string
  stationName: string
  pileNo: string
  gunNo: string
  startedAt: string
  durationMinutes: number
  currentBattery: number
  currentPower: number
  currentFee: number
  energy: number
}

const ORDERS_KEY = 'echarge_orders'
const INVOICES_KEY = 'echarge_invoices'
const WALLET_RECORDS_KEY = 'echarge_wallet_records'
const CHARGING_SESSION_KEY = 'echarge_charging_session'
const USERS_KEY = 'echarge_users'
const DEFAULT_BALANCE = 286.5

const STATIONS: StationItem[] = [
  {
    id: 'station-001',
    name: '天府软件园综合充电站',
    address: '成都市高新区天府五街 200 号地下停车场 B1',
    operator: 'E-Charge 自营',
    available: 8,
    total: 12,
    distance: '1.2km',
    statusText: '空闲较多',
    businessHours: '00:00 - 24:00',
    parkingTips: '停车 2 小时内免费，支持新能源专属车位',
    serviceTips: '便利店 / 洗手间 / 休息区',
    priceText: '￥1.42/度，服务费 ￥0.58/度',
    score: '4.9',
    tags: ['快充', '停车便利', '24 小时'],
    piles: [
      { id: 'TF-01', label: 'A1 号桩', power: '120kW', status: 'idle', statusText: '空闲' },
      { id: 'TF-02', label: 'A2 号桩', power: '120kW', status: 'idle', statusText: '空闲' },
      { id: 'TF-03', label: 'B1 号桩', power: '60kW', status: 'busy', statusText: '充电中' },
      { id: 'TF-04', label: 'B2 号桩', power: '60kW', status: 'idle', statusText: '空闲' },
    ],
  },
  {
    id: 'station-002',
    name: '环球中心北广场充电站',
    address: '成都市高新区天府大道北段 1700 号 P2 停车区',
    operator: '特来电',
    available: 3,
    total: 8,
    distance: '2.6km',
    statusText: '较忙',
    businessHours: '07:00 - 23:00',
    parkingTips: '商场停车高峰期较紧张，建议错峰前往',
    serviceTips: '商场配套 / 咖啡店 / 导航指引',
    priceText: '￥1.55/度，服务费 ￥0.60/度',
    score: '4.7',
    tags: ['商圈站点', '快充', '导航便捷'],
    piles: [
      { id: 'HQ-11', label: 'C1 号桩', power: '180kW', status: 'busy', statusText: '充电中' },
      { id: 'HQ-12', label: 'C2 号桩', power: '180kW', status: 'idle', statusText: '空闲' },
      { id: 'HQ-13', label: 'D1 号桩', power: '90kW', status: 'fault', statusText: '维护中' },
      { id: 'HQ-14', label: 'D2 号桩', power: '90kW', status: 'idle', statusText: '空闲' },
    ],
  },
  {
    id: 'station-003',
    name: '东客站出行服务充电站',
    address: '成都市成华区迎晖路 8 号东广场停车楼 1 层',
    operator: '星星充电',
    available: 5,
    total: 10,
    distance: '3.8km',
    statusText: '空闲适中',
    businessHours: '06:30 - 23:30',
    parkingTips: '支持网约车优先排队，停车指引清晰',
    serviceTips: '候车区 / 自动售货机 / 站内客服',
    priceText: '￥1.36/度，服务费 ￥0.52/度',
    score: '4.8',
    tags: ['交通枢纽', '普通充电', '服务完善'],
    piles: [
      { id: 'DK-21', label: 'E1 号桩', power: '90kW', status: 'idle', statusText: '空闲' },
      { id: 'DK-22', label: 'E2 号桩', power: '90kW', status: 'busy', statusText: '充电中' },
      { id: 'DK-23', label: 'F1 号桩', power: '60kW', status: 'idle', statusText: '空闲' },
      { id: 'DK-24', label: 'F2 号桩', power: '60kW', status: 'idle', statusText: '空闲' },
    ],
  },
  {
    id: 'station-004',
    name: '金融城商务区充电站',
    address: '成都市高新区交子大道 333 号 A 座地下停车场',
    operator: 'E-Charge 合作站',
    available: 2,
    total: 6,
    distance: '4.5km',
    statusText: '较忙',
    businessHours: '00:00 - 24:00',
    parkingTips: '工作日午间高峰排队较多',
    serviceTips: '商务配套 / 代客泊车 / 保安值守',
    priceText: '￥1.68/度，服务费 ￥0.65/度',
    score: '4.6',
    tags: ['商务区', '高峰繁忙', '24 小时'],
    piles: [
      { id: 'JR-31', label: 'G1 号桩', power: '120kW', status: 'busy', statusText: '充电中' },
      { id: 'JR-32', label: 'G2 号桩', power: '120kW', status: 'busy', statusText: '充电中' },
      { id: 'JR-33', label: 'H1 号桩', power: '60kW', status: 'idle', statusText: '空闲' },
      { id: 'JR-34', label: 'H2 号桩', power: '60kW', status: 'idle', statusText: '空闲' },
    ],
  },
]

const PROMOTIONS: PromotionCard[] = [
  {
    id: 'promo-01',
    title: '新用户首充立减 12 元',
    desc: '完成首笔钱包充值后自动发放，适用于合作快充站点。',
    tag: '新人福利',
  },
  {
    id: 'promo-02',
    title: '周末夜间服务费 8 折',
    desc: '每周五至周日 20:00 后生效，适合论文展示优惠活动场景。',
    tag: '限时优惠',
  },
]

const DEFAULT_WALLET_RECORDS: WalletRecord[] = [
  {
    id: 'wallet-001',
    title: '钱包充值',
    time: '2026-04-18 20:15',
    amountText: '+100.00',
    type: 'income',
    channel: '微信支付（演示）',
  },
  {
    id: 'wallet-002',
    title: '天府软件园综合充电站',
    time: '2026-04-18 22:02',
    amountText: '-46.80',
    type: 'expense',
    channel: '充电消费',
  },
  {
    id: 'wallet-003',
    title: '东客站出行服务充电站',
    time: '2026-04-16 18:26',
    amountText: '-28.40',
    type: 'expense',
    channel: '充电消费',
  },
]

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: 'order-001',
    orderNo: 'EC202604180001',
    stationId: 'station-001',
    stationName: '天府软件园综合充电站',
    pileNo: 'TF-02',
    gunNo: '1 号枪',
    startTime: '2026-04-18 21:08',
    endTime: '2026-04-18 22:02',
    durationText: '54 分钟',
    powerText: '31.8 kWh',
    amountText: '46.80',
    amountValue: 46.8,
    status: 'completed',
    statusText: '已完成',
    canInvoice: true,
  },
  {
    id: 'order-002',
    orderNo: 'EC202604170001',
    stationId: 'station-003',
    stationName: '东客站出行服务充电站',
    pileNo: 'DK-21',
    gunNo: '2 号枪',
    startTime: '2026-04-17 17:35',
    endTime: '2026-04-17 18:26',
    durationText: '51 分钟',
    powerText: '22.4 kWh',
    amountText: '28.40',
    amountValue: 28.4,
    status: 'completed',
    statusText: '已完成',
    canInvoice: true,
  },
  {
    id: 'order-003',
    orderNo: 'EC202604150001',
    stationId: 'station-004',
    stationName: '金融城商务区充电站',
    pileNo: 'JR-31',
    gunNo: '1 号枪',
    startTime: '2026-04-15 09:20',
    endTime: '2026-04-15 09:33',
    durationText: '13 分钟',
    powerText: '8.6 kWh',
    amountText: '12.60',
    amountValue: 12.6,
    status: 'abnormal',
    statusText: '异常结束',
    canInvoice: false,
  },
]

const DEFAULT_INVOICES: InvoiceRecord[] = [
  {
    id: 'invoice-001',
    orderId: 'order-001',
    orderNo: 'EC202604180001',
    title: '成都智行科技有限公司',
    email: 'finance@echarge-demo.com',
    amountText: '46.80',
    status: 'issued',
    statusText: '已开票',
    applyTime: '2026-04-18 22:10',
    note: '用于企业差旅报销',
    attachmentName: '电子发票-EC202604180001.pdf',
  },
  {
    id: 'invoice-002',
    orderId: 'order-002',
    orderNo: 'EC202604170001',
    title: '个人',
    email: 'demo-user@foxmail.com',
    amountText: '28.40',
    status: 'pending',
    statusText: '待处理',
    applyTime: '2026-04-17 18:40',
    note: '请开具电子普通发票',
    attachmentName: '待生成',
  },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function hasStorageKey(key: string) {
  try {
    return wx.getStorageInfoSync().keys.includes(key)
  } catch {
    return false
  }
}

function getStorageData<T>(key: string, fallback: T): T {
  try {
    const value = wx.getStorageSync(key)
    if (value === '' || value === undefined || value === null) {
      return clone(fallback)
    }
    return clone(value as T)
  } catch {
    return clone(fallback)
  }
}

function setStorageData<T>(key: string, value: T) {
  wx.setStorageSync(key, value)
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatDateTime(input: Date) {
  const year = input.getFullYear()
  const month = pad(input.getMonth() + 1)
  const day = pad(input.getDate())
  const hour = pad(input.getHours())
  const minute = pad(input.getMinutes())
  return `${year}-${month}-${day} ${hour}:${minute}`
}

export function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${hour} 小时 ${minute} 分钟`
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function buildOrderNo() {
  const now = new Date()
  return `EC${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export function initializeDemoState() {
  if (!hasStorageKey(USERS_KEY)) {
    wx.setStorageSync(USERS_KEY, {
      'demo@echarge.com': {
        nickname: '演示用户',
        email: 'demo@echarge.com',
        password: '123456',
      },
    })
  }

  if (!hasStorageKey(WALLET_RECORDS_KEY)) {
    setStorageData(WALLET_RECORDS_KEY, DEFAULT_WALLET_RECORDS)
  }

  if (!hasStorageKey(ORDERS_KEY)) {
    setStorageData(ORDERS_KEY, DEFAULT_ORDERS)
  }

  if (!hasStorageKey(INVOICES_KEY)) {
    setStorageData(INVOICES_KEY, DEFAULT_INVOICES)
  }

  if (!hasStorageKey('echarge_balance')) {
    setStoredBalance(DEFAULT_BALANCE)
  }
}

export function getStations() {
  return clone(STATIONS)
}

export function getRecommendedStations() {
  return clone(STATIONS.slice(0, 3))
}

export function getStationById(id: string) {
  return clone(STATIONS.find(item => item.id === id) || STATIONS[0])
}

export function getPromotions() {
  return clone(PROMOTIONS)
}

export function getWalletRecords() {
  return getStorageData(WALLET_RECORDS_KEY, DEFAULT_WALLET_RECORDS)
}

export function getOrders() {
  return getStorageData(ORDERS_KEY, DEFAULT_ORDERS)
}

function saveOrders(orders: OrderItem[]) {
  setStorageData(ORDERS_KEY, orders)
}

export function getOrderById(id: string) {
  const orders = getOrders()
  return orders.find(item => item.id === id) || null
}

export function getLatestCompletedOrder() {
  const orders = getOrders()
  return orders.find(item => item.status === 'completed') || orders[0] || null
}

export function getInvoices() {
  return getStorageData(INVOICES_KEY, DEFAULT_INVOICES)
}

function saveInvoices(invoices: InvoiceRecord[]) {
  setStorageData(INVOICES_KEY, invoices)
}

export function findInvoiceByOrderId(orderId: string) {
  return getInvoices().find(item => item.orderId === orderId) || null
}

export function getChargingSession() {
  return getStorageData<ChargingSession | null>(CHARGING_SESSION_KEY, null)
}

function saveChargingSession(session: ChargingSession) {
  setStorageData(CHARGING_SESSION_KEY, session)
}

export function clearChargingSession() {
  wx.removeStorageSync(CHARGING_SESSION_KEY)
}

export function rechargeWallet(amount: number) {
  const nextBalance = Number((getStoredBalance() + amount).toFixed(2))
  setStoredBalance(nextBalance)

  const records = getWalletRecords()
  records.unshift({
    id: buildId('wallet'),
    title: '钱包充值',
    time: formatDateTime(new Date()),
    amountText: `+${formatAmount(amount)}`,
    type: 'income',
    channel: '微信支付（演示）',
  })
  setStorageData(WALLET_RECORDS_KEY, records)

  return nextBalance
}

export function createChargingSession(stationId?: string, pileNo?: string) {
  const station = getStationById(stationId || STATIONS[0].id)
  const actualPileNo = pileNo || station.piles[0].id
  const orderId = buildId('order')
  const orderNo = buildOrderNo()
  const startedAt = formatDateTime(new Date())

  const session: ChargingSession = {
    orderId,
    orderNo,
    stationId: station.id,
    stationName: station.name,
    pileNo: actualPileNo,
    gunNo: '1 号枪',
    startedAt,
    durationMinutes: 8,
    currentBattery: 32,
    currentPower: 38,
    currentFee: 6.8,
    energy: 5.4,
  }

  const orders = getOrders()
  orders.unshift({
    id: orderId,
    orderNo,
    stationId: station.id,
    stationName: station.name,
    pileNo: actualPileNo,
    gunNo: '1 号枪',
    startTime: startedAt,
    endTime: '--',
    durationText: '进行中',
    powerText: '5.4 kWh',
    amountText: '6.80',
    amountValue: 6.8,
    status: 'charging',
    statusText: '充电中',
    canInvoice: false,
  })

  saveOrders(orders)
  saveChargingSession(session)
  return session
}

export function updateChargingSessionSnapshot(session: ChargingSession) {
  saveChargingSession(session)

  const orders = getOrders().map(item =>
    item.id === session.orderId
      ? {
          ...item,
          durationText: formatDuration(session.durationMinutes),
          powerText: `${session.energy.toFixed(1)} kWh`,
          amountText: formatAmount(session.currentFee),
          amountValue: session.currentFee,
        }
      : item
  )
  saveOrders(orders)
}

export function completeChargingSession(session: ChargingSession) {
  const completedAt = formatDateTime(new Date())
  const completedOrder: OrderItem = {
    id: session.orderId,
    orderNo: session.orderNo,
    stationId: session.stationId,
    stationName: session.stationName,
    pileNo: session.pileNo,
    gunNo: session.gunNo,
    startTime: session.startedAt,
    endTime: completedAt,
    durationText: formatDuration(session.durationMinutes),
    powerText: `${session.energy.toFixed(1)} kWh`,
    amountText: formatAmount(session.currentFee),
    amountValue: session.currentFee,
    status: 'completed',
    statusText: '已完成',
    canInvoice: true,
  }

  const orders = getOrders().map(item => (item.id === session.orderId ? completedOrder : item))
  saveOrders(orders)

  const nextBalance = Number(Math.max(getStoredBalance() - session.currentFee, 0).toFixed(2))
  setStoredBalance(nextBalance)

  const records = getWalletRecords()
  records.unshift({
    id: buildId('wallet'),
    title: session.stationName,
    time: completedAt,
    amountText: `-${formatAmount(session.currentFee)}`,
    type: 'expense',
    channel: '充电消费',
  })
  setStorageData(WALLET_RECORDS_KEY, records)
  clearChargingSession()

  return completedOrder
}

export function createInvoiceApplication(options: {
  orderId: string
  title: string
  email: string
  note: string
}) {
  const order = getOrderById(options.orderId)
  if (!order) {
    return null
  }

  const existing = findInvoiceByOrderId(options.orderId)
  if (existing) {
    return existing
  }

  const record: InvoiceRecord = {
    id: buildId('invoice'),
    orderId: order.id,
    orderNo: order.orderNo,
    title: options.title,
    email: options.email,
    amountText: order.amountText,
    status: 'pending',
    statusText: '待处理',
    applyTime: formatDateTime(new Date()),
    note: options.note || '电子普通发票',
    attachmentName: '待生成',
  }

  const invoices = getInvoices()
  invoices.unshift(record)
  saveInvoices(invoices)
  return record
}
