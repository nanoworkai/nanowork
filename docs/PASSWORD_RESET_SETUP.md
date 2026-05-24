# Password Reset Flow - Setup Guide

This document outlines the password reset flow implementation and required Supabase configuration.

## Overview

Users can reset their password through a secure email-based flow:

1. User requests password reset on `/forgot-password`
2. Supabase sends reset email with secure token
3. User clicks link and lands on `/reset-password`
4. User sets new password
5. User is redirected to login

## Features

- ✅ Email-based password reset via Supabase Auth
- ✅ Secure token validation
- ✅ Password strength requirements
- ✅ Visual feedback for password criteria
- ✅ Loading states throughout
- ✅ Error handling with user-friendly messages
- ✅ Security best practice: never confirm if email exists
- ✅ Automatic sign-out after password update

## User Flow

### 1. Forgot Password (`/forgot-password`)

**Features:**
- Single email input field
- "Send Reset Link" button with loading state
- Success message (shown regardless of email existence)
- Back to login link
- Security notice about not revealing registered emails

**Security:**
- Always shows success message (doesn't leak if email is registered)
- Basic email validation
- Rate limiting handled by Supabase

### 2. Reset Password (`/reset-password`)

**Features:**
- New password input with show/hide toggle
- Confirm password input with show/hide toggle
- Real-time password requirements validation:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
- Visual checkmarks for met requirements
- Passwords must match validation
- Loading state during submission
- Security notice about sign-out

**Flow:**
1. Page validates session token on load
2. If invalid/expired → redirect to `/forgot-password` with error
3. User enters and confirms new password
4. Password strength validated before submission
5. On success → user signed out → redirect to login with success message

### 3. Login Page Enhancement

**Added:**
- "Forgot password?" link next to password field
- Success message display (green banner)
- Error message display (red banner)

## Implementation Files

### Created Files

1. **`/apps/web/src/pages/ForgotPassword.tsx`**
   - Email input form
   - Supabase auth integration
   - Success/error states

2. **`/apps/web/src/pages/ResetPassword.tsx`**
   - Password reset form
   - Session validation
   - Password strength requirements
   - Real-time validation feedback

### Modified Files

1. **`/apps/web/src/pages/Login.tsx`**
   - Added "Forgot password?" link
   - Success/error message handling via location state

2. **`/apps/web/src/App.tsx`**
   - Added `/forgot-password` route
   - Added `/reset-password` route

## Supabase Configuration

### Required Settings

#### 1. Email Templates

Navigate to: **Authentication → Email Templates → Reset Password**

**Verify the template includes:**
- Clear subject line (e.g., "Reset your Nanowork password")
- Branded header/footer
- Clear call-to-action button
- Reset link with token: `{{ .ConfirmationURL }}`
- Link expiration notice (default: 1 hour)

**Example template:**
```html
<h2>Reset Your Password</h2>
<p>You requested a password reset for your Nanowork account.</p>
<p>Click the button below to set a new password:</p>
<a href="{{ .ConfirmationURL }}" style="...">Reset Password</a>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

#### 2. Redirect URLs

Navigate to: **Authentication → URL Configuration → Redirect URLs**

**Add these URLs to the allowlist:**

**Production:**
```
https://nanowork.app/reset-password
```

**Development:**
```
http://localhost:5173/reset-password
```

**Staging (if applicable):**
```
https://staging.nanowork.app/reset-password
```

⚠️ **Important:** The redirect URL must match exactly (including protocol and trailing slash behavior).

#### 3. Email Provider (Optional Enhancement)

Navigate to: **Project Settings → Auth → SMTP Settings**

For better deliverability, configure a custom SMTP provider:
- **Recommended:** Resend, SendGrid, AWS SES, Postmark
- Configure custom sender name and email
- Improves inbox placement and brand trust

#### 4. Rate Limiting (Recommended)

Navigate to: **Authentication → Rate Limits**

**Recommended settings:**
- Password reset requests: 3-5 per hour per IP
- Prevents abuse while allowing legitimate retries

## Environment Variables

Ensure these are set in `.env`:

```bash
# Frontend
VITE_SITE_URL=https://nanowork.app  # Production URL
# or
VITE_SITE_URL=http://localhost:5173  # Development

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Checklist

### Manual Testing

- [ ] **Request password reset**
  - Go to `/forgot-password`
  - Enter valid email
  - Verify success message shows
  - Check email arrives (inbox and spam)
  
- [ ] **Invalid email**
  - Enter invalid email format
  - Verify error message shows
  - Verify no email sent
  
- [ ] **Security test**
  - Enter non-existent email
  - Verify success message still shows (no leak)
  
- [ ] **Reset password with valid link**
  - Click email link
  - Verify redirects to `/reset-password`
  - Enter new password
  - Verify password requirements work
  - Submit and verify success
  - Verify redirect to login
  
- [ ] **Reset password with expired link**
  - Use old/expired reset link
  - Verify redirect to forgot password with error
  
- [ ] **Password validation**
  - Try password too short (< 8 chars)
  - Try password without uppercase
  - Try password without lowercase
  - Try password without number
  - Try mismatched passwords
  - Verify submit button disabled until all valid
  
- [ ] **UI/UX**
  - Verify loading states show
  - Verify error messages clear
  - Verify show/hide password toggles work
  - Test on mobile viewport

### Automated Testing (Future)

```typescript
describe('Password Reset Flow', () => {
  it('should show forgot password link on login', () => {});
  it('should accept email and show success', () => {});
  it('should validate email format', () => {});
  it('should not leak email existence', () => {});
  it('should validate password requirements', () => {});
  it('should require matching passwords', () => {});
  it('should redirect invalid tokens', () => {});
  it('should update password and redirect', () => {});
});
```

## Security Considerations

### Best Practices Implemented

1. **No Email Enumeration**
   - Always show success message
   - Never confirm if email exists
   - Prevents attacker email discovery

2. **Token Security**
   - Tokens generated by Supabase (secure)
   - Tokens expire after 1 hour (configurable)
   - One-time use tokens
   - Validated server-side

3. **Password Requirements**
   - Minimum 8 characters
   - Mixed case required
   - Numbers required
   - Prevents weak passwords

4. **Session Handling**
   - User signed out after reset
   - Must log in with new password
   - Prevents session hijacking

5. **Rate Limiting**
   - Supabase handles rate limits
   - Prevents brute force attempts
   - Prevents spam attacks

### Known Limitations

1. **Email deliverability** depends on Supabase email provider
   - Consider custom SMTP for production
   
2. **No password history** check
   - User can reuse old passwords
   - Could add if needed

3. **No 2FA integration** (yet)
   - Reset bypasses 2FA
   - Consider requiring 2FA re-setup after reset

## Troubleshooting

### Email not arriving

1. **Check spam folder**
2. **Verify email template is enabled** in Supabase dashboard
3. **Check Supabase logs** for delivery errors
4. **Verify redirect URL** is in allowlist
5. **Consider custom SMTP** provider for better deliverability

### Reset link not working

1. **Check token expiration** (default 1 hour)
2. **Verify redirect URL** matches configuration exactly
3. **Check browser console** for JavaScript errors
4. **Verify Supabase client** is initialized correctly

### Password requirements too strict

Adjust in `/apps/web/src/pages/ResetPassword.tsx`:

```typescript
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  // Add/remove requirements here
  return null;
};
```

## Future Enhancements

- [ ] Password strength meter (weak/medium/strong)
- [ ] Support for magic link passwordless login
- [ ] 2FA requirement after password reset
- [ ] Password history check (prevent reuse)
- [ ] Custom email templates per environment
- [ ] SMS-based password reset option
- [ ] Account recovery questions
- [ ] Security audit log for password changes

## Support

For issues or questions:
- Check Supabase dashboard logs
- Review browser console for errors
- Test with different email providers
- Verify all configuration steps completed

---

**Last Updated:** 2026-05-13  
**Version:** 1.0  
**Author:** Nanowork Team
