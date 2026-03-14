import { createElement, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const dashboardPath = '/dashboard'
export const checkoutPath = '/checkout'
export const oauthSuccessPath = '/oauth-success'
export const authStorageKey = 'nanowork-auth'
export const tokenStorageKey = 'token'
export const authStartUrl = 'https://accounts.google.com/signin'

export function isSignedIn() {
  return Boolean(window.localStorage.getItem(tokenStorageKey))
}

function getWindowCustomerId() {
  const checkoutWindow = window

  return (
    checkoutWindow.contextWindow?.customerId?.trim() ??
    checkoutWindow.nanoworkContext?.customerId?.trim() ??
    checkoutWindow.__NANOWORK_CONTEXT__?.customerId?.trim() ??
    ''
  )
}

export function handleCtaRedirection(navigate) {
  navigate(getWindowCustomerId() ? dashboardPath : checkoutPath)
}

const OAuthSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const accessToken = window.location.hash.slice(1) || ''

      if (accessToken) {
        window.localStorage.setItem(tokenStorageKey, accessToken)
        window.localStorage.setItem(authStorageKey, 'true')
        navigate(dashboardPath, { replace: true })
        return
      }

      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error handling OAuth success:', error)
      navigate('/', { replace: true })
    }
  }, [navigate])

  return createElement('div', null, 'Loading...')
}

export default OAuthSuccess
