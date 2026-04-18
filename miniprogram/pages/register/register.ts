import { setStoredUser } from '../../utils/storage'

Page({
  data: {
    nickname: '',
    email: '',
    password: '',
  },

  onNicknameInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ nickname: e.detail.value })
  },

  onEmailInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ email: e.detail.value })
  },

  onPasswordInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ password: e.detail.value })
  },

  onRegister() {
    const { nickname, email, password } = this.data
    if (!nickname || !email || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    const users = wx.getStorageSync('echarge_users') || {}
    if (users[email]) {
      wx.showToast({ title: '该邮箱已注册', icon: 'none' })
      return
    }
    users[email] = { nickname, email, password }
    wx.setStorageSync('echarge_users', users)
    setStoredUser({ nickname, email })
    const app = getApp<IAppOption>()
    app.globalData.echargeUser = { nickname, email }
    wx.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      wx.switchTab({ url: '/pages/home/home' })
    }, 1500)
  },

  goLogin() {
    wx.navigateBack()
  },
})
