# Authentication and Comment Issues - Test Report

## Date: February 9, 2026

## Issues Found

### 1. Demo Login Fails (CRITICAL)
**Status:** ❌ Broken

**Problem:**
- The login page tries to authenticate demo accounts using `loginWithPassword()`
- Demo credentials are hardcoded: `ahmad.demo@example.com` / `DemoPass123!`
- These accounts don't exist in the PocketBase database
- Authentication fails with HTTP 400: "Failed to authenticate"

**Evidence from Chrome DevTools:**
```
POST https://pb-aduje.muaz.app/api/collections/users/auth-with-password
Status: 400
Request Body: {"identity":"ahmad.demo@example.com","password":"DemoPass123!"}
Response: {"data":{},"message":"Failed to authenticate.","status":400}
```

**Console Error:**
```
Demo login error: ClientResponseError 400
```

**User Impact:**
- Cannot login with demo accounts
- Toast shows: "Gagal log masuk dengan akaun demo. Sila cuba lagi."

---

### 2. Header Shows "Log Masuk" Even After Login Attempt
**Status:** ❌ Broken

**Problem:**
- Header checks `pb.authStore.isValid && user !== null` to determine if authenticated
- Since demo login fails, `pb.authStore.isValid` remains `false`
- Header continues to show "Log masuk" button instead of user avatar

**Code Location:** `components/header.tsx:21`

---

### 3. Comments Cannot Be Posted Without Authentication
**Status:** ✅ Working as designed (but user experience is poor)

**Problem:**
- The `handleComment` function has: `if (!commentText.trim() || !user) return`
- If no user is logged in, clicking send button does NOTHING
- No error message shown
- No visual feedback
- Text remains in textarea
- Button appears enabled but doesn't work

**Code Location:** `app/report/[id]/page.tsx:154`

**User Impact:**
- Confusing UX - button seems to work but nothing happens
- No indication that login is required

---

### 4. Auth State Not Properly Persisted
**Status:** ❌ Broken

**Problem:**
- Demo login in old code only updated Zustand store
- Did not create PocketBase auth session
- No cookies/tokens stored
- Page refresh would lose authentication

**Evidence:**
- Old code: `setUser(user)` without calling PocketBase auth methods
- New code tries to fix this with `loginWithPassword()` but users don't exist

---

## Root Cause

The demo users in the PocketBase database:
- IDs: `8efbtzvs6n5trlb`, `mtrqjap38siytx4`, `g7opde7xrwufmp2`, `ruz4c7tblklk00k`, `x02up1iaqsltg7q`
- Have names like: `Pengguna` (generic "User")
- Have points: 780, 560, 450, 320, 195
- **DO NOT have email addresses visible** (possibly hidden or not set)
- **DO NOT have passwords** that match the hardcoded credentials

## Solutions Required

### Solution 1: Create Proper Demo Users (Recommended)
1. Create new users in PocketBase with known credentials:
   - `ahmad.demo@example.com` / `DemoPass123!`
   - `siti.demo@example.com` / `DemoPass123!`
   - `kumar.demo@example.com` / `DemoPass123!`
   - `lim.demo@example.com` / `DemoPass123!`

2. These users need:
   - Valid email addresses
   - Passwords set via PocketBase admin panel or API
   - Names, avatarSeeds, points, badges configured

3. Update the demo user data to match

### Solution 2: Use Existing Users (Quick Fix)
1. Fetch the actual user IDs from the database
2. Skip password authentication for demo mode
3. Use a special "demo authentication" bypass
4. **Security Risk**: Only acceptable if clearly marked as demo

### Solution 3: Improve UX for Non-Authenticated Users
1. Show login prompt when trying to comment without auth
2. Disable comment textarea with placeholder: "Log masuk untuk komen"
3. Add visual indicator on all auth-required actions
4. Redirect to login page with return URL

## Files Modified

1. `lib/auth-utils.ts` - Created new authentication utilities
2. `app/login/page.tsx` - Updated to use proper auth methods
3. `components/header.tsx` - Fixed auth state check
4. `components/app-shell.tsx` - Improved auth initialization

## Next Steps

1. **Create demo users** using the admin panel or API
2. **Test authentication flow** end-to-end
3. **Add better UX** for non-authenticated comment attempts
4. **Add auth state debugging** to console in development mode
5. **Document demo credentials** for testers

## Test Script Results

All test scripts confirmed the authentication failure:
- `test-auth-comment.js` - Shows auth token missing
- `test-pb-connection.js` - Admin auth fails, users have no visible emails
- `test-comment-flow.js` - Cannot test without valid credentials

## Browser Test Results (Chrome DevTools MCP)

1. ✅ Login page loads correctly
2. ✅ Shows 4 demo accounts with avatars
3. ❌ Clicking demo account fails with 400 error
4. ✅ Error toast shown to user
5. ✅ Report page loads correctly
6. ✅ Comment textarea accepts input
7. ❌ Send button does nothing when not authenticated
8. ❌ No error message shown for comment attempt
9. ✅ Header correctly shows "Log masuk" when not authenticated

## Recommendations

**Priority 1 (Critical):**
- Create proper demo users with working credentials
- Test full authentication flow

**Priority 2 (High):**
- Add "Please sign in to comment" message
- Disable comment UI when not authenticated
- Show login button in comment section

**Priority 3 (Medium):**
- Add loading states to comment submission
- Add success/error feedback for all actions
- Improve auth state synchronization

**Priority 4 (Low):**
- Add session persistence across page reloads
- Add auth token refresh mechanism
- Add "Remember me" option
