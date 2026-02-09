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

async function debugData() {
  loadEnvFile()

  const baseUrl = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL
  const adminEmail = process.env.POCKETBASE_SU_EMAIL
  const adminPassword = process.env.POCKETBASE_SU_PASSWORD

  const pb = new PocketBase(baseUrl)

  // Authenticate as superuser
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword)

  console.log("\n=== Debugging Data ===\n")

  // Get one user and show all fields
  const users = await pb.collection("users").getFullList({ perPage: 1 })
  console.log("First user (raw):")
  console.log(JSON.stringify(users[0], null, 2))

  // Get one report and show all fields
  const reports = await pb.collection("reports").getFullList({ perPage: 1 })
  console.log("\nFirst report (raw):")
  console.log(JSON.stringify(reports[0], null, 2))

  // Get the users collection schema
  const usersCollection = await pb.collections.getOne("users")
  console.log("\nUsers collection fields:")
  console.log(JSON.stringify(usersCollection.fields, null, 2))

  // Get the reports collection schema
  const reportsCollection = await pb.collections.getOne("reports")
  console.log("\nReports collection schema:")
  console.log(JSON.stringify(reportsCollection.schema || reportsCollection.fields, null, 2))
}

debugData().catch((error) => {
  console.error("\n❌ Debug failed:", error)
  process.exit(1)
})
