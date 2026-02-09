# Project Requirement Document
## Local Community Problem Reporter PWA

**Deadline:** Saturday, 14 February 2026 at 03:59 PM MYT  
**Budget:** RM500  
**Target Users:** Malaysian communities (multiple states)  
**Expected Concurrent Users:** ~10 during judging phase

---

## 1. Executive Summary

A Progressive Web Application (PWA) that enables Malaysian communities to report local issues (potholes, broken streetlights, garbage, etc.), track resolution progress, and foster community engagement through gamification. The platform is public-first, mobile-optimized, and designed for easy deployment within free hosting tiers.

---

## 2. Technical Stack

### 2.1 Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Maps:** Leaflet + OpenStreetMap
- **Avatars:** Boring Avatars (https://github.com/boringdesigners/boring-avatars)
- **PWA:** next-pwa plugin

### 2.2 Backend & Database
- **Backend:** PocketBase (self-hosted)
- **Database:** SQLite (via PocketBase)
- **File Storage:** PocketBase storage
- **Real-time:** PocketBase real-time subscriptions

### 2.3 Deployment
- **Frontend Hosting:** Vercel (Free tier)
- **Backend Hosting:** PocketBase on free tier (Railway/Fly.io/PocketHost)
- **CDN:** Vercel Edge Network
- **Domain:** Provided by Vercel

### 2.4 Authentication
- **Provider:** Google OAuth via PocketBase

---

## 3. Core Features & Requirements

### 3.1 User Authentication & Profiles

#### 3.1.1 Google Sign-In
- **MUST HAVE:** OAuth authentication via Google
- Single sign-on flow with PocketBase
- Auto-create user profile on first login
- Session management with secure tokens

#### 3.1.2 User Profile
**Profile Information:**
- Name (from Google account)
- Email (from Google account)
- Avatar (Boring Avatars generated from user ID)
- Points (integer, default: 0)
- Badges (array, default: [])
- Join date
- Activity summary

**Profile Privacy:**
- **Default:** Private
- Users can toggle profile visibility to public
- Public profiles show:
  - Name
  - Avatar
  - Points
  - Badges earned
  - List of user's reports (if profile is public)

**Profile Page Components:**
- Personal stats dashboard
- Points total with breakdown
- Badge showcase (visual display)
- Activity timeline
- Created reports list
- Followed reports list

---

### 3.2 Report Creation & Management

#### 3.2.1 Create Report Flow

**Step 1: Basic Information**
- **Title:** Text input (max 100 characters, required)
- **Description:** Textarea (max 1000 characters, required)
- **Category:** Dropdown select (required)

**Malaysian-Relevant Categories:**
- Jalan Raya (Potholes/Road Damage)
- Lampu Jalan (Streetlights)
- Sampah Sarap (Garbage/Waste)
- Longkang Tersumbat (Blocked Drains)
- Vandalisme (Vandalism)
- Taman & Landskap (Parks & Landscaping)
- Kemudahan Awam (Public Facilities)
- Haiwan Terbiar (Stray Animals)
- Bunyi Bising (Noise Pollution)
- Lain-lain (Others)

**Step 2: Photos**
- **Upload:** Multiple photos (max 5 per report)
- **Format:** JPEG, PNG, WebP
- **Size Limit:** 5MB per photo
- **Compression:** Auto-compress on client-side before upload
- **Optional:** Not required but encouraged

**Step 3: Location**
- **Auto-detect:** Default to user's current location (geolocation API)
- **Manual Entry:** 
  - Text input for address/landmark
  - Interactive map (Leaflet) for pin placement
  - Drag pin to adjust location
- **Data Stored:**
  - Precise coordinates (latitude, longitude)
  - Address/landmark name (if provided)
  - Geocoded address (reverse geocoding via Nominatim)

**Step 4: Duplicate Detection**
- **Auto-check:** System searches for similar reports within 500m radius + same category
- **UI:** Show potential duplicates with:
  - Title
  - Distance
  - Status
  - Photo thumbnail
  - "View Report" and "Upvote Instead" buttons
- **User Action:**
  - Continue creating new report
  - Upvote existing report instead
  - Cancel

**Step 5: Draft System**
- **Save as Draft:** Users can save incomplete reports
- **Draft Storage:** Saved to PocketBase (status: "draft")
- **Offline Draft:** Saved to IndexedDB if offline
- **Auto-save:** Every 30 seconds while editing
- **Publish:** Converts draft to "Open" status

#### 3.2.2 Report Data Model

```typescript
Report {
  id: string
  title: string
  description: string
  category: string
  photos: string[] // URLs
  location: {
    coordinates: { lat: number, lng: number }
    address: string
    landmark: string
  }
  status: "draft" | "open" | "acknowledged" | "in_progress" | "closed"
  createdBy: string // user ID
  createdAt: timestamp
  updatedAt: timestamp
  followers: string[] // user IDs
  upvotes: string[] // user IDs
  upvoteCount: number
  confirmations: string[] // user IDs (for resolution)
  confirmationCount: number
  flagCount: number
  flaggedBy: string[] // user IDs
  isHidden: boolean
  commentsLocked: boolean
}
```

#### 3.2.3 Report Management

**User Permissions:**
- **Delete Own Reports:** 
  - Can delete only if status is "draft" or "open"
  - Cannot delete if status is "acknowledged", "in_progress", or "closed"
- **Edit Own Reports:**
  - Can edit title, description, photos only if status is "draft" or "open"
  - Cannot edit location or category after creation

**Admin Permissions:**
- Change status (open → acknowledged → in_progress → closed)
- Hide/unhide reports
- Lock/unlock comments
- Delete any report
- View all flagged reports

---

### 3.3 Status Flow & Resolution

#### 3.3.1 Status Definitions

1. **Draft** (gray)
   - Initial state when saved as draft
   - Not visible in public feed
   - Only visible to creator

2. **Open** (red/orange)
   - Published and awaiting admin acknowledgment
   - Visible in public feed
   - Community can comment and follow

3. **Acknowledged** (yellow)
   - Admin has seen and acknowledged the issue
   - Confirms the issue is valid
   - May include admin comment with details

4. **In Progress** (blue)
   - Work is actively being done to resolve
   - Admin or relevant authority is working on it
   - Updates expected

5. **Closed** (green)
   - Issue has been resolved
   - Requires community confirmation
   - Final state

#### 3.3.2 Status Change Rules

**Admin-Only Status Changes:**
- Only admins can change status
- Status can only move forward (cannot revert)
- Exception: Admin can reopen "closed" reports if needed

**Community Confirmation for Closure:**
- When admin marks as "closed", it enters "pending confirmation" state
- **Confirmation Requirement:** 
  - Admin confirmation counts (mandatory, implicit)
  - System considers it confirmed immediately
  - Community can still verify by visiting and commenting
- **UI:** Show "✓ Resolved" badge on closed reports

---

### 3.4 Public Feed & Discovery

#### 3.4.1 Feed Display

**Default View: List**
- **Sorting:** Most recent first (createdAt DESC)
- **Pagination:** Infinite scroll
- **Load:** 20 reports per page

**Report Card Components:**
- Thumbnail (first photo, or category icon if no photo)
- Title (truncated to 2 lines)
- Category badge
- Status badge (with color coding)
- Location (address/landmark, truncated)
- Distance from user (if geolocation enabled)
- Upvote count
- Comment count
- Created by (name + avatar)
- Created at (relative time: "2 hours ago")

**Filter Bar:**
- Category (multi-select dropdown)
- Status (multi-select: Open, Acknowledged, In Progress, Closed)
- Location/Nearby (radius slider: 1km, 5km, 10km, 25km, All)
- Sort by: Most Recent, Most Upvoted, Nearest

**Search:**
- Full-text search across title and description
- Search box in header
- Debounced input (300ms)
- Search highlights in results

#### 3.4.2 Map View

**Map Implementation:**
- **Library:** Leaflet with OpenStreetMap tiles
- **Toggle:** Switch button (List ↔ Map)
- **Markers:** Clustered by category and status
- **Marker Colors:** Status-based (Open=red, Acknowledged=yellow, etc.)
- **Popup:** Mini report card on marker click
- **User Location:** Blue dot with accuracy circle
- **Filters:** Same filters apply to map markers

**Map Features:**
- Zoom controls
- Geolocation button (center on user)
- Draw radius tool (search within area)
- Cluster expansion on zoom

---

### 3.5 Report Detail Page

#### 3.5.1 Page Layout

**Header Section:**
- Title
- Status badge (large)
- Category badge
- Created by (avatar, name, points)
- Created at
- Last updated at

**Photo Gallery:**
- Swipeable carousel (if multiple photos)
- Lightbox on click
- Thumbnails below

**Content Section:**
- Full description
- Location map (Leaflet, single pin)
- Address/landmark
- Coordinates (copyable)
- "Get Directions" button (opens Google Maps/Waze)

**Engagement Section:**
- Upvote button (with count)
- Follow button (if not following) / Unfollow button (if following)
- Share button (copy link, share to WhatsApp/Telegram)

**Updates & Comments Section:**
- Timeline view (newest first)
- Nested comments (max 2 levels)
- Comment input (with photo upload)
- Reactions (👍 Like, ❤️ Support, 🔥 Urgent)

**Admin Actions (Admins Only):**
- Change Status dropdown
- Hide/Unhide Report toggle
- Lock/Unlock Comments toggle
- Delete Report button (with confirmation)

#### 3.5.2 Updates & Comments

**Comment Data Model:**
```typescript
Comment {
  id: string
  reportId: string
  userId: string
  content: string
  photos: string[]
  parentId: string | null // for nested replies
  reactions: {
    like: string[] // user IDs
    support: string[]
    urgent: string[]
  }
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Comment Features:**
- **Text Input:** Max 500 characters
- **Photo Upload:** Max 3 photos per comment
- **Nested Replies:** Reply to comments (1 level deep)
- **Reactions:** Users can react with predefined emojis
- **Edit:** Users can edit their own comments (within 5 minutes)
- **Delete:** Users can delete their own comments
- **Moderation:** Admins can delete any comment

**Update Types:**
- User comment/update
- Status change (auto-generated)
- Admin note
- Resolution confirmation

---

### 3.6 Follow System

#### 3.6.1 Follow Mechanics

**Auto-Follow:**
- Report creator is automatically followed on their own report
- Cannot unfollow own reports

**Manual Follow:**
- "Follow" button on report detail page
- "Unfollow" button if already following

**Follow Notifications:**
- New comment/update on followed report
- Status change on followed report
- Resolution confirmation

**Followed Reports List:**
- Accessible from user profile
- Shows all followed reports
- Sorted by latest activity
- Filter by status

---

### 3.7 Gamification System

#### 3.7.1 Points System

**Points Awarded For:**
- **Create Report:** +10 points (when published, not draft)
- **Report Upvoted:** +2 points (per unique upvote)
- **Post Comment/Update:** +5 points
- **Confirm Resolution:** +15 points (admin confirmation on own report)
- **Report Resolved:** +25 points (when your report is closed)
- **Receive Reaction:** +1 point (per unique reaction on comment)

**Points Deducted For:**
- **Report Flagged as Spam:** -10 points (if confirmed by admin)
- **Banned User:** All points reset to 0

**Points Display:**
- User profile (total)
- Leaderboard (public)
- Next to username in comments/reports (compact: "1.2k pts")

#### 3.7.2 Badge System

**3 Core Badges:**

1. **First Report Badge** 🎯
   - **Name:** "Pemula" (Beginner)
   - **Condition:** Create and publish first report
   - **Visual:** Malaysian flag colors (red/yellow/blue)
   - **Description:** "Started making a difference in your community"

2. **Helper Badge** 🤝
   - **Name:** "Penolong" (Helper)
   - **Condition:** Post 5 updates/comments across any reports
   - **Visual:** Hands shaking icon with Malaysian batik pattern
   - **Description:** "Actively engaged in community discussions"

3. **Resolver Badge** ⭐
   - **Name:** "Penyelesai" (Resolver)
   - **Condition:** Have 2 reports marked as "Closed" (resolved)
   - **Visual:** Star with hibiscus (national flower) pattern
   - **Description:** "Got issues resolved for the community"

**Badge Display:**
- User profile (large showcase)
- Next to username (small icons: 🎯🤝⭐)
- Badge unlock notification (toast)

**Badge Unlock Flow:**
- Real-time check when action is performed
- Toast notification: "You earned the [Badge Name]!"
- Badge appears on profile immediately
- Points bonus: +50 points per badge

#### 3.7.3 Leaderboard

**Leaderboard Page:**
- Top 100 users by points
- Ranking number, avatar, name, points, badges
- Highlight current user's position
- Update frequency: Real-time (via PocketBase subscriptions)

**Leaderboard Filters:**
- All Time (default)
- This Month
- This Week

**Leaderboard Display:**
- Accessible from main navigation
- Shows top 10 on homepage (widget)

---

### 3.8 Anti-Spam & Safety

#### 3.8.1 Rate Limiting

**Report Creation:**
- **Limit:** 5 reports per user per hour
- **UI:** Show remaining quota
- **Error:** "You've reached the hourly limit. Please try again later."

**Comment Creation:**
- **Limit:** 20 comments per user per hour
- **UI:** Show warning at 15 comments
- **Error:** "Slow down! You've posted too many comments."

**Upvoting:**
- **Limit:** 50 upvotes per user per hour
- **Prevention:** Disable upvote button after limit

#### 3.8.2 Auto-Flag System

**Spam Detection Triggers:**
- **Duplicate Reports:** 3+ reports within same 500m radius + same category within 1 hour
- **Identical Content:** Same title/description posted multiple times
- **Rapid Posting:** 5+ reports within 5 minutes

**Auto-Flag Action:**
- Flag report automatically
- Notify admins (real-time)
- Show warning to user: "Your report has been flagged for review"
- Report still visible but marked as "Under Review"

#### 3.8.3 Manual Flagging

**Flag Button:**
- Available on all reports and comments
- Requires login
- One flag per user per item
- **Reasons:** Spam, Inappropriate, Duplicate, False Report, Abusive

**Flag Threshold:**
- **Auto-Hide:** 5 flags triggers auto-hide (pending admin review)
- **Admin Notification:** Immediate notification on first flag

**User Flag History:**
- Track flags submitted by user
- Penalize users who abuse flag system (false flags)

---

### 3.9 Admin Dashboard

#### 3.9.1 Admin Designation

**Admin Whitelist:**
- Hardcoded email list in PocketBase admin settings
- Emails must be Gmail accounts (for OAuth)
- Admin role assigned automatically on login

**Admin Emails (Example):**
```
admin@example.com
moderator@example.com
```

**Admin Role Check:**
- Middleware checks admin status on protected routes
- API endpoints verify admin role

#### 3.9.2 Dashboard Features

**Overview Page:**
- Total reports (by status)
- Total users
- Total comments
- Flagged items count (alerts)
- Recent activity timeline

**Flagged Content Page:**
- List of flagged reports and comments
- Sort by: Most Flagged, Most Recent
- Filter by: Reports, Comments
- Actions: View, Hide, Unhide, Delete, Dismiss Flags

**User Management Page:**
- Search users by name/email
- User details: Reports, Comments, Points, Badges
- Actions: Warn, Ban, Unban
- View warnings history

**Reports Management Page:**
- All reports table (sortable, filterable)
- Bulk actions: Change Status, Hide, Delete
- Advanced filters: Date range, Category, Status, Location

**Audit Logs Page:**
- Timeline of all admin actions
- Log entries:
  - Admin user
  - Action type (Hide Report, Ban User, Change Status, etc.)
  - Target (report/user ID)
  - Timestamp
  - Details/reason
- Export logs (CSV)

#### 3.9.3 Admin Actions

**Warn User:**
- Send warning notification
- Log warning in user record
- Warning counter: 1st, 2nd, 3rd
- **3rd Warning:** Auto-ban

**Ban User:**
- Disable account (cannot login)
- Hide all user's reports and comments
- Reset points to 0
- Send ban notification email
- Reason required (logged in audit)

**Unban User:**
- Re-enable account
- Restore reports and comments
- Do not restore points
- Send unban notification

**Hide Report/Comment:**
- Remove from public view
- Still accessible to admins
- Original creator can still see with "Hidden" label
- Log action in audit

**Lock Comments:**
- Prevent new comments on report
- Existing comments remain visible
- Show "Comments locked" message

---

### 3.10 Notifications

#### 3.10.1 Notification Types

**In-App Notifications:**
- New comment on followed report
- Status change on followed report
- Report upvoted (every 5 upvotes)
- Badge unlocked
- Warning/ban from admin
- Report flagged/hidden

**Push Notifications (PWA):**
- Same as in-app notifications
- Requires user opt-in
- Sent via Service Worker

**Email Notifications:**
- Weekly digest (optional, user preference)
- Ban/warning notification
- Report resolved (if creator)

#### 3.10.2 Notification Settings

**User Preferences:**
- Toggle in-app notifications
- Toggle push notifications
- Toggle email notifications
- Frequency: Real-time, Daily Digest, Weekly Digest
- Per-event preferences (granular control)

---

### 3.11 Offline & PWA Features

#### 3.11.1 Offline Capabilities

**View Previously Loaded Reports:**
- Cache report list (last 50 viewed)
- Cache report details (last 20 viewed)
- Cache map tiles (nearby area)
- Storage: IndexedDB via Workbox

**Create Reports Offline:**
- Save to local IndexedDB
- Status: "Pending Sync"
- Photos stored as base64 temporarily
- Auto-sync when online
- Show sync status indicator

**Offline Indicator:**
- Toast notification: "You're offline. Changes will sync when connected."
- Offline badge in header
- Disable online-only actions (follow, upvote, comment)

#### 3.11.2 PWA Configuration

**Manifest (manifest.json):**
- App name: "Community Reporter MY"
- Short name: "ReporterMY"
- Description: "Report and track local issues in Malaysia"
- Theme color: Malaysian flag red (#CC0001)
- Background color: White
- Icons: 192x192, 512x512 (with Malaysian flag motif)
- Display: standalone
- Start URL: /
- Scope: /

**Service Worker:**
- Cache-first strategy for static assets
- Network-first for API calls
- Background sync for offline submissions
- Push notification support
- Install prompt on 2nd visit

**Install Prompt:**
- Custom install button (header)
- Prompt criteria: 2+ visits, 5+ minutes engagement
- Defer install prompt for better UX

---

### 3.12 Search & Filters

#### 3.12.1 Search Implementation

**Search Scope:**
- Report title
- Report description
- Report location/address

**Search Features:**
- Full-text search (PocketBase text search)
- Debounced input (300ms delay)
- Highlight matching terms in results
- Auto-complete suggestions (recent searches)
- Clear search button

**Search UI:**
- Search bar in header (desktop) and bottom nav (mobile)
- Search results page (replaces feed)
- Results count
- "No results" state with suggestions

#### 3.12.2 Filter System

**Category Filter:**
- Multi-select dropdown
- Show count per category
- "All Categories" default

**Status Filter:**
- Multi-select: Open, Acknowledged, In Progress, Closed
- Color-coded chips
- "All Statuses" default

**Location/Nearby Filter:**
- Radius slider: 1km, 5km, 10km, 25km, All
- Requires geolocation permission
- Show distance in results
- Sort by nearest

**Combined Filters:**
- Filters work together (AND logic)
- Active filters shown as removable chips
- "Clear All Filters" button
- Filter state persisted in URL params (shareable links)

---

## 4. Data Models

### 4.1 PocketBase Collections

**users** (extends PocketBase auth collection)
```typescript
{
  id: string (auto)
  email: string (from OAuth)
  name: string (from OAuth)
  avatarSeed: string (for Boring Avatars)
  points: number (default: 0)
  badges: string[] (default: [])
  isPublic: boolean (default: false)
  isBanned: boolean (default: false)
  warnings: number (default: 0)
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

**reports**
```typescript
{
  id: string (auto)
  title: string (required, max: 100)
  description: string (required, max: 1000)
  category: string (required)
  photos: file[] (max: 5)
  latitude: number (required)
  longitude: number (required)
  address: string (optional)
  landmark: string (optional)
  status: string (default: "draft")
  createdBy: relation (users, required)
  followers: relation (users, multiple)
  upvotes: relation (users, multiple)
  upvoteCount: number (default: 0)
  confirmations: relation (users, multiple)
  confirmationCount: number (default: 0)
  flagCount: number (default: 0)
  flaggedBy: relation (users, multiple)
  isHidden: boolean (default: false)
  commentsLocked: boolean (default: false)
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

**comments**
```typescript
{
  id: string (auto)
  reportId: relation (reports, required)
  userId: relation (users, required)
  content: string (required, max: 500)
  photos: file[] (max: 3)
  parentId: relation (comments, optional)
  reactions: json {
    like: string[]
    support: string[]
    urgent: string[]
  }
  isHidden: boolean (default: false)
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

**notifications**
```typescript
{
  id: string (auto)
  userId: relation (users, required)
  type: string (required)
  title: string (required)
  message: string (required)
  relatedReportId: relation (reports, optional)
  relatedCommentId: relation (comments, optional)
  isRead: boolean (default: false)
  createdAt: datetime (auto)
}
```

**audit_logs**
```typescript
{
  id: string (auto)
  adminId: relation (users, required)
  action: string (required)
  targetType: string (required)
  targetId: string (required)
  details: text (optional)
  reason: text (optional)
  createdAt: datetime (auto)
}
```

**flags**
```typescript
{
  id: string (auto)
  reportId: relation (reports, optional)
  commentId: relation (comments, optional)
  flaggedBy: relation (users, required)
  reason: string (required)
  status: string (default: "pending")
  reviewedBy: relation (users, optional)
  createdAt: datetime (auto)
}
```

---

## 5. UI/UX Design Guidelines

### 5.1 Malaysian Design System

**Color Palette:**
- **Primary:** #CC0001 (Malaysian flag red)
- **Secondary:** #FFCC00 (Malaysian flag yellow)
- **Accent:** #010066 (Malaysian flag blue)
- **Success:** #10B981 (Green for closed/resolved)
- **Warning:** #F59E0B (Yellow for acknowledged)
- **Error:** #EF4444 (Red for open/urgent)
- **Info:** #3B82F6 (Blue for in progress)
- **Neutral:** Tailwind gray scale

**Typography:**
- **Primary Font:** Inter (clean, modern, multilingual support)
- **Headings:** Bold, 600-700 weight
- **Body:** Regular, 400 weight
- **Code/Monospace:** JetBrains Mono

**Malaysian Motifs (Subtle):**
- Batik patterns in backgrounds (very subtle, low opacity)
- Hibiscus flower accents in badges
- Jalur Gemilang (flag) colors in status indicators
- Wau bulan (kite) shapes in illustrations

**Icons:**
- Lucide React icons (consistent, clean)
- Custom Malaysian icons for categories (optional)

**Spacing:**
- Follow Tailwind spacing scale (4px base)
- Mobile: More generous touch targets (min 44x44px)
- Desktop: Compact, information-dense

### 5.2 Responsive Design

**Mobile-First Approach:**
- Design for 375px width minimum
- Optimize for one-hand use
- Bottom navigation for primary actions
- Swipe gestures (back, refresh)

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Navigation:**
- **Mobile:** Bottom tab bar (Feed, Map, Create, Notifications, Profile)
- **Desktop:** Top header with sidebar

### 5.3 Accessibility

**WCAG 2.1 AA Compliance:**
- Color contrast ratio: 4.5:1 (text), 3:1 (UI components)
- Keyboard navigation support
- Screen reader compatibility (ARIA labels)
- Focus indicators visible
- Text resizable up to 200%

**Inclusive Features:**
- Alt text for all images
- Captions for map markers
- Skip to main content link
- Error messages clear and actionable

---

## 6. Performance & Optimization

### 6.1 Performance Targets

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Lighthouse Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90
- PWA: 100

### 6.2 Optimization Strategies

**Images:**
- Next.js Image component (lazy loading, responsive)
- WebP format with fallback
- Client-side compression before upload
- Thumbnail generation (PocketBase hooks)

**Code Splitting:**
- Dynamic imports for routes
- Lazy load heavy components (Map, Image Gallery)
- Tree shaking unused code

**Caching:**
- Static assets: 1 year (immutable)
- API responses: Stale-while-revalidate
- Map tiles: 7 days
- User data: No cache (privacy)

**Bundle Size:**
- Target: < 200KB initial bundle (gzipped)
- Monitor with bundlesize or bundlephobia

---

## 7. Security & Privacy

### 7.1 Authentication Security

**OAuth 2.0:**
- Use PocketBase OAuth providers
- Secure token storage (httpOnly cookies)
- CSRF protection
- Session timeout: 7 days (sliding)

**API Security:**
- PocketBase Collection Rules (RLS)
- Admin-only endpoints protected
- Rate limiting on all endpoints
- Input validation and sanitization

### 7.2 Data Privacy

**User Data:**
- Profiles private by default
- Email never publicly displayed
- Location data stored but not exact address revealed
- GDPR-compliant (data export, deletion)

**Content Moderation:**
- Flagged content reviewed promptly
- Banned users' data retained for audit (30 days)
- Admin logs for accountability

**Third-Party Services:**
- OpenStreetMap: No tracking
- Vercel Analytics: Optional, anonymized
- Google OAuth: Minimal scopes (profile, email)

---

## 8. Deployment & DevOps

### 8.1 Deployment Strategy

**Frontend (Vercel):**
1. Connect GitHub repo to Vercel
2. Auto-deploy on push to main branch
3. Preview deployments for PRs
4. Environment variables:
   - `NEXT_PUBLIC_POCKETBASE_URL`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (if needed)

**Backend (PocketBase):**
1. Deploy PocketBase to Railway/Fly.io/PocketHost (free tier)
2. Configure OAuth (Google client ID/secret)
3. Set up collections and rules
4. Configure file storage (local or S3-compatible)
5. Enable real-time subscriptions
6. Set up backups (daily automated)

**Domain & SSL:**
- Vercel provides free SSL
- Custom domain (optional, via Vercel)

### 8.2 Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Backend (PocketBase):**
- Admin email whitelist (in admin UI)
- Google OAuth credentials (in admin UI)

### 8.3 CI/CD Pipeline

**GitHub Actions (Optional):**
- Run tests on PR
- Type checking
- Linting (ESLint + Prettier)
- Build validation

**Deployment Flow:**
1. Push to feature branch
2. Create PR to main
3. Vercel preview deploy
4. Review and test
5. Merge to main
6. Auto-deploy to production

---

## 9. Testing Strategy

### 9.1 Testing Levels

**Unit Tests:**
- Utility functions (points calculation, distance)
- Components (buttons, forms, cards)
- Coverage target: > 70%

**Integration Tests:**
- API endpoints (PocketBase)
- Authentication flow
- Report creation flow
- Admin actions

**E2E Tests (Optional):**
- Playwright or Cypress
- Critical user journeys:
  - Sign in → Create report → View feed
  - Admin → Review flagged content → Ban user

**Manual Testing:**
- Device testing: iOS Safari, Android Chrome
- PWA install flow
- Offline functionality
- Geolocation accuracy

### 9.2 Test Checklist for Submission

- [ ] Sign in with Google works
- [ ] Create report (with/without photos, location)
- [ ] Duplicate detection works
- [ ] Feed displays correctly (list & map)
- [ ] Filters and search work
- [ ] Follow/unfollow works
- [ ] Comments and reactions work
- [ ] Status changes work (admin)
- [ ] Points and badges awarded correctly
- [ ] Leaderboard updates in real-time
- [ ] Notifications sent and received
- [ ] Flagging and auto-flag work
- [ ] Admin dashboard accessible
- [ ] Warn/ban user works
- [ ] Audit logs recorded
- [ ] PWA installs correctly
- [ ] Offline mode works (view, create)
- [ ] Push notifications work
- [ ] Responsive on mobile and desktop
- [ ] Accessibility (keyboard, screen reader)

---

## 10. Documentation Requirements

### 10.1 README.md

**Required Sections:**
1. **Project Title & Description**
2. **Features List** (must-have + nice-to-have implemented)
3. **Tech Stack**
4. **Setup Instructions:**
   - Prerequisites (Node.js version, PocketBase)
   - Clone repo
   - Install dependencies
   - Configure environment variables
   - Run PocketBase locally
   - Run Next.js dev server
   - Access app
5. **Deployment Instructions:**
   - Deploy PocketBase
   - Deploy Next.js to Vercel
   - Configure OAuth
6. **Admin Setup:**
   - How to add admin emails
7. **Assumptions & Design Decisions:**
   - Any simplifications made
   - Reasons for tech choices
8. **Known Limitations:**
   - Free tier constraints
   - Features not implemented
9. **Future Enhancements:**
   - Ideas for v2
10. **Screenshots** (optional but recommended)
11. **Demo Video** (optional, 1-2 min walkthrough)
12. **License** (MIT suggested)

### 10.2 Code Documentation

**Inline Comments:**
- Complex logic explained
- API endpoints documented (JSDoc)
- Component props documented (TypeScript)

**API Documentation:**
- PocketBase collections schema
- Collection rules explained
- Endpoints and permissions

---

## 11. Submission Deliverables

### 11.1 Required

1. **Live Deployed URL:**
   - Accessible to judges without login (public feed)
   - Working Google OAuth
   - Stable and performant

2. **README.md:**
   - Setup steps clear and tested
   - Feature list complete
   - Assumptions documented

3. **Source Code:**
   - GitHub repo link (optional but recommended)
   - Clean, well-organized code
   - TypeScript types defined
   - No hardcoded secrets

### 11.2 Optional (Bonus Points)

1. **Screenshots:**
   - Homepage/feed
   - Report detail page
   - Create report flow
   - Map view
   - Admin dashboard
   - Mobile responsive views

2. **Demo Video:**
   - 1-2 minute walkthrough
   - Show key features
   - User journey: sign in → create report → view on map
   - Admin actions demo
   - Upload to YouTube/Loom

3. **Postman Collection:**
   - API endpoints documented
   - Example requests/responses

---

## 12. Success Criteria

### 12.1 Must-Have Features (Critical)

- ✅ Google OAuth sign-in working
- ✅ User profile with points and badges
- ✅ Create report with photos, location, category
- ✅ Duplicate detection and suggestion
- ✅ Public feed with infinite scroll
- ✅ Map view with Leaflet/OpenStreetMap
- ✅ Report detail page with full info
- ✅ Status flow: Draft → Open → Acknowledged → In Progress → Closed
- ✅ Follow system (auto-follow + manual)
- ✅ Comments with photos, nested replies, reactions
- ✅ Points system and leaderboard
- ✅ 3 badges (First Report, Helper, Resolver)
- ✅ Admin dashboard with flagged content
- ✅ Warn/ban user functionality
- ✅ Audit logs for admin actions
- ✅ Anti-spam rate limits and auto-flag
- ✅ PWA installable with offline support

### 12.2 Nice-to-Have Features (Bonus)

- ✅ Search and filters (category, status, location)
- ✅ Push notifications
- ✅ Draft system for reports
- ✅ User can delete own reports
- ✅ Private profiles by default
- ✅ Email notifications (weekly digest)

### 12.3 Quality Criteria

- **Performance:** Lighthouse score > 85 on all metrics
- **Accessibility:** WCAG AA compliant
- **Mobile:** Fully responsive, thumb-friendly navigation
- **Security:** No exposed secrets, proper auth
- **UX:** Intuitive, minimal friction, helpful error messages
- **Design:** Consistent, Malaysian-themed, professional

---

## 13. Timeline & Milestones

**Total Time:** 5 days (Feb 9 - Feb 14, 2026)

### Day 1 (Feb 9): Setup & Core Infrastructure
- ✅ Initialize Next.js project with TypeScript, Tailwind, shadcn/ui
- ✅ Set up Zustand store structure
- ✅ Deploy PocketBase and configure collections
- ✅ Implement Google OAuth authentication
- ✅ Create basic layout and navigation

### Day 2 (Feb 10): Report Creation & Feed
- ✅ Build create report form (title, description, category)
- ✅ Implement photo upload (multi-file)
- ✅ Add location picker (auto-detect + manual)
- ✅ Implement duplicate detection
- ✅ Build public feed (list view)
- ✅ Create report card component

### Day 3 (Feb 11): Report Details & Engagement
- ✅ Build report detail page
- ✅ Implement comments system (nested, reactions)
- ✅ Add follow/unfollow functionality
- ✅ Implement upvote system
- ✅ Build map view with Leaflet
- ✅ Add search and filters

### Day 4 (Feb 12): Gamification & Admin
- ✅ Implement points system and calculations
- ✅ Create 3 badges and unlock logic
- ✅ Build leaderboard page
- ✅ Create admin dashboard
- ✅ Implement flag system and auto-flag
- ✅ Build warn/ban user functionality
- ✅ Add audit logs

### Day 5 (Feb 13): PWA, Polish & Testing
- ✅ Configure PWA (manifest, service worker)
- ✅ Implement offline support
- ✅ Add push notifications
- ✅ Implement rate limiting
- ✅ Responsive design polish
- ✅ Testing and bug fixes
- ✅ Write README and documentation

### Day 6 (Feb 14): Final Review & Submission
- ✅ Final testing on multiple devices
- ✅ Performance optimization
- ✅ Deploy to production (Vercel)
- ✅ Record demo video (optional)
- ✅ Submit before 3:59 PM MYT

---

## 14. Risk Assessment & Mitigation

### 14.1 Technical Risks

**Risk:** PocketBase free tier limitations (storage, bandwidth)
- **Mitigation:** Image compression, optimize queries, monitor usage

**Risk:** Geolocation API not working on all devices
- **Mitigation:** Fallback to manual address entry, show clear error messages

**Risk:** Vercel free tier limits (bandwidth, build minutes)
- **Mitigation:** Optimize bundle size, use ISR for static pages

**Risk:** Real-time subscriptions performance with PocketBase
- **Mitigation:** Implement debouncing, limit subscription scope

### 14.2 Development Risks

**Risk:** Scope creep (too many features)
- **Mitigation:** Stick to must-have features first, add nice-to-haves only if time permits

**Risk:** Integration issues between Next.js and PocketBase
- **Mitigation:** Test authentication early, follow PocketBase documentation

**Risk:** Map rendering performance on mobile
- **Mitigation:** Limit markers displayed, use clustering, lazy load map

### 14.3 Deployment Risks

**Risk:** OAuth not working in production
- **Mitigation:** Test OAuth redirect URLs early, configure correctly in Google Console

**Risk:** CORS issues with PocketBase
- **Mitigation:** Configure CORS settings in PocketBase properly

**Risk:** PWA not installing on iOS
- **Mitigation:** Test on real iOS device, ensure manifest is correct

---

## 15. Assumptions & Constraints

### 15.1 Assumptions

1. Users have smartphones with GPS capability
2. Users have Google accounts (for OAuth)
3. Internet connection available for most features (offline is fallback)
4. Reports are for public issues (not private property)
5. Admin team is small (2-3 people max)
6. Malaysian users primarily use Chrome/Safari on mobile
7. Reports are in English or Malay (no translation needed)
8. PocketBase free tier is sufficient for 10 concurrent users

### 15.2 Constraints

1. **Budget:** RM0 (free tiers only)
2. **Time:** 5 days to build and deploy
3. **Team:** Solo developer (assumed)
4. **Hosting:** Vercel + PocketBase free tiers
5. **Storage:** Limited by PocketBase free tier (~1GB)
6. **Bandwidth:** Limited by Vercel free tier (100GB/month)
7. **Users:** Optimized for ~10 concurrent users during judging
8. **Geographic Scope:** Malaysia only (OpenStreetMap coverage)

---

## 16. Future Enhancements (Post-Bounty)

### 16.1 v2 Features

1. **Multilingual Support:**
   - Bahasa Malaysia + English toggle
   - i18n implementation with next-intl

2. **Advanced Notifications:**
   - SMS notifications (via Twilio/MessageBird)
   - WhatsApp notifications (via WhatsApp Business API)

3. **Government Integration:**
   - API integration with local council systems
   - Official status updates from authorities

4. **Enhanced Gamification:**
   - More badges (categories, milestones)
   - Achievements (streaks, locality champion)
   - Rewards program (partner discounts)

5. **Community Features:**
   - Forums/discussions per locality
   - Events and meetups
   - Volunteer coordination

6. **Analytics Dashboard:**
   - Heatmaps of problem areas
   - Trend analysis over time
   - Reports export for government

7. **Mobile Apps:**
   - Native iOS and Android apps (React Native)
   - Better offline support
   - Background geofencing

8. **AI/ML Features:**
   - Auto-categorization of reports
   - Smart duplicate detection (image similarity)
   - Priority scoring based on impact

---

## 17. Contact & Support

### 17.1 Developer Information

**Project Owner:** [Your Name]
**Email:** [Your Email]
**GitHub:** [Your GitHub Profile]

### 17.2 Support Channels

**Issues & Bugs:**
- GitHub Issues (if repo is public)
- Email support

**Feature Requests:**
- GitHub Discussions
- In-app feedback form (future)

**Documentation:**
- README.md in repo
- This PRD document
- PocketBase API docs

---

## 18. Appendix

### 18.1 Glossary

- **PWA:** Progressive Web App
- **OAuth:** Open Authorization (authentication protocol)
- **PocketBase:** Open-source backend (SQLite + REST API)
- **Leaflet:** JavaScript library for interactive maps
- **OpenStreetMap:** Open-source map data
- **ISR:** Incremental Static Regeneration (Next.js)
- **RLS:** Row-Level Security (database security)

### 18.2 References

- Next.js Documentation: https://nextjs.org/docs
- PocketBase Documentation: https://pocketbase.io/docs
- shadcn/ui Components: https://ui.shadcn.com
- Leaflet Documentation: https://leafletjs.com
- Boring Avatars: https://github.com/boringdesigners/boring-avatars
- Malaysian Design Inspiration: https://www.malaysia.gov.my

### 18.3 Design Assets

**Color Codes:**
```css
--primary: #CC0001;
--secondary: #FFCC00;
--accent: #010066;
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

**Icon Suggestions:**
- First Report Badge: 🎯 (target)
- Helper Badge: 🤝 (handshake)
- Resolver Badge: ⭐ (star)
- Report Categories: Emoji or Lucide icons

---

## 19. Conclusion

This PRD outlines a comprehensive, achievable plan to build a Local Community Problem Reporter PWA within the 5-day deadline and free-tier constraints. The project prioritizes:

1. **Simplicity:** Easy to deploy and use
2. **Community Focus:** Public-first, engagement-driven
3. **Malaysian Context:** Localized categories, design, and culture
4. **Scalability:** Foundation for future growth
5. **Quality:** Professional, polished, and well-documented

By following this document, the final deliverable will meet all must-have requirements, include several nice-to-have features, and provide a solid foundation for post-bounty enhancements.

**Next Steps:**
1. Review and approve this PRD
2. Set up development environment
3. Begin Day 1 tasks (setup & core infrastructure)
4. Daily progress check-ins against timeline
5. Deploy and submit before deadline

---

**Document Version:** 1.0  
**Last Updated:** February 9, 2026  
**Status:** Ready for Development  

---

**Good luck with the bounty! 🚀🇲🇾**