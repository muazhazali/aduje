#!/usr/bin/env node

const PocketBase = require('pocketbase/cjs')
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!')
    process.exit(1)
  }

  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const [key, ...rest] = line.split('=')
    if (!key) continue
    const value = rest.join('=').trim()
    if (key && !process.env[key]) {
      process.env[key] = value.replace(/^['"]|['"]$/g, '')
    }
  }
}

loadEnvFile()

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.POCKETBASE_URL
const ADMIN_EMAIL = process.env.POCKETBASE_SU_EMAIL
const ADMIN_PASSWORD = process.env.POCKETBASE_SU_PASSWORD

async function main() {
  console.log('🔍 Testing PocketBase Connection\n')
  console.log('URL:', POCKETBASE_URL)
  console.log('Admin Email:', ADMIN_EMAIL)
  console.log('Admin Password:', ADMIN_PASSWORD ? '***' + ADMIN_PASSWORD.substring(ADMIN_PASSWORD.length - 3) : 'NOT SET')
  console.log('')

  const pb = new PocketBase(POCKETBASE_URL)

  try {
    // Test basic connection
    console.log('Testing health...')
    const health = await pb.health.check()
    console.log('✅ PocketBase is healthy:', health)
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
  }

  try {
    // Try to fetch users without auth
    console.log('\nFetching users (no auth)...')
    const users = await pb.collection('users').getList(1, 5)
    console.log(`✅ Found ${users.items.length} users`)
    users.items.forEach(u => {
      console.log(`   - ${u.name || u.username} (${u.email || 'no email'}) - ${u.points} pts`)
    })
  } catch (error) {
    console.error('❌ Failed to fetch users:', error.message)
  }

  try {
    // Try admin auth
    console.log('\nAttempting admin authentication...')
    const authData = await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
    console.log('✅ Admin authenticated:', authData.admin.email)
    console.log('   Token:', authData.token.substring(0, 30) + '...')
  } catch (error) {
    console.error('❌ Admin auth failed:', error.message)
    console.log('\nTrying user auth instead...')
    
    try {
      const userAuth = await pb.collection('users').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
      console.log('✅ User authenticated:', userAuth.record.name)
      console.log('   Is Admin:', userAuth.record.isAdmin)
    } catch (userError) {
      console.error('❌ User auth also failed:', userError.message)
    }
  }
}

main()
