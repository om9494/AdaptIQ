import React, { createContext, useEffect, useMemo, useState } from 'react'
import { getMe, loginUser, logoutUser, updateProfile as updateProfileApi } from '../api/auth'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      if (!accessToken) {
        setIsLoading(false)
        return
      }
      try {
        const res = await getMe()
        setUser(res.data.data)
      } catch (err) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [accessToken])

  const login = async (email, password) => {
    const res = await loginUser({ email, password })
    const token = res.data.data.access_token
    const userData = res.data.data.user
    setAccessToken(token)
    setUser(userData)
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    return res.data.data
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setAccessToken(null)
    setUser(null)
  }

  const updateProfile = async (payload) => {
    const res = await updateProfileApi(payload)
    setUser(res.data.data)
    localStorage.setItem('user', JSON.stringify(res.data.data))
    return res.data.data
  }

  const value = useMemo(() => ({
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    logout,
    updateProfile
  }), [user, accessToken, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
