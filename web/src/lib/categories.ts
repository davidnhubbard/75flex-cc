export interface Category {
  id: string
  label: string
  defaultName: string
  defaultDefinition: string
}

export const CATEGORIES: Category[] = [
  { id: 'physical', label: 'Physical Activity', defaultName: 'Physical Activity', defaultDefinition: 'At least 30 minutes of intentional exercise - a workout, a run, or a class. Not just incidental daily movement.' },
  { id: 'nutrition', label: 'Nutrition', defaultName: 'Nutrition', defaultDefinition: 'Follow your plan, no junk food' },
  { id: 'hydration', label: 'Water Intake', defaultName: 'Water Intake', defaultDefinition: 'Drink at least 64 oz of water' },
  { id: 'personal_dev', label: 'Personal Development', defaultName: 'Personal Development', defaultDefinition: '10 minutes of reading or a podcast' },
  { id: 'photo', label: 'Progress Photo', defaultName: 'Progress Photo', defaultDefinition: '' },
  { id: 'sleep', label: 'Sleep', defaultName: 'Sleep', defaultDefinition: 'In bed by 10:30pm' },
  { id: 'mindfulness', label: 'Meditation', defaultName: 'Meditation', defaultDefinition: '10 minutes of meditation or breathwork' },
  { id: 'cold_shower', label: 'Cold Exposure', defaultName: 'Cold Exposure', defaultDefinition: 'Intentional cold exposure (shower, plunge, or natural water) for your target duration' },
]

const CATEGORY_BY_ID = new Map(CATEGORIES.map(c => [c.id, c] as const))

export function getCanonicalCommitmentName(categoryId: string): string | null {
  return CATEGORY_BY_ID.get(categoryId)?.defaultName ?? null
}

export function normalizeCommitmentName(categoryId: string, currentName: string | null | undefined): string {
  const canonical = getCanonicalCommitmentName(categoryId)
  if (canonical) return canonical
  const fallback = (currentName ?? '').trim()
  return fallback || categoryId
}
