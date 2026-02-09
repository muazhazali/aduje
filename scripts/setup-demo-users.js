#!/usr/bin/env node

/**
 * Setup script to create demo users with proper authentication
 * This ensures demo users can actually log in and perform authenticated actions
 */

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

// Demo users with passwords for proper authentication
const DEMO_USERS = [
  {
    username: 'ahmad_demo',
    email: 'ahmad.demo@example.com',
    password: 'DemoPass123!',
    passwordConfirm: 'DemoPass123!',
    name: 'Ahmad Ibrahim',
    points: 780,
    avatarSeed: 'ahmad',
    isPublic: true,
    isAdmin: false,
    badges: ['early_adopter', 'contributor']
  },
  {
    username: 'siti_demo',
    email: 'siti.demo@example.com',
    password: 'DemoPass123!',
    passwordConfirm: 'DemoPass123!',
    name: 'Siti Nurhaliza',
    points: 560,
    avatarSeed: 'siti',
    isPublic: true,
    isAdmin: false,
    badges: ['active_reporter']
  },
  {
    username: 'kumar_demo',
    email: 'kumar.demo@example.com',
    password: 'DemoPass123!',
    passwordConfirm: 'DemoPass123!',
    name: 'Kumar Rajesh',
    points: 450,
    avatarSeed: 'kumar',
    isPublic: true,
    isAdmin: false,
    badges: []
  },
  {
    username: 'lim_demo',
    email: 'lim.demo@example.com',
    password: 'DemoPass123!',
    passwordConfirm: 'DemoPass123!',
    name: 'Lim Wei Jian',
    points: 320,
    avatarSeed: 'lim',
    isPublic: true,
    isAdmin: false,
    badges: []
  }
]

async function main() {
  if (!POCKETBASE_URL) {
    console.error('❌ POCKETBASE_URL not set in environment!')
    process.exit(1)
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Admin credentials not found in environment!')
    console.error('   Required: POCKETBASE_SU_EMAIL and POCKETBASE_SU_PASSWORD')
    process.exit(1)
  }

  const pb = new PocketBase(POCKETBASE_URL)

  console.log('🔧 Setting up Demo Users for ReporterMY\n')
  console.log('=' .repeat(60))

  try {
    // Authenticate as admin
    console.log('\n🔐 Authenticating as admin...')
    await pb.collection('users').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
    console.log(`✅ Authenticated as: ${pb.authStore.record.name}`)

    // Create or update demo users
    console.log('\n👥 Creating/updating demo users...\n')
    
    const createdUsers = []
    
    for (const demoUser of DEMO_USERS) {
      try {
        // Check if user already exists
        let existingUser = null
        try {
          const users = await pb.collection('users').getFullList({
            filter: `email = "${demoUser.email}"`
          })
          existingUser = users[0]
        } catch (e) {
          // User doesn't exist
        }

        if (existingUser) {
          console.log(`📝 Updating existing user: ${demoUser.name}`)
          
          // Update user (excluding password fields)
          const updateData = { ...demoUser }
          delete updateData.password
          delete updateData.passwordConfirm
          
          const updated = await pb.collection('users').update(existingUser.id, updateData)
          console.log(`   ✅ Updated: ${updated.email}`)
          
          // Note: To update password, we need to use a different method
          console.log(`   ⚠️  Password not updated (use PocketBase admin panel to reset if needed)`)
          
          createdUsers.push(updated)
        } else {
          console.log(`➕ Creating new user: ${demoUser.name}`)
          
          const created = await pb.collection('users').create(demoUser)
          console.log(`   ✅ Created: ${created.email}`)
          
          createdUsers.push(created)
        }
      } catch (error) {
        console.error(`   ❌ Error with ${demoUser.name}:`, error.message)
        if (error.response?.data) {
          console.error('      Details:', JSON.stringify(error.response.data, null, 2))
        }
      }
    }

    // Test authentication with one of the demo users
    console.log('\n🧪 Testing demo user authentication...')
    const testUser = DEMO_USERS[0]
    
    const testPb = new PocketBase(POCKETBASE_URL)
    try {
      const authData = await testPb.collection('users').authWithPassword(
        testUser.email,
        testUser.password
      )
      console.log(`✅ Successfully authenticated as: ${authData.record.name}`)
      console.log(`   Auth token received: ${authData.token.substring(0, 30)}...`)
      console.log(`   Auth valid: ${testPb.authStore.isValid}`)
    } catch (error) {
      console.error(`❌ Authentication test failed:`, error.message)
      if (error.response?.data) {
        console.error('   Details:', error.response.data)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('\n✅ Demo User Setup Complete!\n')
    console.log('Demo accounts created/updated:')
    console.log('')
    DEMO_USERS.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name}`)
      console.log(`   Email: ${u.email}`)
      console.log(`   Password: ${u.password}`)
      console.log(`   Points: ${u.points}`)
      console.log('')
    })
    
    console.log('💡 Next Steps:')
    console.log('   1. Update the login page to use authWithPassword()')
    console.log('   2. Store credentials or create a proper demo login flow')
    console.log('   3. Test authentication in the browser')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.response) {
      console.error('Response:', error.response)
    }
    process.exit(1)
  }
}

main()
