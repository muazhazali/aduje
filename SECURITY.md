# Security Documentation

This document outlines the security measures implemented in the AduJe application.

## Security Features Implemented

### 1. Security Headers

The application implements comprehensive security headers to protect against common web attacks:

#### Content Security Policy (CSP)
- Restricts resource loading to trusted sources
- Prevents inline script execution (except where necessary for development)
- Blocks unauthorized external resources
- Configured in `next.config.mjs`

#### Other Security Headers
- **X-Frame-Options**: `SAMEORIGIN` - Prevents clickjacking attacks
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-XSS-Protection**: `1; mode=block` - Enables browser XSS protection
- **Strict-Transport-Security**: Forces HTTPS connections
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### 2. Input Sanitization

All user inputs are sanitized to prevent XSS and injection attacks:

- **HTML Sanitization**: Removes dangerous HTML tags and scripts
- **URL Validation**: Only allows http/https protocols
- **File Upload Validation**: 
  - Validates file types (only images: jpeg, png, webp)
  - Enforces file size limits (5MB max)
  - Sanitizes filenames to prevent path traversal
- **Coordinate Validation**: Ensures geographic coordinates are within valid ranges
- **Category/Status Validation**: Whitelist-based validation

Implementation: `lib/sanitize.ts`

### 3. Rate Limiting

Protection against brute force and DoS attacks:

- **Global Rate Limit**: 100 requests per minute per IP
- **Applied to**: API routes, POST/PUT/DELETE requests
- **Implementation**: `middleware.ts`
- **Note**: For production, consider using Redis for distributed rate limiting

### 4. CSRF Protection

Cross-Site Request Forgery protection:

- Token-based CSRF protection for form submissions
- Tokens stored in session storage
- Validation on sensitive operations
- Implementation: `lib/csrf.ts`

### 5. Authentication Security

- **OAuth2 Support**: Google OAuth integration
- **Session Management**: PocketBase handles secure session tokens
- **Password Requirements**: Enforced by demo credentials
- **No Credentials in Code**: Environment variables for sensitive data

### 6. Data Validation

Comprehensive validation for all user inputs:

- Title: Max 100 characters
- Description: Max 1000 characters
- Comments: Max 500 characters
- Category: Whitelist validation
- Status: Whitelist validation
- Coordinates: Range validation (-90 to 90 lat, -180 to 180 lng)

### 7. Secure File Handling

- File type validation
- File size limits
- Sanitized filenames
- Secure storage via PocketBase

### 8. Environment Variables

Sensitive configuration is stored in environment variables:

- `.env.local` - Local development (gitignored)
- `.env.example` - Template without sensitive data
- Vercel environment variables for production

## Deployment Security (Vercel)

### Environment Variables Setup

1. In Vercel Dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com
   POCKETBASE_URL=https://your-pocketbase-url.com
   POCKETBASE_SU_EMAIL=your-admin-email
   POCKETBASE_SU_PASSWORD=your-secure-password
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. Never commit `.env.local` or actual credentials to git

### Vercel Configuration

The `vercel.json` file includes:
- Security headers configuration
- Environment variable references

## Security Best Practices

### For Developers

1. **Never commit sensitive data**
   - Use `.env.local` for local secrets
   - Add sensitive files to `.gitignore`
   - Use environment variables in production

2. **Always sanitize user input**
   - Use `sanitizeUserInput()` for text content
   - Use `sanitizeHTML()` for HTML content
   - Validate all inputs before processing

3. **Validate on both client and server**
   - Client-side validation for UX
   - Server-side validation for security

4. **Keep dependencies updated**
   - Regular security audits: `pnpm audit`
   - Update vulnerable packages promptly

5. **Use HTTPS everywhere**
   - Enforce HTTPS in production
   - Configure HSTS headers

### For Administrators

1. **Regular Security Audits**
   - Review logs for suspicious activity
   - Monitor rate limit violations
   - Check for XSS/injection attempts

2. **PocketBase Security**
   - Use strong admin passwords
   - Enable 2FA if available
   - Regular backups
   - Keep PocketBase updated

3. **Monitor and Respond**
   - Set up error monitoring (e.g., Sentry)
   - Configure alerts for security events
   - Have an incident response plan

## Known Limitations

1. **Rate Limiting**: Current implementation uses in-memory storage. For production at scale, implement Redis-based rate limiting.

2. **CSRF Protection**: Basic implementation. For enhanced security, consider server-side CSRF token validation.

3. **File Upload**: Files are validated client-side. Implement additional server-side validation in PocketBase rules.

## Reporting Security Issues

If you discover a security vulnerability, please email: tikushijo@gmail.com

**Do not** open public issues for security vulnerabilities.

## Security Checklist for Deployment

- [ ] All environment variables configured in Vercel
- [ ] `.env.local` not committed to git
- [ ] HTTPS enforced
- [ ] Security headers verified (use securityheaders.com)
- [ ] CSP policy tested and working
- [ ] Rate limiting tested
- [ ] Input sanitization verified
- [ ] File upload restrictions tested
- [ ] Authentication flow tested
- [ ] PocketBase security rules configured
- [ ] Admin credentials are strong and secure
- [ ] Error monitoring configured
- [ ] Regular backups scheduled

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [PocketBase Security](https://pocketbase.io/docs/security/)
- [Vercel Security](https://vercel.com/docs/security)

## Last Updated

February 10, 2026
