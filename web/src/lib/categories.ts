export interface Category {
  id: string
  label: string
  defaultName: string
  defaultDefinition: string
}

export const CATEGORIES: Category[] = [
  { id: 'physical',     label: 'Physical',             defaultName: 'Physical Fitness',     defaultDefinition: 'At least 30 minutes of intentional exercise — a workout, a run, or a class. Not just incidental daily movement.' },
  { id: 'nutrition',    label: 'Nutrition',            defaultName: 'Nutrition',            defaultDefinition: 'Follow your plan, no junk food' },
  { id: 'hydration',    label: 'Hydration',            defaultName: 'Water',                defaultDefinition: 'Drink at least 64 oz of water' },
  { id: 'personal_dev', label: 'Personal Development', defaultName: 'Personal Development', defaultDefinition: '10 minutes of reading or a podcast' },
  { id: 'photo',        label: 'Progress Photo',       defaultName: 'Progress Photo',       defaultDefinition: '' },
  { id: 'sleep',        label: 'Sleep',                defaultName: 'Sleep',                defaultDefinition: 'In bed by 10:30pm' },
  { id: 'mindfulness',  label: 'Mindfulness',          defaultName: 'Mindfulness',          defaultDefinition: '10 minutes of meditation or journaling' },
  { id: 'cold_shower',  label: 'Cold Shower',          defaultName: 'Cold Shower',          defaultDefinition: 'End shower with 30 seconds cold' },
]
