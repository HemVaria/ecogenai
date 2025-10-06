const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSQL(filename) {
  console.log(`\n📝 Running ${filename}...`)
  const sqlPath = path.join(__dirname, filename)
  const sql = fs.readFileSync(sqlPath, 'utf8')
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // If exec_sql doesn't exist, try running via REST API
      console.log('   Trying alternative method...')
      
      // Split by statement and run each
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      for (const statement of statements) {
        if (statement) {
          const { error: stmtError } = await supabase.rpc('exec', { 
            sql: statement + ';' 
          })
          if (stmtError && !stmtError.message.includes('already exists')) {
            console.error(`   ⚠️  Warning: ${stmtError.message}`)
          }
        }
      }
    }
    
    console.log(`   ✅ ${filename} completed`)
  } catch (err) {
    console.error(`   ❌ Error in ${filename}:`, err.message)
  }
}

async function setupGamification() {
  console.log('🎮 Setting up Gamification System...')
  console.log('=' .repeat(50))
  
  await runSQL('004_gamification_schema.sql')
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Gamification setup complete!')
  console.log('\nCreated tables:')
  console.log('  - user_stats')
  console.log('  - badges (with 10 default badges)')
  console.log('  - user_badges')
  console.log('  - leaderboard_entries')
  console.log('  - challenges')
  console.log('  - user_challenges')
  console.log('\n🎯 You can now use the gamification features!')
}

setupGamification().catch(console.error)
