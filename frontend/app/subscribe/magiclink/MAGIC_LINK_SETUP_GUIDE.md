# 🔐 Magic Link Authentication - Complete Setup Guide

## 🎯 Problem You're Facing

**Issue:** Magic link redirects to landing page instead of `/subscribe`

**Root Cause:** 
1. Missing `redirectTo` parameter in magic link generation
2. No proper callback handler for verification
3. Token not being stored/verified correctly

---

## ✅ Complete Solution

### **Step 1: Create Database Schema**

Run this SQL in your Supabase SQL Editor:

```bash
# Go to Supabase Dashboard → SQL Editor → New Query
# Copy and paste the contents of magic-link-schema.sql
```

This creates:
- `magic_link_tokens` table (stores temporary tokens)
- `users` table (user accounts)
- `sessions` table (active sessions)
- Helper functions for cleanup

---

### **Step 2: Set Up File Structure**

```
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── magic-link/
│   │       │   └── route.ts          ← CREATE THIS (magic-link-api.ts)
│   │       └── verify/
│   │           └── route.ts          ← CREATE THIS (auth-verify-api.ts)
│   ├── auth/
│   │   └── verify/
│   │       └── page.tsx              ← CREATE THIS (auth-verify-page.tsx)
│   └── subscribe/
│       └── page.tsx                  ← REPLACE WITH (subscribe-page-fixed.tsx)
└── components/
    └── magic-link-modal.tsx          ← REPLACE WITH (magic-link-modal-fixed.tsx)
```

---

### **Step 3: Install Dependencies**

```bash
cd frontend
pnpm add resend sats-connect
```

---

### **Step 4: Configure Environment Variables**

Add to `frontend/.env.local`:

```env
# Resend (for sending emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@x402pay.com  # Use your verified domain

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Service role key (keep secret!)

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production URL in prod
```

---

### **Step 5: Create API Routes**

#### **File: `app/api/auth/magic-link/route.ts`**
```typescript
// Copy contents from magic-link-api.ts
```

#### **File: `app/api/auth/verify/route.ts`**
```typescript
// Copy contents from auth-verify-api.ts
```

---

### **Step 6: Create Auth Verification Page**

#### **File: `app/auth/verify/page.tsx`**
```typescript
// Copy contents from auth-verify-page.tsx
```

---

### **Step 7: Update Components**

#### **File: `components/magic-link-modal.tsx`**
```typescript
// Replace with contents from magic-link-modal-fixed.tsx
```

#### **File: `app/subscribe/page.tsx`**
```typescript
// Replace with contents from subscribe-page-fixed.tsx
```

---

## 🔄 How It Works (Complete Flow)

### **1. User Enters Email**
```
User types email in MagicLinkModal
↓
Clicks "Send Magic Link"
↓
POST /api/auth/magic-link
  - Generates secure token
  - Stores in magic_link_tokens table
  - Sends email via Resend
```

### **2. User Receives Email**
```
Resend delivers beautiful HTML email
↓
Email contains magic link:
https://yourapp.com/auth/verify?token=abc123xyz
```

### **3. User Clicks Link**
```
Browser opens: /auth/verify?token=abc123xyz
↓
AuthVerifyPage component loads
↓
useEffect fires → POST /api/auth/verify
  - Validates token
  - Checks expiration
  - Marks token as used
  - Creates/updates user
  - Creates session
  - Sets cookie
↓
Returns: { redirectTo: "/subscribe", session: {...} }
```

### **4. User Redirected**
```
AuthVerifyPage shows success
↓
setTimeout(() => router.push("/subscribe"), 1500)
↓
User lands on /subscribe page
↓
Page detects session via cookie
↓
Fetches subscription data
↓
Shows subscription management UI
```

---

## 🧪 Testing Checklist

### **Test 1: Send Magic Link**
```
1. Go to /subscribe
2. Click "Start Subscription"
3. Enter email in modal
4. Click "Send Magic Link"
5. ✅ Should see "Check Your Email" message
```

### **Test 2: Receive Email**
```
1. Check inbox (may be in spam)
2. ✅ Should receive email from x402Pay
3. ✅ Email should be beautifully formatted
4. ✅ Should contain magic link button
```

### **Test 3: Click Magic Link**
```
1. Click "Sign In to x402Pay" button in email
2. ✅ Should redirect to /auth/verify
3. ✅ Should show "Verifying..." spinner
4. ✅ Should show "Welcome Back!" success
5. ✅ Should redirect to /subscribe
```

### **Test 4: Session Persistence**
```
1. After successful login, refresh page
2. ✅ Should remain logged in
3. ✅ Should show "Auth: Magic link" in status
4. ✅ Should be able to connect wallet
```

### **Test 5: Expired Token**
```
1. Generate magic link
2. Wait 16 minutes (token expires in 15 min)
3. Click magic link
4. ✅ Should show "Magic link has expired"
5. ✅ Should redirect to home after 3 seconds
```

### **Test 6: Used Token**
```
1. Click magic link once (successful)
2. Click same link again
3. ✅ Should show "Invalid or expired magic link"
```

---

## 🐛 Debugging

### **Issue: Email Not Sending**

**Check Resend Dashboard:**
```
1. Go to resend.com/emails
2. Check "Logs" tab
3. Look for failed sends
```

**Common Fixes:**
```typescript
// 1. Verify domain in Resend
// Go to resend.com/domains

// 2. Check API key
console.log('Resend API Key:', process.env.RESEND_API_KEY?.slice(0, 10));

// 3. Check from email
// Must be: noreply@YOUR-VERIFIED-DOMAIN.com
```

---

### **Issue: Token Not Found**

**Check Database:**
```sql
-- View all tokens
SELECT * FROM magic_link_tokens 
ORDER BY created_at DESC 
LIMIT 10;

-- Check specific token
SELECT * FROM magic_link_tokens 
WHERE token = 'your-token-here';
```

**Common Fixes:**
```typescript
// 1. Verify Supabase connection
const { data, error } = await supabase
  .from("magic_link_tokens")
  .select("count");
  
console.log('Tokens count:', data, error);

// 2. Check service role key
// Must use SUPABASE_SERVICE_ROLE_KEY, not anon key
```

---

### **Issue: Redirect Not Working**

**Check Console:**
```javascript
// In auth/verify page
console.log('Redirect to:', data.redirectTo);
console.log('Current URL:', window.location.href);
```

**Common Fixes:**
```typescript
// 1. Verify redirectTo in token creation
body: JSON.stringify({
  email,
  redirectTo: `${window.location.origin}/subscribe`, // ✅ Include origin
}),

// 2. Check router.push
setTimeout(() => {
  console.log('Redirecting to:', redirectTo);
  router.push(redirectTo);
}, 1500);
```

---

### **Issue: Cookie Not Setting**

**Check Browser DevTools:**
```
1. Open DevTools → Application → Cookies
2. Look for "x402pay_session"
3. Check value, expiry, and flags
```

**Common Fixes:**
```typescript
// In auth/verify API
const cookieStore = await cookies();
cookieStore.set("x402pay_session", sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ← Important for localhost
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60,
  path: "/",
});
```

---

## 📧 Email Template Customization

### **Change Logo:**
```html
<!-- In magic-link-api.ts, replace header -->
<h1 style="margin: 0; color: #000; font-size: 28px; font-weight: 700;">
  <img src="https://your-cdn.com/logo.png" alt="x402Pay" height="40" />
</h1>
```

### **Change Colors:**
```html
<!-- Orange gradient → Your brand color -->
<td style="background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);">
```

### **Add Custom Content:**
```html
<!-- Add before footer -->
<tr>
  <td style="padding: 30px;">
    <h3>What's Next?</h3>
    <ul>
      <li>Connect your wallet</li>
      <li>Choose a subscription plan</li>
      <li>Start earning with auto-stacking</li>
    </ul>
  </td>
</tr>
```

---

## 🔒 Security Best Practices

### **1. Token Security**
```typescript
// ✅ Use cryptographically secure random
import { randomBytes } from 'crypto';

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// ❌ Don't use Math.random()
// It's not cryptographically secure
```

### **2. Expiration**
```typescript
// ✅ Set reasonable expiration
const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

// ❌ Don't make it too long
// Increases attack window
```

### **3. One-Time Use**
```typescript
// ✅ Mark as used immediately
await supabase
  .from("magic_link_tokens")
  .update({ used: true, used_at: new Date().toISOString() })
  .eq("token", token);

// ✅ Check used status
.eq("used", false)
```

### **4. Rate Limiting**
```typescript
// Add to magic-link API
const recentTokens = await supabase
  .from("magic_link_tokens")
  .select("count")
  .eq("email", email)
  .gte("created_at", new Date(Date.now() - 60000)); // Last minute

if (recentTokens.count > 3) {
  return NextResponse.json(
    { error: "Too many requests. Please wait before trying again." },
    { status: 429 }
  );
}
```

---

## 📊 Monitoring

### **Track Email Deliverability:**
```typescript
// Log to database
await supabase.from("email_logs").insert({
  email,
  type: "magic_link",
  status: emailError ? "failed" : "sent",
  error: emailError?.message,
  resend_id: emailData?.id,
});
```

### **Track Token Usage:**
```sql
-- Successful logins today
SELECT COUNT(*) FROM magic_link_tokens
WHERE used = TRUE
  AND used_at >= CURRENT_DATE;

-- Failed attempts (expired/invalid)
SELECT COUNT(*) FROM magic_link_tokens
WHERE used = FALSE
  AND expires_at < NOW();

-- Average time to click
SELECT AVG(used_at - created_at) as avg_click_time
FROM magic_link_tokens
WHERE used = TRUE;
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Verify Resend domain (add DNS records)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Set `secure: true` for cookies in production
- [ ] Enable Supabase RLS policies
- [ ] Add rate limiting
- [ ] Set up monitoring/alerts
- [ ] Test with real email (not test mode)
- [ ] Add GDPR compliance notice
- [ ] Implement email unsubscribe flow
- [ ] Set up automated token cleanup cron job

---

## 📚 Additional Resources

- **Resend Docs:** https://resend.com/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Next.js Cookies:** https://nextjs.org/docs/app/api-reference/functions/cookies

---

## ✅ Summary

**Files Created:**
1. `/api/auth/magic-link/route.ts` - Sends magic links
2. `/api/auth/verify/route.ts` - Verifies tokens
3. `/auth/verify/page.tsx` - Verification UI
4. `magic-link-modal.tsx` - Updated modal
5. `subscribe/page.tsx` - Fixed redirect handling

**Database Tables:**
1. `magic_link_tokens` - Temporary auth tokens
2. `users` - User accounts
3. `sessions` - Active sessions

**Flow:**
Email → Token → Verify → Session → Redirect to `/subscribe` ✅

---

**Your magic link now properly redirects to `/subscribe`!** 🎉
