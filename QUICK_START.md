# PocketBase Quick Start Guide

## One-Command Setup

```bash
npm run pb:reset
```

This command will:
1. ✅ Delete existing collections
2. ✅ Create all collections with proper schemas
3. ✅ Seed with test data  
4. ✅ Verify everything works

## Verify Everything Works

```bash
npm run pb:test
```

Expected output: `✅ ALL TESTS PASSED!`

## Test Login Credentials

**Default Password:** `Password123!`

**Test Users:**
- ahmad@gmail.com
- siti@gmail.com
- raj@gmail.com
- mei@gmail.com
- ali@gmail.com

**Admin User:**
- tikushijo@gmail.com (isAdmin: true)

## PocketBase Admin UI

**URL:** https://pb-aduje.muaz.app/_/

**Login:**
- Email: tikushijo@gmail.com
- Password: Muazoreo123!

## Available Commands

```bash
npm run pb:schema   # Create/update schemas only
npm run pb:seed     # Seed test data only
npm run pb:verify   # Verify data exists
npm run pb:test     # Run API integration tests
npm run pb:reset    # Complete reset (recommended)
```

## Test Data Included

### 6 Users
- Realistic Malaysian names
- Points: 195-1200
- Badges: 1-3 per user
- 1 admin user

### 6 Reports
- Locations: KL, Petaling Jaya, Shah Alam
- Categories: Roads, lighting, garbage, drains, etc.
- Statuses: Draft, Open, Acknowledged, In Progress, Closed
- GPS coordinates included

### 5 Comments
- Distributed across reports
- Includes reactions (like, support, urgent)
- Some with nested replies

### 3 Notifications
- Different types: upvote, comment, badge
- Linked to users and reports

## What's Next?

1. ✅ **PocketBase is ready** - Database set up and verified
2. 🔨 **Build your Next.js app** - Connect to PocketBase
3. 🧪 **Use test data** - 6 users, 6 reports, 5 comments ready
4. 📱 **Follow the PRD** - Implement features as specified

## Need Help?

- **Full documentation:** `scripts/README.md`
- **Complete summary:** `POCKETBASE_SETUP_SUMMARY.md`
- **Debug data:** `node scripts/debug-data.js`
- **PocketBase docs:** https://pocketbase.io/docs/

## Status

✅ Collections Created  
✅ Data Seeded  
✅ Tests Passed  
✅ Ready for Development  

---

**Quick Reference - Keep This Handy!**
