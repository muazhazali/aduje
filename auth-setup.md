Google Auth Setup (PocketBase)
Based on PocketBase docs (Context7):

1. Create Google OAuth credentials
   - Google Cloud Console → Credentials → Create OAuth client (Web application).
   - Add Authorized JavaScript origins:
     - http://localhost:3000
     - https://your-production-domain
   - Add Authorized redirect URIs:
     - Use the exact redirect URL shown in PocketBase Admin under
       Settings → Auth providers → Google (PocketBase generates it).

2. Enable Google provider in PocketBase
   - PocketBase Admin → Settings → Auth providers → Google.
   - Paste Client ID and Client Secret.
   - Save.

3. Front-end OAuth (JS SDK popup flow)
   - Use PocketBase JS SDK `authWithOAuth2` (already wired in `app/login/page.tsx`).
   - Example:
     await pb.collection("users").authWithOAuth2({
       provider: "google",
       scopes: ["email", "profile"],
       createData: { name: "Nama Pengguna", emailVisibility: false },
     })
   - After success: `pb.authStore.isValid` and `pb.authStore.record`.

4. Alternative: redirect flow (code exchange)
   - Use `listAuthMethods()` to get provider auth URLs.
   - Redirect to provider authURL + your redirectURL.
   - On the redirect handler, call:
     pb.collection("users").authWithOAuth2Code(
       "google",
       code,
       codeVerifier,
       redirectURL,
       { name: "Nama Pengguna" }
     )

5. Troubleshooting
   - If popup is blocked (Safari), make sure the click handler is not async.
   - Ensure the redirect URL in Google Console exactly matches the one in PocketBase.
