export interface SoundOption {
  id: string
  name: string
  description: string
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'forest-bell',
    name: 'Forest Bell',
    description: '柔和木质钟声，适合办公场景。',
  },
  {
    id: 'clear-chime',
    name: 'Clear Chime',
    description: '清脆提示音，适合需要明确提醒时使用。',
  },
  {
    id: 'soft-gong',
    name: 'Soft Gong',
    description: '更有仪式感，适合作为休息开始提示。',
  },
]
