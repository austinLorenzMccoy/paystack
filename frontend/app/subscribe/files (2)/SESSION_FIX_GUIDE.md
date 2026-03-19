# 🔧 Quick Fix: Session Not Detected After Magic Link

## 🎯 The Problem

After clicking magic link and getting verified:
- ✅ User is redirected to `/subscribe`
- ❌ Page shows "Not logged in" instead of "Logged in"
- ❌ Subscription enrollment doesn't activate

---

## 🔍 Root Cause

The `/subscribe` page checks auth on mount, but the session cookie hasn't been read yet from the verification response.

---

## ✅ Solution (3 Files)

### **File 1: Session Check API**
**Location:** `app/api/auth/session/route.ts`

```typescript
// Copy contents from session-check-api.ts
```

This endpoint:
- Reads the `x402pay_session` cookie
- Validates it against database
- Returns user data if valid
- Clears cookie if expired

---

### **File 2: Updated Subscribe Page**
**Location:** `app/subscribe/page.tsx`

```typescript
// Replace with contents from subscribe-page-final-fix.tsx
```

Key changes:
1. ✅ Added `credentials: 'include'` to all fetch calls (sends cookies)
2. ✅ Added console logs for debugging
3. ✅ Auth check runs on mount and every 30 seconds
4. ✅ `handleMagicLinkSuccess` forces immediate re-check
5. ✅ Button text changes based on auth state
6. ✅ Shows debug info in development mode

---

## 🚀 Implementation Steps

### **Step 1: Create Session API**
```bash
# Create file
touch app/api/auth/session/route.ts

# Copy contents from session-check-api.ts
```

### **Step 2: Replace Subscribe Page**
```bash
# Backup current
cp app/subscribe/page.tsx app/subscribe/page.tsx.backup

# Replace with fix
cp subscribe-page-final-fix.tsx app/subscribe/page.tsx
```

### **Step 3: Test**
```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000/subscribe
```

---

## 🧪 Testing Flow

### **Test 1: Magic Link Login**
```
1. Go to /subscribe
2. Click "Sign In to Subscribe"
3. Enter email
4. Click magic link in email
5. ✅ Should see verification spinner
6. ✅ Should redirect to /subscribe
7. ✅ Should show "✅ user@email.com" in status
8. ✅ Button should say "Connect Wallet"
```

### **Test 2: Connect Wallet**
```
1. After magic link success
2. Click "Connect Wallet"
3. Approve in Xverse/Leather
4. ✅ Should show "✅ Ready to subscribe: user@email.com"
5. ✅ Button should say "Start Subscription"
```

### **Test 3: Start Subscription**
```
1. After wallet connected
2. Click "Start Subscription"
3. ✅ Should open enrollment dialog
4. ✅ Should allow subscription creation
```

---

## 🐛 Debugging

### **Check Console Logs**

You'll see these logs in browser console:

```
🔍 Checking authentication...
📧 Auth response: { authenticated: true, user: {...} }
✅ User authenticated: user@email.com
🔄 Fetching subscription...
📊 Subscription response: { subscription: {...} }
```

If you see:
```
❌ Not authenticated
```

Then the cookie isn't being sent. Check:

1. **Cookie exists:**
   - Open DevTools → Application → Cookies
   - Look for `x402pay_session`
   - Check it has a value

2. **Credentials are included:**
   ```typescript
   fetch('/api/auth/session', {
     credentials: 'include' // ← Must be present
   })
   ```

3. **Cookie settings in verify API:**
   ```typescript
   cookieStore.set("x402pay_session", sessionToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax",
     path: "/",
   });
   ```

---

### **Common Issues**

#### **Issue 1: Cookie Not Set**

**Check:** Auth verify API logs
```typescript
// In auth/verify/route.ts
console.log('Setting cookie:', sessionToken);
```

**Fix:** Make sure `cookies()` is awaited
```typescript
const cookieStore = await cookies(); // ← await is required
```

---

#### **Issue 2: Cookie Not Sent**

**Check:** Network tab
- Open DevTools → Network
- Click on `/api/auth/session` request
- Check Headers → Request Headers
- Look for `Cookie: x402pay_session=...`

**Fix:** Add credentials
```typescript
fetch('/api/auth/session', {
  credentials: 'include' // ← Required
})
```

---

#### **Issue 3: Session Expired**

**Check:** Database
```sql
SELECT * FROM sessions 
WHERE token = 'your-token-here'
  AND expires_at > NOW();
```

**Fix:** Session might have expired. Try logging in again.

---

#### **Issue 4: Auth Check Not Running**

**Check:** Console logs
- Should see "🔍 Checking authentication..."
- If not, useEffect isn't running

**Fix:** Make sure no errors in component
```typescript
useEffect(() => {
  checkAuth(); // Should run on mount
}, []); // Empty deps array
```

---

## 🎯 Expected Behavior

### **Before Magic Link:**
```
Status: Wallet: Not connected • Auth: ❌ Not logged in
Button: "Sign In to Subscribe"
```

### **After Magic Link (No Wallet):**
```
Status: Wallet: Not connected • Auth: ✅ user@email.com
Button: "Connect Wallet"
```

### **After Wallet Connected:**
```
Status: Wallet: SP2ABC...XYZ • Auth: ✅ user@email.com
Button: "Start Subscription"
Message: "✅ Ready to subscribe: user@email.com"
```

### **After Starting Subscription:**
```
Dialog Opens: "Subscription Enrollment"
User can: Choose plan, deposit escrow, enable auto-stack
```

---

## 📊 Debug Panel (Development Mode)

The updated page includes a debug panel that only shows in development:

```
Auth: ✅ Logged in | User: user@email.com | Wallet: SP2ABC...XYZ
```

This helps you see exactly what's happening.

**To remove in production:**
```typescript
// The debug panel only shows when:
{process.env.NODE_ENV === 'development' && (
  // Debug info here
)}
```

---

## ✅ Checklist

Before testing:
- [ ] Created `/api/auth/session/route.ts`
- [ ] Updated `/app/subscribe/page.tsx`
- [ ] Restarted dev server
- [ ] Cleared browser cookies
- [ ] Opened incognito window (fresh start)

Test flow:
- [ ] Magic link login works
- [ ] Redirect to /subscribe works
- [ ] Auth status shows logged in
- [ ] Wallet connection works
- [ ] Enrollment dialog opens
- [ ] Can create subscription

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Console shows "✅ User authenticated: user@email.com"
2. ✅ Status bar shows "Auth: ✅ user@email.com"
3. ✅ Button says "Connect Wallet" (not "Sign In")
4. ✅ After wallet connect, button says "Start Subscription"
5. ✅ Clicking button opens enrollment dialog

---

## 🚨 If Still Not Working

### **Nuclear Option: Clear Everything**

```bash
# 1. Clear browser cookies
# DevTools → Application → Cookies → Delete all

# 2. Clear database
SELECT * FROM sessions; -- Check sessions
DELETE FROM sessions;    -- Clear all

SELECT * FROM magic_link_tokens; -- Check tokens
DELETE FROM magic_link_tokens;    -- Clear all

# 3. Restart dev server
npm run dev

# 4. Try fresh magic link
```

### **Check All Files**

Make sure you have:
- ✅ `/api/auth/magic-link/route.ts` (sends email)
- ✅ `/api/auth/verify/route.ts` (verifies token, creates session)
- ✅ `/api/auth/session/route.ts` (checks session) ← NEW
- ✅ `/auth/verify/page.tsx` (verification UI)
- ✅ `/subscribe/page.tsx` (updated with session detection)

---

## 💡 Key Insight

The fix is simple:
1. Magic link creates session + sets cookie ✅
2. Subscribe page needs to READ that cookie ✅
3. Must use `credentials: 'include'` in fetch ✅
4. Must check auth on mount and after magic link ✅

That's it! The updated files do all of this. 🚀
