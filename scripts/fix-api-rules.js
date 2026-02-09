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

loadEnvFile()

const baseUrl = process.env.POCKETBASE_URL
const adminEmail = process.env.POCKETBASE_SU_EMAIL
const adminPassword = process.env.POCKETBASE_SU_PASSWORD

async function fixAPIRules() {
  console.log("\n=== Fixing PocketBase API Rules ===\n")
  console.log("PocketBase URL:", baseUrl)

  const pb = new PocketBase(baseUrl)

  try {
    // Authenticate as admin
    await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword)
    console.log("✓ Authenticated as admin\n")

    // Get the users collection
    const usersCollection = await pb.collections.getOne("users")
    console.log("Current users collection rules:")
    console.log("  listRule:", usersCollection.listRule || "(empty - public access)")
    console.log("  viewRule:", usersCollection.viewRule || "(empty - public access)")

    // Update users collection to allow public viewing
    // This allows the expand to work without authentication
    await pb.collections.update(usersCollection.id, {
      listRule: "", // Allow public listing
      viewRule: "", // Allow public viewing
      // Keep create/update/delete restricted (null = nobody can do it without being superuser)
      createRule: null,
      updateRule: null,
      deleteRule: null,
    })

    console.log("\n✓ Updated users collection API rules:")
    console.log("  listRule: (empty - public access)")
    console.log("  viewRule: (empty - public access)")
    console.log("  createRule: null (superuser only)")
    console.log("  updateRule: null (superuser only)")
    console.log("  deleteRule: null (superuser only)")

    console.log("\n✓ API rules fixed successfully!")
    console.log("\nNote: User data is now publicly readable, but sensitive fields")
    console.log("(email, emailVisibility, verified, password) are still protected")
    console.log("by PocketBase's auth collection rules.")
  } catch (err) {
    console.error("✗ Error:", err.message)
    if (err.response) {
      console.error("  Response:", err.response)
    }
    process.exit(1)
  }
}

fixAPIRules()
