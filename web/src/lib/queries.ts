import type { Database, DayState } from './database.types'
import type { createClient } from './supabase'
import { normalizeCommitmentName } from './categories'

// Derive DB from our own createClient wrapper — this is always in sync
// with whatever @supabase/ssr returns, avoiding generic version-mismatch
// errors between @supabase/ssr and @supabase/supabase-js.
type DB = ReturnType<typeof createClient>

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

// ─── Challenge ────────────────────────────────────────────────────────────────

export async function getActiveChallenge(db: DB) {
  const { data, error } = await db
    .from('challenges')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  throwIfError(error)
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
  const { data, error } = await db
    .from('commitments')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('sort_order')
  throwIfError(error)
  const commitments = data ?? []
  if (commitments.length === 0) return commitments

  const renamed = commitments
    .map(c => {
      const normalizedName = normalizeCommitmentName(c.category, c.name)
      return normalizedName === c.name ? null : { id: c.id, name: normalizedName }
    })
    .filter((c): c is { id: string; name: string } => c !== null)

  if (renamed.length > 0) {
    await Promise.all(
      renamed.map(c =>
        db.from('commitments').update({ name: c.name }).eq('id', c.id)
      )
    )
  }

  return commitments.map(c => ({
    ...c,
    name: normalizeCommitmentName(c.category, c.name),
  }))
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
  const { data: existing, error: existingError } = await db
    .from('commitments')
    .select('definition')
    .eq('id', commitmentId)
    .single()
  throwIfError(existingError)

  const { error: historyError } = await db.from('commitment_history').insert({
    commitment_id:   commitmentId,
    old_definition:  existing?.definition ?? null,
    new_definition:  definition,
    changed_on_day:  dayNumber,
    changed_at:      new Date().toISOString(),
  })
  throwIfError(historyError)

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
  const { data, error } = await db
    .from('commitment_history')
    .select('id')
    .eq('commitment_id', commitmentId)
    .gt('changed_on_day', sinceDay)
    .limit(1)
  throwIfError(error)
  return (data?.length ?? 0) > 0
}

export async function getOrCreateDailyLog(db: DB, challengeId: string, dayNumber: number, logDate: string) {
  const { data: existing, error: existingError } = await db
    .from('daily_logs')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('day_number', dayNumber)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  throwIfError(existingError)

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
  const { data, error } = await db
    .from('daily_logs')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('day_number')
  throwIfError(error)
  return data ?? []
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNote(db: DB, dailyLogId: string) {
  const { data, error } = await db
    .from('day_notes')
    .select('note_text')
    .eq('daily_log_id', dailyLogId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  throwIfError(error)
  return data?.note_text ?? ''
}

export async function saveNote(db: DB, dailyLogId: string, text: string) {
  if (!text.trim()) {
    const { error } = await db.from('day_notes').delete().eq('daily_log_id', dailyLogId)
    throwIfError(error)
  } else {
    const { error } = await db.from('day_notes').upsert(
      { daily_log_id: dailyLogId, note_text: text },
      { onConflict: 'daily_log_id' }
    )
    throwIfError(error)
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
  const { data, error } = await db
    .from('commitment_logs')
    .select('*')
    .eq('daily_log_id', dailyLogId)
  throwIfError(error)
  return data ?? []
}

export async function saveCommitmentLog(
  db: DB,
  dailyLogId: string,
  commitmentId: string,
  state: DayState,
  numericValue?: number,
) {
  const { error } = await db
    .from('commitment_logs')
    .upsert(
      {
        daily_log_id:  dailyLogId,
        commitment_id: commitmentId,
        state,
        ...(numericValue !== undefined ? { numeric_value: numericValue } : {}),
      },
      { onConflict: 'daily_log_id,commitment_id' }
    )
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
  const { data, error } = await db
    .from('benchmarks')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  throwIfError(error)
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

export interface PhotoGalleryEntry {
  id: string
  dailyLogId: string
  commitmentId: string
  commitmentName: string
  commitmentCategory: string
  dayNumber: number
  logDate: string
  photoUrl: string
  noteText: string
  reflection: Reflection | null
  createdAt: string
}

export async function getPhotoGalleryEntries(db: DB, challengeId: string): Promise<PhotoGalleryEntry[]> {
  const { data: dailyLogs, error: dailyErr } = await db
    .from('daily_logs')
    .select('id, day_number, log_date, reflection')
    .eq('challenge_id', challengeId)
    .order('day_number', { ascending: false })
  throwIfError(dailyErr)

  const dailyRows = dailyLogs ?? []
  if (dailyRows.length === 0) return []

  const dailyIds = dailyRows.map(d => d.id)
  const dailyById = new Map(dailyRows.map(d => [d.id, d]))

  const { data: photoLogs, error: photoErr } = await db
    .from('commitment_logs')
    .select('id, daily_log_id, commitment_id, photo_url, created_at')
    .in('daily_log_id', dailyIds)
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false })
  throwIfError(photoErr)

  const photoRows = (photoLogs ?? []).filter(r => !!r.photo_url)
  if (photoRows.length === 0) return []

  const commitmentIds = Array.from(new Set(photoRows.map(r => r.commitment_id)))

  const [{ data: commitments, error: commErr }, { data: notes, error: notesErr }] = await Promise.all([
    db
      .from('commitments')
      .select('id, name, category')
      .in('id', commitmentIds),
    db
      .from('day_notes')
      .select('daily_log_id, note_text, updated_at')
      .in('daily_log_id', dailyIds)
      .order('updated_at', { ascending: false }),
  ])
  throwIfError(commErr)
  throwIfError(notesErr)

  const commitmentById = new Map((commitments ?? []).map(c => [c.id, c]))
  const noteByDailyId = new Map<string, string>()
  for (const n of notes ?? []) {
    if (!noteByDailyId.has(n.daily_log_id)) noteByDailyId.set(n.daily_log_id, n.note_text)
  }

  const entries = photoRows
    .map(row => {
      const daily = dailyById.get(row.daily_log_id)
      const commitment = commitmentById.get(row.commitment_id)
      if (!daily || !commitment || !row.photo_url) return null

      return {
        id: row.id,
        dailyLogId: row.daily_log_id,
        commitmentId: row.commitment_id,
        commitmentName: commitment.name,
        commitmentCategory: commitment.category,
        dayNumber: daily.day_number,
        logDate: daily.log_date,
        photoUrl: row.photo_url,
        noteText: noteByDailyId.get(row.daily_log_id) ?? '',
        reflection: daily.reflection as Reflection | null,
        createdAt: row.created_at,
      } satisfies PhotoGalleryEntry
    })
    .filter((e): e is PhotoGalleryEntry => !!e)
    .sort((a, b) => {
      if (b.dayNumber !== a.dayNumber) return b.dayNumber - a.dayNumber
      return b.createdAt.localeCompare(a.createdAt)
    })

  return entries
}

export async function recalcOverallState(db: DB, dailyLogId: string, allStates: DayState[]) {
  const overall: DayState =
    allStates.every(s => s === 'complete') ? 'complete'
    : allStates.every(s => s === 'none')   ? 'none'
    : 'partial'

  const { error } = await db
    .from('daily_logs')
    .update({ overall_state: overall, logged_at: new Date().toISOString() })
    .eq('id', dailyLogId)
  throwIfError(error)

  return overall
}
