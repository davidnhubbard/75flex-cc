export interface Category {
  id: string
  label: string
  defaultName: string
  defaultDefinition: string
}

export const CATEGORIES: Category[] = [
  { id: 'physical',     label: 'Physical',       defaultName: 'One workout',    defaultDefinition: 'At least 30 minutes of intentional movement' },
  { id: 'nutrition',    label: 'Nutrition',      defaultName: 'Nutrition',      defaultDefinition: 'Follow your plan, no junk food' },
  { id: 'hydration',   label: 'Hydration',      defaultName: 'Water',          defaultDefinition: 'Drink at least 64 oz of water' },
  { id: 'personal_dev', label: 'Personal dev',   defaultName: 'Personal dev',   defaultDefinition: '10 minutes of reading or a podcast' },
  { id: 'photo',        label: 'Progress photo', defaultName: 'Progress photo', defaultDefinition: '' },
  { id: 'sleep',        label: 'Sleep',          defaultName: 'Sleep',          defaultDefinition: 'In bed by 10:30pm' },
  { id: 'mindfulness',  label: 'Mindfulness',    defaultName: 'Mindfulness',    defaultDefinition: '10 minutes of meditation or journaling' },
  { id: 'cold_shower',  label: 'Cold shower',    defaultName: 'Cold shower',    defaultDefinition: 'End shower with 30 seconds cold' },
]
