import { getStoredUser, getStoredBalance } from './utils/storage'

App<IAppOption>({
  globalData: {
    echargeUser: null,
    balance: 0,
  },
  onLaunch() {
    const user = getStoredUser()
    const balance = getStoredBalance()
    this.globalData.echargeUser = user
    this.globalData.balance = balance

    wx.login({
      success: res => {
        console.log('wx.login code:', res.code)
      },
    })
  },
})
