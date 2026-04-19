import { setStoredUser } from '../../utils/storage'

const app = getApp<IAppOption>()

interface AccountMap {
  [key: string]: {
    nickname: string
    email: string
    password: string
  }
}

type LoginType = 'mobile' | 'email'

Page({
  data: {
    loginType: 'email' as LoginType,
    account: '',
    password: '',
    agreeChecked: true,
    accountLabel: '邮箱账号',
    accountPlaceholder: '请输入邮箱账号',
  },

  onLoad() {
    this.updateLoginTypeView('email')
    this.setData({
      account: 'user@echarge.com',
      password: '123456',
    })
  },

  switchLoginType(e: WechatMiniprogram.CustomEvent) {
    const { type } = e.currentTarget.dataset as { type: LoginType }
    this.updateLoginTypeView(type)
    this.setData({
      account: type === 'mobile' ? '13800138000' : 'user@echarge.com',
    })
  },

  onAccountInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ account: e.detail.value })
  },

  onPasswordInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ password: e.detail.value })
  },

  toggleAgree() {
    this.setData({
      agreeChecked: !this.data.agreeChecked,
    })
  },

  onLogin() {
    const account = this.data.account.trim()
    const password = this.data.password.trim()

    if (!this.data.agreeChecked) {
      wx.showToast({ title: '请先勾选服务协议', icon: 'none' })
      return
    }

    if (!account || !password) {
      wx.showToast({ title: '请填写账号和密码', icon: 'none' })
      return
    }

    const users = (wx.getStorageSync('echarge_users') || {}) as AccountMap
    const user =
      this.data.loginType === 'mobile'
        ? users['user@echarge.com']
        : users[account]

    if (!user || user.password !== password) {
      wx.showToast({ title: '账号或密码不正确', icon: 'none' })
      return
    }

    setStoredUser({ nickname: user.nickname, email: user.email })
    app.globalData.echargeUser = { nickname: user.nickname, email: user.email }
    wx.switchTab({ url: '/pages/home/home' })
  },

  onQuickLogin() {
    const defaultUser = {
      nickname: '车主用户',
      email: 'user@echarge.com',
    }
    setStoredUser(defaultUser)
    app.globalData.echargeUser = defaultUser
    wx.switchTab({ url: '/pages/home/home' })
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  },

  updateLoginTypeView(type: LoginType) {
    this.setData({
      loginType: type,
      accountLabel: type === 'mobile' ? '手机号' : '邮箱账号',
      accountPlaceholder: type === 'mobile' ? '请输入手机号' : '请输入邮箱账号',
    })
  },
})
