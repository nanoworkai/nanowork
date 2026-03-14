export const dashboardPath: string
export const checkoutPath: string
export const oauthSuccessPath: string
export const authStorageKey: string
export const tokenStorageKey: string
export const authStartUrl: string

export function isSignedIn(): boolean
export function handleCtaRedirection(navigate: (path: string) => void): void

declare const OAuthSuccess: () => JSX.Element
export default OAuthSuccess
