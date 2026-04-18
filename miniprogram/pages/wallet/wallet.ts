import { getStoredBalance, setStoredBalance } from '../../utils/storage'

const app = getApp<IAppOption>()

Page({
  data: {
    balance: '0.00',
    records: [] as { id: string; desc: string; time: string; amount: string; type: string }[],
  },

  onLoad() {
    this.refreshBalance()
  },

  onShow() {
    this.refreshBalance()
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({ selected: 3 })
      }
    }
  },

  refreshBalance() {
    const balance = app.globalData.balance
    this.setData({ balance: balance.toFixed(2) })
  },

  onRecharge() {
    wx.showModal({
      title: '充值',
      content: '请输入充值金额',
      editable: true,
      placeholderText: '金额',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content)
          if (isNaN(amount) || amount <= 0) {
            wx.showToast({ title: '请输入有效金额', icon: 'none' })
            return
          }
          const newBalance = app.globalData.balance + amount
          app.globalData.balance = newBalance
          setStoredBalance(newBalance)
          this.setData({ balance: newBalance.toFixed(2) })
          const records = this.data.records
          records.unshift({
            id: Date.now().toString(),
            desc: '账户充值',
            time: this.formatTime(new Date()),
            amount: '+' + amount.toFixed(2),
            type: 'income',
          })
          this.setData({ records })
          wx.showToast({ title: '充值成功', icon: 'success' })
        }
      },
    })
  },

  onRefresh() {
    this.refreshBalance()
    wx.showToast({ title: '已刷新', icon: 'success' })
  },

  formatTime(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
  },
})
