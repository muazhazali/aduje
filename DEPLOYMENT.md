# Deployment Guide for Vercel

This guide will help you securely deploy the AduJe application to Vercel.

## Pre-Deployment Checklist

### 1. Environment Variables

Before deploying, ensure you have the following environment variables ready:

- `NEXT_PUBLIC_POCKETBASE_URL` - Your PocketBase instance URL (public)
- `POCKETBASE_URL` - Your PocketBase instance URL (server-side)
- `POCKETBASE_SU_EMAIL` - Admin email (keep secret)
- `POCKETBASE_SU_PASSWORD` - Admin password (keep secret)
- `NEXT_PUBLIC_APP_URL` - Your production domain

### 2. Security Review

- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Ensure no credentials are committed to git
- [ ] Review `SECURITY.md` for all security measures
- [ ] Test all security headers locally
- [ ] Verify input sanitization is working
- [ ] Test file upload restrictions
- [ ] Verify rate limiting is functional

## Deployment Steps

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `aduje` repository

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_POCKETBASE_URL=https://pb-aduje.muaz.app
POCKETBASE_URL=https://pb-aduje.muaz.app
POCKETBASE_SU_EMAIL=your-admin-email@example.com
POCKETBASE_SU_PASSWORD=your-secure-password
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important**: 
- Add these for all environments (Production, Preview, Development)
- Never share these values publicly
- Use strong passwords for admin accounts

### Step 4: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (or `npm install`)
- **Node Version**: 18.x or higher

### Step 5: Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment Verification

### 1. Test Security Headers

Visit [securityheaders.com](https://securityheaders.com) and enter your domain to verify headers are correctly set.

Expected headers:
- ✅ Content-Security-Policy
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Strict-Transport-Security
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 2. Test Core Functionality

- [ ] Homepage loads correctly
- [ ] User can log in (OAuth and demo accounts)
- [ ] User can create a report
- [ ] User can upload images (max 5MB, valid types only)
- [ ] User can comment on reports
- [ ] Map functionality works
- [ ] Leaderboard displays correctly
- [ ] Search and filters work

### 3. Test Security Features

#### XSS Protection Test
Try entering these in comment/report fields (should be sanitized):
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
javascript:alert('XSS')
```

All should be rendered as plain text, not executed.

#### File Upload Test
- Try uploading a non-image file (should be rejected)
- Try uploading a file > 5MB (should be rejected)
- Try uploading valid images (should work)

#### Rate Limiting Test
- Make rapid requests (>100 in 1 minute)
- Should receive 429 Too Many Requests error

### 4. Monitor Console

Open browser DevTools → Console and check for:
- ❌ No JavaScript errors
- ❌ No CSP violations
- ❌ No mixed content warnings
- ❌ No 404 errors for critical resources

### 5. Test on Mobile

- Open on mobile device
- Verify PWA installation works
- Test touch interactions
- Verify responsive design

## Troubleshooting

### Build Fails

**Error**: TypeScript errors
- Check `next.config.mjs` has `ignoreBuildErrors: true` (temporary)
- Fix TypeScript errors for production

**Error**: Missing environment variables
- Verify all required env vars are set in Vercel
- Check spelling and formatting

### Runtime Errors

**Error**: PocketBase connection fails
- Verify `NEXT_PUBLIC_POCKETBASE_URL` is correct
- Check PocketBase instance is running and accessible
- Verify CORS settings in PocketBase

**Error**: Images not loading
- Check PocketBase file storage is configured
- Verify image URLs in network tab
- Check CSP allows PocketBase domain

### Security Header Issues

**CSP Violations**
- Check browser console for specific violations
- Update CSP in `next.config.mjs` to allow necessary domains
- Test thoroughly after changes

**Mixed Content Warnings**
- Ensure all resources use HTTPS
- Update any HTTP URLs to HTTPS
- Check external resources (maps, analytics)

## Performance Optimization

### 1. Enable Caching

Vercel automatically caches static assets. For dynamic content:

```typescript
// In your API routes or pages
export const revalidate = 60 // Revalidate every 60 seconds
```

### 2. Image Optimization

Images are automatically optimized by Next.js. Ensure:
- Images use Next.js `<Image>` component where possible
- Remote image domains are configured in `next.config.mjs`

### 3. Analytics

Consider adding:
- Vercel Analytics (built-in)
- Error tracking (Sentry)
- Performance monitoring

## Maintenance

### Regular Tasks

**Weekly**:
- Check error logs in Vercel dashboard
- Review security headers with securityheaders.com
- Monitor rate limit violations

**Monthly**:
- Update dependencies: `pnpm update`
- Run security audit: `pnpm audit`
- Review and rotate admin credentials if needed
- Check PocketBase backups

**Quarterly**:
- Full security audit
- Review and update CSP policy
- Test disaster recovery procedures
- Update documentation

## Rollback Procedure

If issues occur after deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Investigate and fix issues
5. Redeploy when ready

## Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### 2. Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Configure SSL

Vercel automatically provisions SSL certificates via Let's Encrypt.

### 4. Update OAuth Callbacks

If using Google OAuth, update redirect URIs in Google Cloud Console:
```
https://yourdomain.com/api/auth/callback/google
```

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- PocketBase Docs: https://pocketbase.io/docs

For security concerns:
- Email: tikushijo@gmail.com
- See `SECURITY.md` for details

## Success Criteria

Your deployment is successful when:

✅ All pages load without errors
✅ Security headers score A+ on securityheaders.com
✅ No console errors or warnings
✅ All features work as expected
✅ Rate limiting is functional
✅ Input sanitization prevents XSS
✅ File uploads are validated
✅ Authentication works correctly
✅ Mobile experience is smooth
✅ PWA installation works

---

**Last Updated**: February 10, 2026
