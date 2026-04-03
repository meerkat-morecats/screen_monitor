export type SessionPhase = 'focus' | 'break' | 'paused'
export type ReminderMode = 'fullscreen' | 'mini-popup' | 'notification'
export type PopupTheme = 'system' | 'light' | 'dark'

export interface RulesSettings {
  reminderEnabled: boolean
  reminderMode: ReminderMode
  popupTheme: PopupTheme
  intervalMinutes: number
  breakMinutes: number
  playSoundAfterBreak: boolean
}

export interface ReminderSettings {
  focusMinutes: number
  breakMinutes: number
  longBreakMinutes: number
  cyclesBeforeLongBreak: number
  soundId: string
  volume: number
  overlayMessage: string
  allowSkip: boolean
  fullscreenOverlay: boolean
}

export interface RuntimeSnapshot {
  phase: SessionPhase
  secondsRemaining: number
  nextBreakAt: string
  startedAt: string
}
