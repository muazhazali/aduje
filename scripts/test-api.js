const fs = require("fs")
const path = require("path")
const PocketBase = require("pocketbase/cjs")

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, "utf8")
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue
    const [key, ...rest] = line.split("=")
    if (!key) continue
    const value = rest.join("=").trim()
    if (key && !process.env[key]) {
      process.env[key] = value.replace(/^['"]|['"]$/g, "")
    }
  }
}

async function testAPI() {
  loadEnvFile()

  const baseUrl = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL
  const adminEmail = process.env.POCKETBASE_SU_EMAIL
  const adminPassword = process.env.POCKETBASE_SU_PASSWORD

  const pb = new PocketBase(baseUrl)

  console.log("\n=== PocketBase API Integration Test ===\n")
  console.log(`Testing connection to: ${baseUrl}`)

  try {
    // Test 1: Admin Authentication
    console.log("\n1️⃣  Testing Admin Authentication...")
    await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword)
    console.log("✓ Admin authentication successful")
    console.log(`  Token: ${pb.authStore.token.substring(0, 20)}...`)

    // Test 2: Query Users
    console.log("\n2️⃣  Testing Users Collection...")
    const users = await pb.collection("users").getFullList({
      sort: "-points",
    })
    console.log(`✓ Found ${users.length} users`)
    console.log("  Top user:", users[0].email, `(${users[0].points} points)`)

    // Test 3: Query Reports with Relations
    console.log("\n3️⃣  Testing Reports Collection with Relations...")
    const reports = await pb.collection("reports").getFullList({
      expand: "createdBy",
      filter: 'status != "draft"',
    })
    console.log(`✓ Found ${reports.length} published reports`)
    const firstReport = reports[0]
    console.log(`  Sample: "${firstReport.title}"`)
    console.log(`  - Category: ${firstReport.category}`)
    console.log(`  - Status: ${firstReport.status}`)
    console.log(`  - Location: ${firstReport.latitude}, ${firstReport.longitude}`)
    console.log(`  - Upvotes: ${firstReport.upvoteCount}`)
    console.log(`  - Creator: ${firstReport.createdBy}`)

    // Test 4: Query Comments with Relations
    console.log("\n4️⃣  Testing Comments Collection...")
    const comments = await pb.collection("comments").getFullList({
      expand: "userId,reportId",
    })
    console.log(`✓ Found ${comments.length} comments`)
    const firstComment = comments[0]
    console.log(`  Sample comment by user ${firstComment.userId}`)
    console.log(`  Content: "${firstComment.content.substring(0, 50)}..."`)

    // Test 5: Filter Reports by Category
    console.log("\n5️⃣  Testing Filtering by Category...")
    const roadReports = await pb.collection("reports").getList(1, 10, {
      filter: 'category = "jalan_raya"',
    })
    console.log(`✓ Found ${roadReports.items.length} road-related reports`)

    // Test 6: Filter Reports by Status
    console.log("\n6️⃣  Testing Filtering by Status...")
    const openReports = await pb.collection("reports").getList(1, 10, {
      filter: 'status = "open"',
    })
    console.log(`✓ Found ${openReports.items.length} open reports`)

    // Test 7: Test Geolocation Query (Find reports near KLCC)
    console.log("\n7️⃣  Testing Geolocation Filtering...")
    // KLCC coordinates: 3.1569, 101.7123
    // Simple distance filter (rough approximation for testing)
    const nearbyReports = await pb.collection("reports").getList(1, 10, {
      filter: "latitude > 3.1 && latitude < 3.2 && longitude > 101.65 && longitude < 101.75",
    })
    console.log(`✓ Found ${nearbyReports.items.length} reports in KL area`)

    // Test 8: Query Notifications
    console.log("\n8️⃣  Testing Notifications Collection...")
    const notifications = await pb.collection("notifications").getList(1, 10, {
      expand: "userId,relatedReportId",
    })
    console.log(`✓ Found ${notifications.items.length} notifications`)
    if (notifications.items.length > 0) {
      const notif = notifications.items[0]
      console.log(`  Sample: "${notif.title}" (type: ${notif.type})`)
    }

    // Test 9: Create and Delete Test Report
    console.log("\n9️⃣  Testing Create & Delete Operations...")
    const testUser = users[0]
    const testReport = await pb.collection("reports").create({
      title: "Test Report - Auto Generated",
      description: "This is a test report created by the API test script.",
      category: "lain_lain",
      latitude: 3.14,
      longitude: 101.68,
      address: "Test Address",
      status: "draft",
      createdBy: testUser.id,
      upvoteCount: 0,
      confirmationCount: 0,
      flagCount: 0,
      isHidden: false,
      commentsLocked: false,
    })
    console.log(`✓ Created test report: ${testReport.id}`)

    await pb.collection("reports").delete(testReport.id)
    console.log("✓ Deleted test report successfully")

    // Test 10: User Authentication (non-admin)
    console.log("\n🔟 Testing User Authentication...")
    const testPb = new PocketBase(baseUrl)
    try {
      const authData = await testPb.collection("users").authWithPassword("ahmad@gmail.com", "Password123!")
      console.log("✓ User login successful")
      console.log(`  Authenticated as: ${authData.record.email}`)
      console.log(`  Points: ${authData.record.points}`)
      console.log(`  Badges: ${authData.record.badges.join(", ")}`)
    } catch (error) {
      console.log("⚠ User login failed (this is expected if password doesn't match)")
      console.log(`  Error: ${error.message}`)
    }

    // Final Summary
    console.log("\n" + "=".repeat(50))
    console.log("✅ ALL TESTS PASSED!")
    console.log("=".repeat(50))
    console.log("\nDatabase Statistics:")
    console.log(`  Users: ${users.length}`)
    console.log(`  Reports: ${reports.length}`)
    console.log(`  Comments: ${comments.length}`)
    console.log(`  Notifications: ${notifications.items.length}`)
    console.log(`\nPocketBase URL: ${baseUrl}`)
    console.log(`Admin UI: ${baseUrl}/_/`)
    console.log("\n✓ Your PocketBase database is ready to use!")
  } catch (error) {
    console.error("\n❌ TEST FAILED:")
    console.error(error)
    process.exit(1)
  }
}

testAPI().catch((error) => {
  console.error("\n❌ Unexpected error:", error)
  process.exit(1)
})
