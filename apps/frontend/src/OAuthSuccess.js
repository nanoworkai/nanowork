import { createElement, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const dashboardPath = '/dashboard'
export const oauthSuccessPath = '/oauth-success'
export const authStorageKey = 'nanowork-auth'
export const tokenStorageKey = 'token'
export const authStartUrl = `${
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}/auth/google`

export function isSignedIn() {
  return Boolean(window.localStorage.getItem(tokenStorageKey))
}

export function handleCtaRedirection(navigate) {
  navigate(dashboardPath)
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
