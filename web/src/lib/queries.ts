import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, DayState } from './database.types'

type DB = SupabaseClient<Database>

// ─── Challenge ────────────────────────────────────────────────────────────────

export async function getActiveChallenge(db: DB) {
  const { data } = await db
    .from('challenges')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()
  return data
}

export async function archiveChallenge(db: DB, challengeId: string) {
  const { error } = await db
    .from('challenges')
    .update({ status: 'archived' })
    .eq('id', challengeId)
  if (error) throw new Error(error.message)
}

export async function createChallenge(db: DB, payload: {
  title: string
  template: Database['public']['Tables']['challenges']['Insert']['template']
  startDate: string
  durationDays?: number
}) {
  const duration = payload.durationDays ?? 75
  const end = new Date(payload.startDate)
  end.setDate(end.getDate() + duration - 1)

  const { data: { user } } = await db.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await db
    .from('challenges')
    .insert({
      user_id:      user.id,
      title:        payload.title,
      template:     payload.template,
      start_date:   payload.startDate,
      end_date:     end.toISOString().split('T')[0],
      status:       'active',
      duration_days: duration,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Commitments ─────────────────────────────────────────────────────────────

export async function getCommitments(db: DB, challengeId: string) {
  const { data } = await db
    .from('commitments')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('sort_order')
  return data ?? []
}

export async function createCommitments(db: DB, challengeId: string, items: {
  category: string
  name: string
  definition: string
  sortOrder: number
  required?: boolean
  targetValue?: number
  targetUnit?: 'oz' | 'ml'
}[]) {
  const { error } = await db.from('commitments').insert(
    items.map(c => ({
      challenge_id: challengeId,
      category:     c.category,
      name:         c.name,
      definition:   c.definition || null,
      sort_order:   c.sortOrder,
      active_from:  1,
      required:     c.required ?? false,
      target_value: c.targetValue ?? null,
      target_unit:  c.targetUnit ?? null,
    }))
  )
  if (error) throw new Error(error.message)
}

export async function updateHydrationGoal(db: DB, commitmentId: string, targetValue: number, targetUnit: 'oz' | 'ml') {
  const { error } = await db
    .from('commitments')
    .update({ target_value: targetValue, target_unit: targetUnit })
    .eq('id', commitmentId)
  if (error) throw new Error(error.message)
}

export async function updateCommitmentRequired(db: DB, commitmentId: string, required: boolean) {
  const { error } = await db
    .from('commitments')
    .update({ required })
    .eq('id', commitmentId)
  if (error) throw new Error(error.message)
}

export async function updateCommitmentDefinition(db: DB, commitmentId: string, definition: string, dayNumber: number) {
  const { data: existing } = await db
    .from('commitments')
    .select('definition')
    .eq('id', commitmentId)
    .single()

  await db.from('commitment_history').insert({
    commitment_id:   commitmentId,
    old_definition:  existing?.definition ?? null,
    new_definition:  definition,
    changed_on_day:  dayNumber,
    changed_at:      new Date().toISOString(),
  })

  const { error } = await db
    .from('commitments')
    .update({ definition })
    .eq('id', commitmentId)

  if (error) throw new Error(error.message)
}

// ─── Daily logs ───────────────────────────────────────────────────────────────

export function calcDayNumber(startDate: string, durationDays = 75): number {
  const start = new Date(startDate)
  const today = new Date()
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000)
  return Math.min(durationDays, Math.max(1, diff + 1))
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function dateForDay(startDate: string, dayNumber: number): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() + dayNumber - 1)
  return d.toISOString().split('T')[0]
}

export async function hasCommitmentChangedSince(db: DB, commitmentId: string, sinceDay: number) {
  const { data } = await db
    .from('commitment_history')
    .select('id')
    .eq('commitment_id', commitmentId)
    .gt('changed_on_day', sinceDay)
    .limit(1)
  return (data?.length ?? 0) > 0
}

export async function getOrCreateDailyLog(db: DB, challengeId: string, dayNumber: number, logDate: string) {
  const { data: existing } = await db
    .from('daily_logs')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await db
    .from('daily_logs')
    .insert({ challenge_id: challengeId, day_number: dayNumber, log_date: logDate, overall_state: 'none' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getAllDailyLogs(db: DB, challengeId: string) {
  const { data } = await db
    .from('daily_logs')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('day_number')
  return data ?? []
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNote(db: DB, dailyLogId: string) {
  const { data } = await db
    .from('day_notes')
    .select('note_text')
    .eq('daily_log_id', dailyLogId)
    .maybeSingle()
  return data?.note_text ?? ''
}

export async function saveNote(db: DB, dailyLogId: string, text: string) {
  if (!text.trim()) {
    await db.from('day_notes').delete().eq('daily_log_id', dailyLogId)
  } else {
    await db.from('day_notes').upsert(
      { daily_log_id: dailyLogId, note_text: text },
      { onConflict: 'daily_log_id' }
    )
  }
}

// ─── Reflection ───────────────────────────────────────────────────────────────

export type Reflection = 'felt_good' | 'tough_but_done' | 'almost_quit'

export async function saveReflection(db: DB, dailyLogId: string, reflection: Reflection | null) {
  const { error } = await db
    .from('daily_logs')
    .update({ reflection })
    .eq('id', dailyLogId)
  if (error) throw new Error(error.message)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function calcStreak(logs: { day_number: number; overall_state: string }[], currentDay: number) {
  let streak = 0
  for (let d = currentDay; d >= 1; d--) {
    const log = logs.find(l => l.day_number === d)
    if (log && log.overall_state !== 'none') streak++
    else break
  }
  return streak
}

export function calcShowUpRate(logs: { overall_state: string }[], currentDay: number) {
  const active = logs.filter(l => l.overall_state !== 'none').length
  return Math.round((active / currentDay) * 100)
}

// ─── Commitment logs ──────────────────────────────────────────────────────────

export async function getCommitmentLogs(db: DB, dailyLogId: string) {
  const { data } = await db
    .from('commitment_logs')
    .select('*')
    .eq('daily_log_id', dailyLogId)
  return data ?? []
}

export async function saveCommitmentLog(
  db: DB,
  dailyLogId: string,
  commitmentId: string,
  state: DayState,
  numericValue?: number,
) {
  const payload: Record<string, unknown> = { daily_log_id: dailyLogId, commitment_id: commitmentId, state }
  if (numericValue !== undefined) payload.numeric_value = numericValue
  const { error } = await db
    .from('commitment_logs')
    .upsert(payload, { onConflict: 'daily_log_id,commitment_id' })
  if (error) throw new Error(error.message)
}

export async function addHydration(
  db: DB,
  dailyLogId: string,
  commitmentId: string,
  addAmount: number,
  targetValue: number,
): Promise<{ newValue: number; state: DayState }> {
  const { data: existing } = await db
    .from('commitment_logs')
    .select('numeric_value')
    .eq('daily_log_id', dailyLogId)
    .eq('commitment_id', commitmentId)
    .maybeSingle()

  const current = existing?.numeric_value ?? 0
  const newValue = current + addAmount
  const state: DayState = newValue >= targetValue ? 'complete' : newValue > 0 ? 'partial' : 'none'
  await saveCommitmentLog(db, dailyLogId, commitmentId, state, newValue)
  return { newValue, state }
}

export async function setHydration(
  db: DB,
  dailyLogId: string,
  commitmentId: string,
  value: number,
  targetValue: number,
): Promise<{ newValue: number; state: DayState }> {
  const state: DayState = value >= targetValue ? 'complete' : value > 0 ? 'partial' : 'none'
  await saveCommitmentLog(db, dailyLogId, commitmentId, state, value)
  return { newValue: value, state }
}

// ─── Benchmark ────────────────────────────────────────────────────────────────

export async function getBenchmark(db: DB, challengeId: string) {
  const { data } = await db
    .from('benchmarks')
    .select('*')
    .eq('challenge_id', challengeId)
    .maybeSingle()
  return data
}

export async function saveBenchmark(db: DB, challengeId: string, payload: {
  notesText: string
  photoUrl: string | null
}) {
  const { error } = await db.from('benchmarks').upsert(
    { challenge_id: challengeId, notes_text: payload.notesText || null, photo_url: payload.photoUrl },
    { onConflict: 'challenge_id' }
  )
  if (error) throw new Error(error.message)
}

export async function uploadBenchmarkPhoto(db: DB, userId: string, challengeId: string, file: File): Promise<string> {
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${userId}/${challengeId}.${ext}`
  const { error } = await db.storage
    .from('benchmark-photos')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = db.storage.from('benchmark-photos').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function uploadProgressPhoto(
  db: DB,
  userId: string,
  challengeId: string,
  dayNumber: number,
  file: File,
): Promise<string> {
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${userId}/${challengeId}/day-${dayNumber}.${ext}`
  const { error } = await db.storage
    .from('progress-photos')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = db.storage.from('progress-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function savePhotoUrl(
  db: DB,
  dailyLogId: string,
  commitmentId: string,
  photoUrl: string | null,
) {
  const { error } = await db
    .from('commitment_logs')
    .update({ photo_url: photoUrl })
    .eq('daily_log_id', dailyLogId)
    .eq('commitment_id', commitmentId)
  if (error) throw new Error(error.message)
}

export async function recalcOverallState(db: DB, dailyLogId: string, allStates: DayState[]) {
  const overall: DayState =
    allStates.every(s => s === 'complete') ? 'complete'
    : allStates.every(s => s === 'none')   ? 'none'
    : 'partial'

  await db
    .from('daily_logs')
    .update({ overall_state: overall, logged_at: new Date().toISOString() })
    .eq('id', dailyLogId)

  return overall
}
