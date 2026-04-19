import { setStoredUser } from '../../utils/storage'

const app = getApp<IAppOption>()

interface DemoAccountMap {
  [key: string]: {
    nickname: string
    email: string
    password: string
  }
}

Page({
  data: {
    account: '',
    password: '',
  },

  onLoad() {
    this.setData({
      account: 'demo@echarge.com',
      password: '123456',
    })
  },

  onAccountInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ account: e.detail.value })
  },

  onPasswordInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ password: e.detail.value })
  },

  onLogin() {
    const account = this.data.account.trim()
    const password = this.data.password.trim()

    if (!account || !password) {
      wx.showToast({ title: '请填写账号和密码', icon: 'none' })
      return
    }

    const users = (wx.getStorageSync('echarge_users') || {}) as DemoAccountMap
    const user = users[account]

    if (!user || user.password !== password) {
      wx.showToast({ title: '账号或密码不正确', icon: 'none' })
      return
    }

    setStoredUser({ nickname: user.nickname, email: user.email })
    app.globalData.echargeUser = { nickname: user.nickname, email: user.email }
    wx.switchTab({ url: '/pages/home/home' })
  },

  onDemoLogin() {
    const demoUser = {
      nickname: '演示用户',
      email: 'demo@echarge.com',
    }
    setStoredUser(demoUser)
    app.globalData.echargeUser = demoUser
    wx.switchTab({ url: '/pages/home/home' })
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  },
})
