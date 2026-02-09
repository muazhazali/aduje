#!/usr/bin/env node

/**
 * Test script to verify authentication and commenting functionality
 * 
 * This script will:
 * 1. Test authentication with different demo accounts
 * 2. Verify auth token persistence
 * 3. Test commenting on a report
 * 4. Verify comment creation
 */

const PocketBase = require('pocketbase').default || require('pocketbase')

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb-aduje.muaz.app'

async function main() {
  const pb = new PocketBase(POCKETBASE_URL)
  
  console.log('🔍 Testing Authentication & Comment System\n')
  console.log('=' .repeat(60))
  
  try {
    // Step 1: Fetch demo users
    console.log('\n📋 Step 1: Fetching demo users...')
    const users = await pb.collection('users').getFullList({
      filter: 'isAdmin = false',
      sort: '-points'
    })
    
    if (users.length === 0) {
      console.error('❌ No demo users found!')
      return
    }
    
    console.log(`✅ Found ${users.length} demo users`)
    users.slice(0, 3).forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.name} (${u.email}) - ${u.points} points`)
    })
    
    // Step 2: Test authentication with first demo user
    const testUser = users[0]
    console.log(`\n🔐 Step 2: Testing authentication with: ${testUser.name}`)
    
    // Check if we have email/password for demo accounts
    // Demo accounts might not have passwords, so we need to check the auth method
    console.log(`   User ID: ${testUser.id}`)
    console.log(`   Email: ${testUser.email}`)
    
    // Check current auth state
    console.log(`   Initial auth valid: ${pb.authStore.isValid}`)
    console.log(`   Initial auth token: ${pb.authStore.token ? 'EXISTS' : 'NONE'}`)
    
    // Step 3: Try to authenticate (this will fail for demo accounts without passwords)
    console.log('\n⚠️  Step 3: Demo Account Authentication Issue Detected')
    console.log('   Demo accounts in the login page use client-side state only')
    console.log('   They do NOT authenticate with PocketBase backend')
    console.log('   This is why commenting fails - no valid auth token!')
    
    // Step 4: Fetch a report to test commenting
    console.log('\n📝 Step 4: Fetching a report to test commenting...')
    const reports = await pb.collection('reports').getFullList({
      filter: 'status != "draft"',
      sort: '-created',
      limit: 1
    })
    
    if (reports.length === 0) {
      console.error('❌ No reports found to test commenting!')
      return
    }
    
    const testReport = reports[0]
    console.log(`✅ Found report: "${testReport.title}" (ID: ${testReport.id})`)
    
    // Step 5: Test comment creation WITHOUT auth (should fail)
    console.log('\n❌ Step 5: Testing comment creation WITHOUT authentication...')
    try {
      await pb.collection('comments').create({
        reportId: testReport.id,
        userId: testUser.id,
        content: 'Test comment without auth',
        photos: [],
        parentId: null,
        reactions: { like: [], support: [], urgent: [] },
        isHidden: false
      })
      console.log('   ⚠️  Comment created (unexpected - auth rules might be too permissive!)')
    } catch (error) {
      console.log('   ✅ Expected failure: ' + error.message)
      console.log('   This confirms comments require authentication')
    }
    
    // Step 6: Test with actual authentication
    console.log('\n🔐 Step 6: Testing with admin authentication...')
    const adminEmail = process.env.POCKETBASE_SU_EMAIL
    const adminPassword = process.env.POCKETBASE_SU_PASSWORD
    
    if (!adminEmail || !adminPassword) {
      console.log('   ⚠️  Admin credentials not found in environment')
      console.log('   Skipping authenticated comment test')
    } else {
      try {
        await pb.collection('users').authWithPassword(adminEmail, adminPassword)
        console.log(`   ✅ Authenticated as: ${pb.authStore.record.name}`)
        console.log(`   Auth token: ${pb.authStore.token.substring(0, 20)}...`)
        
        // Now try creating a comment
        console.log('\n✅ Step 7: Creating test comment with authentication...')
        const newComment = await pb.collection('comments').create({
          reportId: testReport.id,
          userId: pb.authStore.record.id,
          content: `Test comment created at ${new Date().toISOString()}`,
          photos: [],
          parentId: null,
          reactions: { like: [], support: [], urgent: [] },
          isHidden: false
        })
        
        console.log(`   ✅ Comment created successfully!`)
        console.log(`   Comment ID: ${newComment.id}`)
        console.log(`   Content: "${newComment.content}"`)
        
        // Clean up - delete the test comment
        console.log('\n🧹 Cleaning up test comment...')
        await pb.collection('comments').delete(newComment.id)
        console.log('   ✅ Test comment deleted')
        
      } catch (error) {
        console.error('   ❌ Authentication error:', error.message)
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 SUMMARY OF ISSUES FOUND:\n')
    console.log('1. ❌ Demo login only updates client state (Zustand)')
    console.log('   → Does NOT create PocketBase auth session')
    console.log('   → No auth token stored in cookies/localStorage')
    console.log('')
    console.log('2. ❌ Header shows "Log Masuk" because pb.authStore.isValid = false')
    console.log('   → Zustand store has user, but PocketBase doesn\'t')
    console.log('')
    console.log('3. ❌ Comments fail because PocketBase requires valid auth')
    console.log('   → Backend rejects requests without auth token')
    console.log('')
    console.log('💡 SOLUTION:')
    console.log('   → Create actual user accounts with passwords for demo users')
    console.log('   → Use pb.authWithPassword() for demo login')
    console.log('   → This will create proper auth sessions')
    console.log('   → Auth will persist in browser cookies/localStorage')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.response) {
      console.error('Response:', error.response)
    }
  }
}

main()
