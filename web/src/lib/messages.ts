/**
 * Daily two-part messages for the Today screen.
 * Each message has an inspiration and a tip.
 *
 * Tips cover every built feature in order of importance:
 * — EARLY (days 1–7):    core features — nav, notes, photos, backdate, hydration, benchmark, calendar
 * — BUILDING (days 8–21): secondary features — show-up rate, photo toggle, plan editing,
 *                          mark-all shortcut, help button, definition history, calendar detail, hard-day notes
 * — MID (days 22–50):    advanced features + habit science — note review, water goal edit,
 *                          restart awareness, adding commitments, sleep, morning routine, protein, reading, recovery
 * — LATE (days 51–65):   retrospective — benchmark compare, post-challenge planning,
 *                          letter note, show-up rate, photo timeline, archive
 * — FINAL (days 66+):    completion — day-1 note, final reflection, what comes next, share, completion screen
 *
 * Selection is deterministic — same day always shows same message.
 * Priority: milestone > phase.
 */

export interface DailyMessage {
  inspiration: string
  tip: string
}

// ── Phase libraries ───────────────────────────────────────────────────────────

// Days 1–7: orient new users, teach the most critical features
const EARLY: DailyMessage[] = [
  {
    // index 0 — day 7 (7 % 7 = 0), also fallback if milestone overrides
    inspiration: 'The first week is about showing up, not perfection. One day at a time.',
    tip: 'At the bottom of the screen are three tabs — Today, Progress, and Profile. Today is your daily log. Progress shows your challenge calendar. Profile is where you manage your plan.',
  },
  {
    // index 1 — day 1
    inspiration: 'Habits form through repetition, not motivation. You\'re building the repetition right now.',
    tip: 'Tap the note button at the bottom of this screen after you log today. Even one sentence about how this day felt is worth writing — you\'ll be glad you did in 60 days.',
  },
  {
    // index 2 — day 2
    inspiration: 'Don\'t aim for a perfect day. Aim for a better one.',
    tip: 'Tap the camera icon on your photo commitment to take a photo. It doesn\'t have to be a gym shot — document a healthy meal, a hard moment, anything that made today part of your story.',
  },
  {
    // index 3 — day 3
    inspiration: 'The version of you who finishes this started exactly where you are now.',
    tip: 'Tap Progress at the bottom of the screen to see your full challenge calendar. Tap any past day to review what you logged — commitment states, your note, and any photos.',
  },
  {
    // index 4 — day 4
    inspiration: 'Small actions repeated daily are more powerful than big actions taken once.',
    tip: 'Missed something yesterday? Tap "Yesterday" at the top of this screen to log it. You can go back up to two days — tap "Day before" for two days ago.',
  },
  {
    // index 5 — day 5
    inspiration: 'Your brain is wiring new pathways right now. Every check-in counts — even the imperfect ones.',
    tip: 'The water tracker adds up across the day. Tap +8, +16, or +32 each time you drink — or tap the progress bar itself to jump straight to your full goal in one tap.',
  },
  {
    // index 6 — day 6
    inspiration: 'Starting is the hardest part. You\'ve done that. Now just keep moving.',
    tip: 'Head to Profile and add a Starting Benchmark — a photo and a few notes about where you\'re starting right now. You\'ll want something real to compare when you finish.',
  },
]

// Days 8–21: secondary features, reinforce habits, shift toward identity
const BUILDING: DailyMessage[] = [
  {
    // index 0 — day 8
    inspiration: 'The first two weeks build the habit. The next two build the identity.',
    tip: 'Open the Progress tab and check your show-up rate — the percentage of challenge days you\'ve logged. Even partial days count. That number is already worth something.',
  },
  {
    // index 1 — day 9
    inspiration: 'You\'ve cleared the first week. Your body and mind are adjusting — trust that.',
    tip: 'In Profile under My Plan, your photo commitment can be set to Optional or Required. Optional means a missed photo won\'t block the day from counting as complete.',
  },
  {
    // index 2 — day 10
    inspiration: 'It takes around 21 days to feel a new routine as normal. You\'re right in the middle of that window.',
    tip: 'Tap Edit in Profile under My Plan to change a commitment definition, adjust your water goal, add a new commitment, or remove one that isn\'t serving you.',
  },
  {
    // index 3 — day 11
    inspiration: 'The days you don\'t feel like it are the ones that matter most.',
    tip: 'See "Mark all complete" above your commitments? Tap it on days you\'ve done everything but haven\'t logged yet — it marks all non-photo commitments done at once.',
  },
  {
    // index 4 — day 12
    inspiration: 'Progress isn\'t always visible. What\'s happening under the surface is real.',
    tip: 'See the ? in the top corner of each screen? Tap it for a quick explanation of everything on that screen — useful any time you\'re unsure what something does.',
  },
  {
    // index 5 — day 13
    inspiration: 'Consistency beats intensity every single time. You\'re proving that right now.',
    tip: 'Commitment definitions can change anytime in Profile → My Plan → Edit. The app records when each change was made, so your history stays accurate even as your goals evolve.',
  },
  {
    // index 6 — day 14 (milestone likely overrides, but good fallback)
    inspiration: 'You\'re not just building habits — you\'re building evidence that you can do hard things.',
    tip: 'Tap any day in your Progress calendar to see the complete record for that day — every commitment state, your note, and photos. It\'s your full challenge journal.',
  },
  {
    // index 7 — day 15
    inspiration: 'Even on slow days, you\'re moving. Momentum doesn\'t need to feel fast to be real.',
    tip: 'Try writing a note on the days that feel hard — even just a sentence. Not to track, but to remember. Those entries end up being the most meaningful ones to read back.',
  },
]

// Days 22–50: advanced features, then habit science
const MID: DailyMessage[] = [
  {
    // index 0 — day 22
    inspiration: 'Around this point, the challenge starts feeling less like an obligation and more like your life.',
    tip: 'Open the Progress tab and tap a day from your first week. Read what you wrote then. That\'s how much has changed in just three weeks.',
  },
  {
    // index 1 — day 23
    inspiration: 'The middle is where most people quit. You\'re still here. That\'s everything.',
    tip: 'If your hydration goal needs adjusting, go to Profile → My Plan → Edit and tap your water commitment. You can change the goal amount or unit anytime.',
  },
  {
    // index 2 — day 24
    inspiration: 'You\'ve put real work in. Every day you show up protects what you\'ve already built.',
    tip: 'In Profile, there\'s an option to restart the challenge from Day 1. If you ever use it, everything is archived — not deleted. Your history, notes, and photos stay safe.',
  },
  {
    // index 3 — day 25
    inspiration: 'On the days that feel hardest — do the minimum. Minimum still counts.',
    tip: 'You can have up to four commitments on your plan. If you want to track something new — mindfulness, reading, personal development — add it in Profile → My Plan → Edit.',
  },
  {
    // index 4 — day 26
    inspiration: 'The goal isn\'t to be perfect. It\'s to be persistent. You\'re doing that.',
    tip: 'Sleep is the most underrated recovery tool in any challenge. If your energy is lagging, prioritize 7–8 hours before changing anything else.',
  },
  {
    // index 5 — day 27
    inspiration: 'Every time you show up when you don\'t want to, you\'re changing who you are.',
    tip: 'What you do in the first 30 minutes of your morning tends to set the tone for the whole day. Notice what\'s been working and protect it.',
  },
  {
    // index 6 — day 28
    inspiration: 'What\'s one thing you\'ve noticed about yourself since you started? Write it in today\'s note.',
    tip: 'Protein and fiber keep you full and support recovery. If you\'re eating well but still low on energy, those two are usually the answer.',
  },
  {
    // index 7 — day 29
    inspiration: 'You\'ve outlasted most people who start this. That\'s not luck — it\'s character.',
    tip: 'Reading for 10 minutes before bed is more restorative than scrolling. If you have a reading commitment, make it your wind-down ritual.',
  },
  {
    // index 8 — day 30 (milestone likely overrides)
    inspiration: 'The body adapts. The mind catches up. Trust both — they\'re already working.',
    tip: 'Stress compounds the same way habits do — in both directions. Managing it intentionally is part of the challenge, even if it\'s not a named commitment.',
  },
  {
    // index 9 — day 31
    inspiration: 'Sleep, water, intentional rest — they\'re not extras. They compound with everything else you\'re doing.',
    tip: 'If you miss a day, the only bad response is giving up. Log what you can, move on, and don\'t let one miss become two. The backdate tabs are there for exactly this.',
  },
]

// Days 51–65: retrospective features, preparing for the end
const LATE: DailyMessage[] = [
  {
    inspiration: 'You\'re in the final stretch. This is where it gets real — and where it gets worth it.',
    tip: 'Open Profile and tap your Starting Benchmark. Compare where you began to where you are now — that gap is the point of the whole challenge.',
  },
  {
    inspiration: 'The habits you\'ve built here aren\'t going anywhere when this ends.',
    tip: 'Think about which commitments you want to carry forward when this challenge ends. Deciding now makes the transition intentional rather than letting it drift.',
  },
  {
    inspiration: 'Finish how you started — with intention. Don\'t coast through the last miles.',
    tip: 'Try writing a longer note today — a letter to yourself about what this challenge has taught you. Future you will be grateful you took the time.',
  },
  {
    inspiration: 'This is the version of you that people talk about when they talk about changing.',
    tip: 'Your show-up rate on the Progress tab is worth checking right now. It\'s the most honest summary of how consistent you\'ve actually been.',
  },
  {
    inspiration: 'These final days aren\'t just about finishing — they\'re shaping what comes next.',
    tip: 'Open the Progress tab and tap a day from your first week, then a recent day. Compare what you wrote, what you photographed, who you were then versus now.',
  },
  {
    inspiration: 'The work you\'ve done is already working. In ways you can\'t fully see yet, but will.',
    tip: 'When you complete your final day, everything you\'ve logged — notes, photos, stats — is saved permanently. Nothing disappears when the challenge ends.',
  },
]

// Days 66+: finish strong, completion-focused
const FINAL: DailyMessage[] = [
  {
    inspiration: 'One day at a time, you\'ve made it here. Now finish strong.',
    tip: 'Open the Progress tab and tap Day 1. Read your note if you wrote one — the difference between that person and who you are right now is the whole story.',
  },
  {
    inspiration: 'The last few days aren\'t a formality — they\'re the proof.',
    tip: 'Write something in today\'s note about how you feel compared to when you started. Don\'t skip this one — it\'s the entry you\'ll read most.',
  },
  {
    inspiration: 'How you finish says everything about who you\'ve become.',
    tip: 'Plan what comes next. The habits you\'ve built are a foundation — deciding intentionally what to carry forward is the final step of this challenge.',
  },
  {
    inspiration: 'Most people quit before the end. You didn\'t. Take a moment with that.',
    tip: 'Share your journey — a photo, a conversation, a post. What you\'ve done is worth acknowledging out loud.',
  },
  {
    inspiration: 'This final stretch is yours. Own every single day of it.',
    tip: 'When you complete the final day, there\'s a completion screen with your full challenge summary. Take a moment with it — you\'ve earned it.',
  },
]

// ── Milestone messages ────────────────────────────────────────────────────────

const MILESTONES: Record<number, DailyMessage> = {
  7: {
    inspiration: 'Seven days straight. That\'s a real streak — celebrate it quietly and keep going.',
    tip: 'Open the Progress tab and tap Day 1. Read your note if you wrote one — seven days is already far enough to see a real shift.',
  },
  14: {
    inspiration: 'Two full weeks in a row. You\'re building something that lasts.',
    tip: 'Check the Progress tab — your 14-day calendar is looking solid. Tap a few early days and read what you wrote. That visual and those words are yours.',
  },
  21: {
    inspiration: 'Twenty-one consecutive days. Research says the habits formed now are the ones that stick.',
    tip: 'You\'ve cycled through every day of the week multiple times now. You know your hard days and your strong ones — use that self-knowledge going forward.',
  },
  30: {
    inspiration: 'A full month of showing up. The person you\'re becoming is already here.',
    tip: 'Revisit your Starting Benchmark in Profile. A month in is exactly when the difference starts becoming visible.',
  },
  50: {
    inspiration: 'Fifty days in a row. You are in rare, rare company.',
    tip: 'Start thinking now about which habits you\'ll carry forward when the challenge ends. Deciding intentionally beats letting it drift.',
  },
}

// ── Selector ─────────────────────────────────────────────────────────────────

/**
 * Returns the message to show today.
 * @param dayNumber  Current challenge day (1-based)
 * @param daysLogged Total days logged (used for milestone detection)
 */
export function getDailyMessage(dayNumber: number, daysLogged: number): DailyMessage {
  if (MILESTONES[daysLogged]) return MILESTONES[daysLogged]

  let pool: DailyMessage[]
  if      (dayNumber <= 7)   pool = EARLY
  else if (dayNumber <= 21)  pool = BUILDING
  else if (dayNumber <= 50)  pool = MID
  else if (dayNumber <= 65)  pool = LATE
  else                       pool = FINAL

  return pool[dayNumber % pool.length]
}
