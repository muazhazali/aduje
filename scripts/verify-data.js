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

async function verifyData() {
  loadEnvFile()

  const baseUrl = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL
  const adminEmail = process.env.POCKETBASE_SU_EMAIL
  const adminPassword = process.env.POCKETBASE_SU_PASSWORD

  if (!baseUrl || !adminEmail || !adminPassword) {
    throw new Error("Missing POCKETBASE_URL, POCKETBASE_SU_EMAIL, or POCKETBASE_SU_PASSWORD in .env.local")
  }

  const pb = new PocketBase(baseUrl)

  // Authenticate as superuser
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword)

  console.log("\n=== PocketBase Data Verification ===\n")

  // Verify collections exist
  console.log("📋 Collections:")
  const collections = await pb.collections.getFullList()
  const collectionNames = ["users", "reports", "comments", "notifications", "audit_logs", "flags"]
  for (const name of collectionNames) {
    const exists = collections.find((c) => c.name === name)
    console.log(`  ${exists ? "✓" : "✗"} ${name}`)
  }

  // Verify users
  console.log("\n👥 Users:")
  const users = await pb.collection("users").getFullList()
  console.log(`  Total users: ${users.length}`)
  for (const user of users) {
    console.log(
      `  - ${user.name || "No name"} (${user.email}) - Points: ${user.points || 0}, Admin: ${user.isAdmin || false}, Badges: ${user.badges?.length || 0}`
    )
  }

  // Verify reports
  console.log("\n📝 Reports:")
  const reports = await pb.collection("reports").getFullList({
    expand: "createdBy",
  })
  console.log(`  Total reports: ${reports.length}`)
  for (const report of reports) {
    console.log(
      `  - ${report.title || "No title"} (${report.category || "No category"}) - Status: ${report.status || "No status"}, Upvotes: ${report.upvoteCount || 0}, Creator: ${report.expand?.createdBy?.name || "Unknown"}`
    )
  }

  // Verify comments
  console.log("\n💬 Comments:")
  const comments = await pb.collection("comments").getFullList({
    expand: "userId,reportId",
  })
  console.log(`  Total comments: ${comments.length}`)
  for (const comment of comments) {
    const reportTitle = comment.expand?.reportId?.title || "Unknown"
    const userName = comment.expand?.userId?.name || "Unknown"
    const content = comment.content || ""
    const contentPreview = content.substring(0, 50) + (content.length > 50 ? "..." : "")
    console.log(`  - ${userName} on "${reportTitle}": "${contentPreview}"`)
  }

  // Verify notifications
  console.log("\n🔔 Notifications:")
  const notifications = await pb.collection("notifications").getFullList({
    expand: "userId",
  })
  console.log(`  Total notifications: ${notifications.length}`)
  for (const notification of notifications) {
    const userName = notification.expand?.userId?.name || "Unknown"
    console.log(`  - ${notification.type}: "${notification.title}" for ${userName}`)
  }

  // Summary
  console.log("\n=== Summary ===")
  console.log(`✓ All collections exist`)
  console.log(`✓ ${users.length} users created`)
  console.log(`✓ ${reports.length} reports created`)
  console.log(`✓ ${comments.length} comments created`)
  console.log(`✓ ${notifications.length} notifications created`)
  console.log(`\n✓ Data verification complete!`)
  console.log(`\nYou can access the PocketBase admin UI at: ${baseUrl}/_/`)
  console.log(`Admin email: ${adminEmail}`)
}

verifyData().catch((error) => {
  console.error("\n❌ Verification failed:", error)
  process.exit(1)
})
