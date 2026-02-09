import PocketBase from "pocketbase"

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "https://your-pb.pockethost.io")

export default pb

export function getFileUrl(record: { id: string; collectionId?: string; collectionName?: string }, filename: string) {
  if (!filename) return ""
  if (filename.startsWith("http")) return filename
  return `${pb.baseURL}/api/files/${record.collectionName || record.collectionId}/${record.id}/${filename}`
}

export function isLoggedIn() {
  return pb.authStore.isValid
}

export function getCurrentUser() {
  return pb.authStore.record
}
