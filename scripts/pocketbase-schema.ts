import fs from "fs"
import path from "path"
import PocketBase from "pocketbase"

type CollectionModel = {
  id: string
  name: string
  type: string
  schema: Array<Record<string, unknown>>
}

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

function mergeSchema(existing: Array<Record<string, any>>, desired: Array<Record<string, any>>) {
  const byName = new Map(existing.map((field) => [field.name, field]))
  for (const field of desired) {
    const current = byName.get(field.name)
    if (current) {
      byName.set(field.name, {
        ...current,
        ...field,
        options: {
          ...(current.options || {}),
          ...(field.options || {}),
        },
      })
    } else {
      byName.set(field.name, field)
    }
  }
  return Array.from(byName.values())
}

async function getCollections(pb: PocketBase) {
  const list = await pb.collections.getList(1, 200)
  return list.items as CollectionModel[]
}

async function ensureBaseCollections(pb: PocketBase, names: string[]) {
  const existing = await getCollections(pb)
  const existingMap = new Map(existing.map((c) => [c.name, c]))

  for (const name of names) {
    if (!existingMap.has(name)) {
      await pb.collections.create({
        name,
        type: "base",
        schema: [],
      })
    }
  }
}

async function updateCollectionSchema(pb: PocketBase, name: string, schema: Array<Record<string, any>>) {
  const collection = (await pb.collections.getOne(name)) as CollectionModel
  const merged = mergeSchema(collection.schema || [], schema)
  await pb.collections.update(collection.id, { schema: merged })
}

async function main() {
  loadEnvFile()

  const baseUrl = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL
  const adminEmail = process.env.POCKETBASE_SU_EMAIL
  const adminPassword = process.env.POCKETBASE_SU_PASSWORD

  if (!baseUrl || !adminEmail || !adminPassword) {
    throw new Error(
      "Missing POCKETBASE_URL, POCKETBASE_SU_EMAIL, or POCKETBASE_SU_PASSWORD in .env.local",
    )
  }

  const pb = new PocketBase(baseUrl)
  await pb.admins.authWithPassword(adminEmail, adminPassword)

  await ensureBaseCollections(pb, ["reports", "comments", "notifications", "audit_logs", "flags"])

  const collections = await getCollections(pb)
  const ids = new Map(collections.map((c) => [c.name, c.id]))

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

  await updateCollectionSchema(pb, "users", [
    { name: "avatarSeed", type: "text", required: false },
    { name: "points", type: "number", required: false, options: { min: 0 } },
    { name: "badges", type: "json", required: false, options: { defaultValue: [] } },
    { name: "isPublic", type: "bool", required: false },
    { name: "isBanned", type: "bool", required: false },
    { name: "warnings", type: "number", required: false, options: { min: 0 } },
  ])

  await updateCollectionSchema(pb, "reports", [
    { name: "title", type: "text", required: true, options: { max: 100 } },
    { name: "description", type: "text", required: true, options: { max: 1000 } },
    {
      name: "category",
      type: "select",
      required: true,
      options: { maxSelect: 1, values: categoryValues },
    },
    {
      name: "photos",
      type: "file",
      required: false,
      options: {
        maxSelect: 5,
        maxSize: 5 * 1024 * 1024,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
    },
    { name: "latitude", type: "number", required: true },
    { name: "longitude", type: "number", required: true },
    { name: "address", type: "text", required: false },
    { name: "landmark", type: "text", required: false },
    {
      name: "status",
      type: "select",
      required: true,
      options: { maxSelect: 1, values: statusValues, defaultValue: "draft" },
    },
    {
      name: "createdBy",
      type: "relation",
      required: true,
      options: { collectionId: ids.get("users"), maxSelect: 1 },
    },
    {
      name: "followers",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("users"), maxSelect: 999 },
    },
    {
      name: "upvotes",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("users"), maxSelect: 999 },
    },
    { name: "upvoteCount", type: "number", required: false, options: { min: 0 } },
    {
      name: "confirmations",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("users"), maxSelect: 999 },
    },
    { name: "confirmationCount", type: "number", required: false, options: { min: 0 } },
    { name: "flagCount", type: "number", required: false, options: { min: 0 } },
    {
      name: "flaggedBy",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("users"), maxSelect: 999 },
    },
    { name: "isHidden", type: "bool", required: false },
    { name: "commentsLocked", type: "bool", required: false },
  ])

  await updateCollectionSchema(pb, "comments", [
    {
      name: "reportId",
      type: "relation",
      required: true,
      options: { collectionId: ids.get("reports"), maxSelect: 1 },
    },
    {
      name: "userId",
      type: "relation",
      required: true,
      options: { collectionId: ids.get("users"), maxSelect: 1 },
    },
    { name: "content", type: "text", required: true, options: { max: 500 } },
    {
      name: "photos",
      type: "file",
      required: false,
      options: {
        maxSelect: 3,
        maxSize: 5 * 1024 * 1024,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
    },
    {
      name: "parentId",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("comments"), maxSelect: 1 },
    },
    {
      name: "reactions",
      type: "json",
      required: false,
      options: { defaultValue: { like: [], support: [], urgent: [] } },
    },
    { name: "isHidden", type: "bool", required: false },
  ])

  await updateCollectionSchema(pb, "notifications", [
    {
      name: "userId",
      type: "relation",
      required: true,
      options: { collectionId: ids.get("users"), maxSelect: 1 },
    },
    { name: "type", type: "text", required: true },
    { name: "title", type: "text", required: true },
    { name: "message", type: "text", required: true },
    {
      name: "relatedReportId",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("reports"), maxSelect: 1 },
    },
    {
      name: "relatedCommentId",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("comments"), maxSelect: 1 },
    },
    { name: "isRead", type: "bool", required: false },
  ])

  await updateCollectionSchema(pb, "audit_logs", [
    {
      name: "adminId",
      type: "relation",
      required: true,
      options: { collectionId: ids.get("users"), maxSelect: 1 },
    },
    { name: "action", type: "text", required: true },
    { name: "targetType", type: "text", required: true },
    { name: "targetId", type: "text", required: true },
    { name: "details", type: "text", required: false },
    { name: "reason", type: "text", required: false },
  ])

  await updateCollectionSchema(pb, "flags", [
    {
      name: "reportId",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("reports"), maxSelect: 1 },
    },
    {
      name: "commentId",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("comments"), maxSelect: 1 },
    },
    {
      name: "flaggedBy",
      type: "relation",
      required: true,
      options: { collectionId: ids.get("users"), maxSelect: 1 },
    },
    { name: "reason", type: "text", required: true },
    { name: "status", type: "text", required: false, options: { defaultValue: "pending" } },
    {
      name: "reviewedBy",
      type: "relation",
      required: false,
      options: { collectionId: ids.get("users"), maxSelect: 1 },
    },
  ])

  console.log("PocketBase schema ensured.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
