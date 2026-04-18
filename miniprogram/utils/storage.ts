const USER_KEY = 'echarge_user'
const BALANCE_KEY = 'echarge_balance'

export interface UserInfo {
  nickname: string
  email: string
}

export function getStoredUser(): UserInfo | null {
  try {
    const data = wx.getStorageSync(USER_KEY)
    return data || null
  } catch {
    return null
  }
}

export function setStoredUser(user: UserInfo | null) {
  if (user) {
    wx.setStorageSync(USER_KEY, user)
  } else {
    wx.removeStorageSync(USER_KEY)
  }
}

export function getStoredBalance(): number {
  try {
    const data = wx.getStorageSync(BALANCE_KEY)
    return typeof data === 'number' ? data : 0
  } catch {
    return 0
  }
}

export function setStoredBalance(balance: number) {
  wx.setStorageSync(BALANCE_KEY, balance)
}
