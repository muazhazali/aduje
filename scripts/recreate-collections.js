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

async function recreateCollections() {
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

  console.log("Recreating collections with proper schemas...\n")

  // Get users collection ID
  const usersCollection = await pb.collections.getOne("users")
  console.log("✓ Users collection ID:", usersCollection.id)

  // Delete all collections (in correct order due to relations)
  for (const name of ["notifications", "flags", "comments", "reports", "audit_logs"]) {
    try {
      const collection = await pb.collections.getOne(name)
      await pb.collections.delete(collection.id)
      console.log(`✓ Deleted old ${name} collection`)
    } catch (error) {
      // Collection doesn't exist, which is fine
      console.log(`  ${name} collection doesn't exist yet`)
    }
  }

  const categoryValues = [
    "jalan_raya",
    "lampu_jalan",
    "sampah_sarap",
    "longkang_tersumbat",
    "vandalisme",
    "taman_landskap",
    "kemudahan_awam",
    "haiwan_terbiar",
    "bunyi_bising",
    "lain_lain",
  ]

  const statusValues = ["draft", "open", "acknowledged", "in_progress", "closed"]

  // Create reports collection
  let reportsCollection
  try {
    reportsCollection = await pb.collections.create({
      name: "reports",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      fields: [
        { name: "title", type: "text", required: true, max: 100 },
        { name: "description", type: "text", required: true, max: 1000 },
        {
          name: "category",
          type: "select",
          required: true,
          maxSelect: 1,
          values: categoryValues,
        },
        {
          name: "photos",
          type: "file",
          required: false,
          maxSelect: 5,
          maxSize: 5 * 1024 * 1024,
          mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        },
        { name: "latitude", type: "number", required: true },
        { name: "longitude", type: "number", required: true },
        { name: "address", type: "text", required: false },
        { name: "landmark", type: "text", required: false },
        {
          name: "status",
          type: "select",
          required: true,
          maxSelect: 1,
          values: statusValues,
        },
        {
          name: "createdBy",
          type: "relation",
          required: true,
          collectionId: usersCollection.id,
          maxSelect: 1,
        },
        {
          name: "followers",
          type: "relation",
          required: false,
          collectionId: usersCollection.id,
          maxSelect: 999,
        },
        {
          name: "upvotes",
          type: "relation",
          required: false,
          collectionId: usersCollection.id,
          maxSelect: 999,
        },
        { name: "upvoteCount", type: "number", required: false, min: 0 },
        {
          name: "confirmations",
          type: "relation",
          required: false,
          collectionId: usersCollection.id,
          maxSelect: 999,
        },
        { name: "confirmationCount", type: "number", required: false, min: 0 },
        { name: "flagCount", type: "number", required: false, min: 0 },
        {
          name: "flaggedBy",
          type: "relation",
          required: false,
          collectionId: usersCollection.id,
          maxSelect: 999,
        },
        { name: "isHidden", type: "bool", required: false },
        { name: "commentsLocked", type: "bool", required: false },
      ],
    })
    console.log("✓ Created reports collection with full schema")
  } catch (error) {
    console.error("Failed to create reports collection:")
    if (error.response?.data) {
      console.error("Error details:", JSON.stringify(error.response.data, null, 2))
    }
    throw error
  }

  // Create comments collection (note: can't reference itself for parentId yet)
  const commentsCollection = await pb.collections.create({
    name: "comments",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "reportId",
        type: "relation",
        required: true,
        collectionId: reportsCollection.id,
        maxSelect: 1,
      },
      {
        name: "userId",
        type: "relation",
        required: true,
        collectionId: usersCollection.id,
        maxSelect: 1,
      },
      { name: "content", type: "text", required: true, max: 500 },
      {
        name: "photos",
        type: "file",
        required: false,
        maxSelect: 3,
        maxSize: 5 * 1024 * 1024,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "reactions",
        type: "json",
        required: false,
      },
      { name: "isHidden", type: "bool", required: false },
    ],
  })
  console.log("✓ Created comments collection")

  // Add parentId field to comments (self-referential)
  await pb.collections.update(commentsCollection.id, {
    fields: [
      ...commentsCollection.fields,
      {
        name: "parentId",
        type: "relation",
        required: false,
        collectionId: commentsCollection.id,
        maxSelect: 1,
      },
    ],
  })
  console.log("✓ Added parentId field to comments collection")

  // Create notifications collection
  await pb.collections.create({
    name: "notifications",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "userId",
        type: "relation",
        required: true,
        collectionId: usersCollection.id,
        maxSelect: 1,
      },
      { name: "type", type: "text", required: true },
      { name: "title", type: "text", required: true },
      { name: "message", type: "text", required: true },
      {
        name: "relatedReportId",
        type: "relation",
        required: false,
        collectionId: reportsCollection.id,
        maxSelect: 1,
      },
      {
        name: "relatedCommentId",
        type: "relation",
        required: false,
        collectionId: commentsCollection.id,
        maxSelect: 1,
      },
      { name: "isRead", type: "bool", required: false },
    ],
  })
  console.log("✓ Created notifications collection with full schema")

  // Create audit_logs collection
  await pb.collections.create({
    name: "audit_logs",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "adminId",
        type: "relation",
        required: true,
        collectionId: usersCollection.id,
        maxSelect: 1,
      },
      { name: "action", type: "text", required: true },
      { name: "targetType", type: "text", required: true },
      { name: "targetId", type: "text", required: true },
      { name: "details", type: "text", required: false },
      { name: "reason", type: "text", required: false },
    ],
  })
  console.log("✓ Created audit_logs collection with full schema")

  // Create flags collection
  await pb.collections.create({
    name: "flags",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "reportId",
        type: "relation",
        required: false,
        collectionId: reportsCollection.id,
        maxSelect: 1,
      },
      {
        name: "commentId",
        type: "relation",
        required: false,
        collectionId: commentsCollection.id,
        maxSelect: 1,
      },
      {
        name: "flaggedBy",
        type: "relation",
        required: true,
        collectionId: usersCollection.id,
        maxSelect: 1,
      },
      { name: "reason", type: "text", required: true },
      { name: "status", type: "text", required: false },
      {
        name: "reviewedBy",
        type: "relation",
        required: false,
        collectionId: usersCollection.id,
        maxSelect: 1,
      },
    ],
  })
  console.log("✓ Created flags collection with full schema")

  console.log("\n✅ All collections recreated successfully!")
}

recreateCollections().catch((error) => {
  console.error("\n❌ Failed:", error)
  process.exit(1)
})
