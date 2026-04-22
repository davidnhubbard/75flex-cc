/**
 * Seeds test personas for local development.
 * Run: npx tsx supabase/seed.ts
 *
 * Requires env vars:
 *   SUPABASE_URL             (e.g. http://127.0.0.1:54321 for local)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Persona definitions
// ---------------------------------------------------------------------------

export const DEV_PERSONAS = [
  {
    email: 'new@75flex.dev',
    password: 'testtest',
    label: 'New User',
    description: 'No challenge started',
    daysLogged: 0,
  },
  {
    email: 'day2@75flex.dev',
    password: 'testtest',
    label: 'Day 2',
    description: '2 days in, all complete',
    daysLogged: 2,
  },
  {
    email: 'reengagement@75flex.dev',
    password: 'testtest',
    label: 'Re-engagement',
    description: 'Day 15, missed last 4 days',
    daysLogged: 15,
    gapStart: 12, // days 12-15 are missed
  },
  {
    email: 'day60@75flex.dev',
    password: 'testtest',
    label: 'Day 60',
    description: '60 days in, realistic mix',
    daysLogged: 60,
  },
  {
    email: 'day75@75flex.dev',
    password: 'testtest',
    label: 'Day 75',
    description: 'Just completed the challenge',
    daysLogged: 75,
  },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMMITMENTS = [
  { category: 'physical',     name: 'One workout',   definition: 'At least 30 minutes of intentional movement' },
  { category: 'nutrition',    name: 'Nutrition',     definition: 'Follow your plan, no junk food' },
  { category: 'hydration',    name: 'Water',         definition: 'Drink at least 64 oz of water' },
  { category: 'personal_dev', name: 'Personal dev',  definition: '10 minutes of reading or a podcast' },
]

function dayState(day: number, gapStart?: number): 'none' | 'partial' | 'complete' {
  if (gapStart && day >= gapStart) return 'none'
  if (day % 10 === 9) return 'none'
  if (day % 10 === 4) return 'partial'
  return 'complete'
}

function overallState(states: ('none' | 'partial' | 'complete')[]): 'none' | 'partial' | 'complete' {
  if (states.every(s => s === 'complete')) return 'complete'
  if (states.every(s => s === 'none'))     return 'none'
  return 'partial'
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// Seed one persona
// ---------------------------------------------------------------------------

async function seedPersona(persona: typeof DEV_PERSONAS[number]) {
  console.log(`\nSeeding: ${persona.label} (${persona.email})`)

  // Delete existing user if present
  const { data: existing } = await admin.auth.admin.listUsers()
  const found = existing.users.find(u => u.email === persona.email)
  if (found) {
    await admin.auth.admin.deleteUser(found.id)
    console.log('  Deleted existing user')
  }

  // Create user
  const { data: { user }, error: userErr } = await admin.auth.admin.createUser({
    email: persona.email,
    password: persona.password,
    email_confirm: true,
  })
  if (userErr || !user) throw new Error(`Failed to create user: ${userErr?.message}`)
  console.log(`  Created user ${user.id}`)

  if (persona.daysLogged === 0) {
    console.log('  No challenge data needed')
    return
  }

  // Create challenge
  const startDate = addDays(new Date(), -(persona.daysLogged - 1))
  const endDate = addDays(startDate, 74)
  const status = persona.daysLogged >= 75 ? 'complete' : 'active'

  const { data: challenge, error: challengeErr } = await admin
    .from('challenges')
    .insert({
      user_id: user.id,
      title: '75 Soft challenge',
      template: '75_soft',
      start_date: toDateStr(startDate),
      end_date: toDateStr(endDate),
      status,
    })
    .select()
    .single()

  if (challengeErr || !challenge) throw new Error(`Failed to create challenge: ${challengeErr?.message}`)
  console.log(`  Created challenge ${challenge.id}`)

  // Create commitments
  const { data: commitments, error: commitErr } = await admin
    .from('commitments')
    .insert(COMMITMENTS.map((c, i) => ({
      challenge_id: challenge.id,
      ...c,
      sort_order: i,
      active_from: 1,
    })))
    .select()

  if (commitErr || !commitments) throw new Error(`Failed to create commitments: ${commitErr?.message}`)

  // Create daily logs
  const gapStart = 'gapStart' in persona ? persona.gapStart : undefined

  for (let day = 1; day <= persona.daysLogged; day++) {
    const logDate = addDays(startDate, day - 1)
    const commitStates = commitments.map(() => dayState(day, gapStart))
    const overall = overallState(commitStates)

    const { data: dailyLog, error: logErr } = await admin
      .from('daily_logs')
      .insert({
        challenge_id: challenge.id,
        day_number: day,
        log_date: toDateStr(logDate),
        overall_state: overall,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logErr || !dailyLog) throw new Error(`Failed to create daily log day ${day}: ${logErr?.message}`)

    await admin.from('commitment_logs').insert(
      commitments.map((c, i) => ({
        daily_log_id: dailyLog.id,
        commitment_id: c.id,
        state: commitStates[i],
        numeric_value: c.category === 'hydration' && commitStates[i] !== 'none' ? 64 : null,
      }))
    )
  }

  console.log(`  Seeded ${persona.daysLogged} days`)
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  console.log('75 Flex — seeding dev personas...')
  for (const persona of DEV_PERSONAS) {
    await seedPersona(persona)
  }
  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
