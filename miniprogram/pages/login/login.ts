import { getStoredUser, setStoredUser } from '../../utils/storage'

Page({
  data: {
    email: '',
    password: '',
  },

  onEmailInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ email: e.detail.value })
  },

  onPasswordInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ password: e.detail.value })
  },

  onShow() {
    const user = getStoredUser()
    if (user) {
      wx.switchTab({ url: '/pages/home/home' })
    }
  },

  onLogin() {
    const { email, password } = this.data
    if (!email || !password) {
      wx.showToast({ title: '请填写邮箱和密码', icon: 'none' })
      return
    }
    // 模拟登录：从本地存储验证（注册过的用户）
    const users = wx.getStorageSync('echarge_users') || {}
    const user = users[email]
    if (user && user.password === password) {
      setStoredUser({ nickname: user.nickname, email })
      const app = getApp<IAppOption>()
      app.globalData.echargeUser = { nickname: user.nickname, email }
      wx.switchTab({ url: '/pages/home/home' })
    } else {
      wx.showToast({ title: '邮箱或密码错误', icon: 'none' })
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  },
})
