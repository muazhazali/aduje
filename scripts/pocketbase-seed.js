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

const DEFAULT_PASSWORD = process.env.POCKETBASE_SEED_PASSWORD || "Password123!"

function replaceAdminEmail(value, adminEmail) {
  if (!adminEmail) return value
  if (value === "admin@example.com") return adminEmail
  return value
}

function mapEmails(list, adminEmail) {
  if (!Array.isArray(list)) return []
  return list.map((email) => replaceAdminEmail(email, adminEmail))
}

function loadSeedData() {
  const seedPath = process.env.POCKETBASE_SEED_PATH || path.resolve(process.cwd(), "scripts", "seed-data.json")
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed data not found at ${seedPath}`)
  }

  const adminEmail = process.env.POCKETBASE_SU_EMAIL
  const raw = JSON.parse(fs.readFileSync(seedPath, "utf8"))

  const users = (raw.users || []).map((user) => ({
    ...user,
    email: replaceAdminEmail(user.email, adminEmail),
  }))

  if (adminEmail && !users.some((user) => user.email === adminEmail)) {
    users.push({
      email: adminEmail,
      name: "Admin",
      avatarSeed: "admin-seed",
      points: 0,
      badges: [],
      isPublic: true,
      isBanned: false,
      isAdmin: true,
      warnings: 0,
    })
  }

  const reports = (raw.reports || []).map((report) => ({
    ...report,
    createdByEmail: replaceAdminEmail(report.createdByEmail, adminEmail),
    followersEmails: mapEmails(report.followersEmails, adminEmail),
    upvotesEmails: mapEmails(report.upvotesEmails, adminEmail),
    confirmationsEmails: mapEmails(report.confirmationsEmails, adminEmail),
    flaggedByEmails: mapEmails(report.flaggedByEmails, adminEmail),
  }))

  const comments = (raw.comments || []).map((comment) => ({
    ...comment,
    userEmail: replaceAdminEmail(comment.userEmail, adminEmail),
    reactions: {
      like: mapEmails(comment.reactions?.like, adminEmail),
      support: mapEmails(comment.reactions?.support, adminEmail),
      urgent: mapEmails(comment.reactions?.urgent, adminEmail),
    },
  }))

  const notifications = (raw.notifications || []).map((notif) => ({
    ...notif,
    userEmail: replaceAdminEmail(notif.userEmail, adminEmail),
  }))

  return { users, reports, comments, notifications }
}

async function main() {
  loadEnvFile()

  const { users, reports, comments, notifications } = loadSeedData()

  const baseUrl = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL
  const adminEmail = process.env.POCKETBASE_SU_EMAIL
  const adminPassword = process.env.POCKETBASE_SU_PASSWORD

  if (!baseUrl || !adminEmail || !adminPassword) {
    throw new Error("Missing POCKETBASE_URL, POCKETBASE_SU_EMAIL, or POCKETBASE_SU_PASSWORD in .env.local")
  }

  const pb = new PocketBase(baseUrl)
  
  // Authenticate as superuser
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword)

  const publicRules = {
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
  }

  const collectionsToOpen = ["users", "reports", "comments", "notifications", "audit_logs", "flags"]
  for (const name of collectionsToOpen) {
    const collection = await pb.collections.getOne(name)
    await pb.collections.update(collection.id, publicRules)
  }

  const userIdByEmail = {}
  for (const user of users) {
    let record
    try {
      record = await pb.collection("users").getFirstListItem(`email="${user.email}"`)
    } catch (err) {
      record = null
    }

    if (record) {
      const updated = await pb.collection("users").update(record.id, {
        name: user.name,
        avatarSeed: user.avatarSeed,
        points: user.points,
        badges: user.badges,
        isPublic: user.isPublic,
        isBanned: user.isBanned,
        isAdmin: user.isAdmin,
        warnings: user.warnings,
      })
      userIdByEmail[user.email] = updated.id
    } else {
      const created = await pb.collection("users").create({
        email: user.email,
        password: DEFAULT_PASSWORD,
        passwordConfirm: DEFAULT_PASSWORD,
        name: user.name,
        avatarSeed: user.avatarSeed,
        points: user.points,
        badges: user.badges,
        isPublic: user.isPublic,
        isBanned: user.isBanned,
        isAdmin: user.isAdmin,
        warnings: user.warnings,
      })
      userIdByEmail[user.email] = created.id
    }
  }

  const reportIdByKey = {}
  for (const report of reports) {
    const createdBy = userIdByEmail[report.createdByEmail]
    const followers = report.followersEmails.map((email) => userIdByEmail[email]).filter(Boolean)
    const upvotes = report.upvotesEmails.map((email) => userIdByEmail[email]).filter(Boolean)
    const confirmations = report.confirmationsEmails.map((email) => userIdByEmail[email]).filter(Boolean)
    const flaggedBy = report.flaggedByEmails.map((email) => userIdByEmail[email]).filter(Boolean)

    let record
    try {
      record = await pb.collection("reports").getFirstListItem(`title="${report.title.replace(/"/g, '\\"')}"`)
    } catch (err) {
      record = null
    }

    const payload = {
      title: report.title,
      description: report.description,
      category: report.category,
      photos: [],
      latitude: report.latitude,
      longitude: report.longitude,
      address: report.address,
      landmark: report.landmark,
      status: report.status,
      createdBy,
      followers,
      upvotes,
      upvoteCount: upvotes.length,
      confirmations,
      confirmationCount: confirmations.length,
      flagCount: flaggedBy.length,
      flaggedBy,
      isHidden: report.isHidden,
      commentsLocked: report.commentsLocked,
    }

    if (record) {
      const updated = await pb.collection("reports").update(record.id, payload)
      reportIdByKey[report.key] = updated.id
    } else {
      const created = await pb.collection("reports").create(payload)
      reportIdByKey[report.key] = created.id
    }
  }

  const commentIdByKey = {}
  for (const comment of comments) {
    const reportId = reportIdByKey[comment.reportKey]
    const userId = userIdByEmail[comment.userEmail]
    const reactions = {
      like: comment.reactions.like.map((email) => userIdByEmail[email]).filter(Boolean),
      support: comment.reactions.support.map((email) => userIdByEmail[email]).filter(Boolean),
      urgent: comment.reactions.urgent.map((email) => userIdByEmail[email]).filter(Boolean),
    }

    const payload = {
      reportId,
      userId,
      content: comment.content,
      photos: [],
      parentId: comment.parentKey ? commentIdByKey[comment.parentKey] || null : null,
      reactions,
      isHidden: false,
    }

    let record
    try {
      record = await pb
        .collection("comments")
        .getFirstListItem(`content="${comment.content.replace(/"/g, '\\"')}" && reportId="${reportId}"`)
    } catch (err) {
      record = null
    }

    if (record) {
      const updated = await pb.collection("comments").update(record.id, payload)
      commentIdByKey[comment.key] = updated.id
    } else {
      const created = await pb.collection("comments").create(payload)
      commentIdByKey[comment.key] = created.id
    }
  }

  for (const notif of notifications) {
    const userId = userIdByEmail[notif.userEmail]
    const reportId = notif.reportKey ? reportIdByKey[notif.reportKey] : ""
    const commentId = notif.commentKey ? commentIdByKey[notif.commentKey] : ""

    let record
    try {
      record = await pb
        .collection("notifications")
        .getFirstListItem(`title="${notif.title.replace(/"/g, '\\"')}" && userId="${userId}"`)
    } catch (err) {
      record = null
    }

    const payload = {
      userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      relatedReportId: reportId,
      relatedCommentId: commentId,
      isRead: false,
    }

    if (record) {
      await pb.collection("notifications").update(record.id, payload)
    } else {
      await pb.collection("notifications").create(payload)
    }
  }

  console.log("PocketBase seed completed.")
  console.log(`Default user password: ${DEFAULT_PASSWORD}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
