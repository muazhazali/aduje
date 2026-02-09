# PocketBase Setup Scripts

This folder contains scripts to set up and seed your PocketBase database for the Aduje community reporter application.

## Scripts Overview

### 1. `pocketbase-schema.js`
Creates or updates collection schemas in PocketBase with proper field definitions.

**Usage:**
```bash
npm run pb:schema
# or
node scripts/pocketbase-schema.js
```

**What it does:**
- Creates `users` auth collection with custom fields (avatarSeed, points, badges, isAdmin, etc.)
- Creates `reports`, `comments`, `notifications`, `audit_logs`, and `flags` base collections
- Defines all field types, constraints, and relations according to PRD requirements

### 2. `pocketbase-seed.js`
Seeds the database with initial test data.

**Usage:**
```bash
npm run pb:seed
# or
node scripts/pocketbase-seed.js
```

**What it does:**
- Creates 6 test users (including admin)
- Creates 6 sample reports across different Malaysian locations
- Creates 5 comments on various reports
- Creates 3 sample notifications
- Sets up relationships (followers, upvotes, etc.)

**Default Password:** All seeded users have password `Password123!`

**Test Users:**
- ahmad@gmail.com (450 points, 2 badges)
- siti@gmail.com (780 points, 3 badges)
- raj@gmail.com (320 points, 1 badge)
- mei@gmail.com (195 points, 1 badge)
- ali@gmail.com (560 points, 2 badges)
- Your admin email from `.env.local` (1200 points, 3 badges, isAdmin: true)

### 3. `recreate-collections.js`
Deletes and recreates all collections from scratch with proper schemas.

**Usage:**
```bash
node scripts/recreate-collections.js
```

**⚠️ Warning:** This will DELETE all existing data in reports, comments, notifications, audit_logs, and flags collections!

**When to use:**
- Initial setup of a fresh PocketBase instance
- When you need to completely reset the database schema
- After major schema changes that can't be migrated

### 4. `verify-data.js`
Verifies that data was successfully seeded into PocketBase.

**Usage:**
```bash
node scripts/verify-data.js
```

**What it shows:**
- Lists all collections and confirms they exist
- Shows total count of users, reports, comments, and notifications
- Displays sample data from each collection
- Provides link to PocketBase admin UI

### 5. `test-api.js`
Comprehensive API integration test to verify all functionality.

**Usage:**
```bash
npm run pb:test
# or
node scripts/test-api.js
```

**What it tests:**
- Admin authentication
- User authentication (with seeded test account)
- Querying users, reports, comments, notifications
- Filtering by category, status, and location
- Relations and expansions
- Create and delete operations
- All tests must pass to confirm database is working correctly

### 6. `debug-data.js`
Debugging tool to inspect raw data structure.

**Usage:**
```bash
node scripts/debug-data.js
```

**What it shows:**
- Raw JSON of first user and report records
- Complete collection field definitions
- Useful for troubleshooting schema issues

## Setup Instructions

### Prerequisites
1. PocketBase instance running (local or hosted)
2. Super admin account created in PocketBase
3. Environment variables configured

### Step 1: Configure Environment Variables

Create or update `.env.local` in the project root:

```env
POCKETBASE_URL=https://your-pocketbase-url.com
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com
POCKETBASE_SU_EMAIL=your-admin@email.com
POCKETBASE_SU_PASSWORD=your-secure-password
```

**Note:** For local development, use `http://127.0.0.1:8090`

### Step 2: Run Setup Scripts

#### Option A: Fresh Setup (Recommended - One Command)
```bash
npm run pb:reset
```

This will:
1. Recreate all collections with proper schemas
2. Seed with test data
3. Verify everything worked

#### Option A (Manual Steps)
```bash
# 1. Recreate all collections with proper schemas
node scripts/recreate-collections.js

# 2. Seed with test data
npm run pb:seed

# 3. Verify everything worked
node scripts/verify-data.js

# 4. Run comprehensive API tests
npm run pb:test
```

#### Option B: Update Existing Setup
```bash
# 1. Update schemas only (preserves existing data)
npm run pb:schema

# 2. Seed additional test data
npm run pb:seed

# 3. Verify
node scripts/verify-data.js
```

### Step 3: Access PocketBase Admin UI

Visit your PocketBase admin UI at:
```
https://your-pocketbase-url.com/_/
```

Login with your super admin credentials and verify:
- Collections exist: users, reports, comments, notifications, audit_logs, flags
- Each collection has the correct fields
- Sample data is populated

## Seed Data Details

### Reports
The seed creates 6 diverse reports across Malaysia:
1. **Pothole** - Jalan Ampang near KLCC (Open)
2. **Broken streetlight** - Taman Desa (Acknowledged)
3. **Garbage pile** - Pasar Chow Kit (In Progress)
4. **Blocked drain** - Bangsar South (Closed)
5. **Vandalism** - Taman Jaya playground (Open)
6. **Stray animals** - Shah Alam (Open)

Each report includes:
- Realistic Malaysian locations with GPS coordinates
- Malay/English descriptions
- Proper categorization
- Upvotes from multiple users
- Follower relationships

### Collection Rules

All collections are created with **open rules** for development:
```javascript
{
  listRule: "",
  viewRule: "",
  createRule: "",
  updateRule: "",
  deleteRule: ""
}
```

**⚠️ Security Warning:** These open rules are for DEVELOPMENT ONLY. Before deploying to production, you MUST:

1. Restrict user collection access
2. Add authentication rules for reports, comments, notifications
3. Limit admin actions to admin users only
4. Set proper view/edit permissions

See the PRD for production security requirements.

## Troubleshooting

### Authentication Errors
```
Error: Missing POCKETBASE_URL, POCKETBASE_SU_EMAIL, or POCKETBASE_SU_PASSWORD
```
**Solution:** Ensure `.env.local` has all required variables

### Collection Not Found
```
ClientResponseError 404: The requested resource wasn't found.
```
**Solution:** Run `recreate-collections.js` to create missing collections

### Field Validation Errors
```
Failed to update collection: validation errors
```
**Solution:** Delete the collection and use `recreate-collections.js` to start fresh

### Seed Script Hangs
If the seed script appears to hang, it's likely creating records. It can take 20-30 seconds depending on your connection to PocketBase.

## Data Model Reference

### Users Collection (Auth)
- email, password (built-in auth fields)
- avatarSeed (text) - for Boring Avatars generation
- points (number) - gamification points
- badges (json array) - earned badges: ["pemula", "penolong", "penyelesai"]
- isPublic (bool) - profile visibility
- isBanned (bool) - moderation status
- isAdmin (bool) - admin designation
- warnings (number) - warning count

### Reports Collection (Base)
- title (text, max 100)
- description (text, max 1000)
- category (select) - 10 Malaysian-relevant categories
- photos (file, max 5) - images up to 5MB each
- latitude, longitude (number) - GPS coordinates
- address, landmark (text) - location details
- status (select) - draft/open/acknowledged/in_progress/closed
- createdBy (relation to users)
- followers, upvotes, confirmations, flaggedBy (relations to users)
- upvoteCount, confirmationCount, flagCount (numbers)
- isHidden, commentsLocked (bool)

### Comments Collection (Base)
- reportId (relation to reports)
- userId (relation to users)
- content (text, max 500)
- photos (file, max 3)
- parentId (relation to comments) - for nested replies
- reactions (json) - {like: [], support: [], urgent: []}
- isHidden (bool)

### Notifications Collection (Base)
- userId (relation to users)
- type, title, message (text)
- relatedReportId (relation to reports, optional)
- relatedCommentId (relation to comments, optional)
- isRead (bool)

### Audit Logs Collection (Base)
- adminId (relation to users)
- action, targetType, targetId, details, reason (text)

### Flags Collection (Base)
- reportId, commentId (relations, optional - one must be set)
- flaggedBy (relation to users)
- reason, status (text)
- reviewedBy (relation to users, optional)

## NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "pb:schema": "node scripts/pocketbase-schema.js",
    "pb:seed": "node scripts/pocketbase-seed.js",
    "pb:verify": "node scripts/verify-data.js",
    "pb:reset": "node scripts/recreate-collections.js && node scripts/pocketbase-seed.js"
  }
}
```

## Advanced Usage

### Custom Seed Data

Edit `scripts/seed-data.json` to customize the seed data. The structure matches the collection schemas.

Example:
```json
{
  "users": [
    {
      "email": "newuser@example.com",
      "name": "New User",
      "points": 100,
      "badges": ["pemula"]
    }
  ],
  "reports": [ ... ]
}
```

After editing, run:
```bash
npm run pb:seed
```

### Environment-Specific Seeds

Set custom seed data path:
```bash
POCKETBASE_SEED_PATH=./scripts/production-seed.json node scripts/pocketbase-seed.js
```

### Custom User Password

Set a custom password for seeded users:
```bash
POCKETBASE_SEED_PASSWORD=YourPassword123! node scripts/pocketbase-seed.js
```

## Production Deployment

Before deploying to production:

1. **Backup your data:**
   ```bash
   # Use PocketBase backup feature or export data
   ```

2. **Run schema updates:**
   ```bash
   npm run pb:schema
   ```

3. **Do NOT run seed script in production** - it will create test users

4. **Update collection rules** - See security section above

5. **Test thoroughly** - Verify all collections and relationships work

## Support

For issues or questions:
- Check PocketBase logs in the admin UI
- Run `node scripts/debug-data.js` to inspect data
- Review PocketBase documentation: https://pocketbase.io/docs/

---

**Last Updated:** February 9, 2026  
**Compatible with:** PocketBase v0.26.x, Node.js v16+
