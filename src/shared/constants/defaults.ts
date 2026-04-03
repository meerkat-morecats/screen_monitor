import type { ReminderSettings, RulesSettings, RuntimeSnapshot } from '../types/reminder'

export const DEFAULT_RULES_SETTINGS: RulesSettings = {
  reminderEnabled: true,
  reminderMode: 'fullscreen',
  popupTheme: 'system',
  intervalMinutes: 30,
  breakMinutes: 5,
  playSoundAfterBreak: true,
}

export const DEFAULT_SETTINGS: ReminderSettings = {
  focusMinutes: 50,
  breakMinutes: 10,
  longBreakMinutes: 20,
  cyclesBeforeLongBreak: 4,
  soundId: 'forest-bell',
  volume: 70,
  overlayMessage: '休息一下，让眼睛和注意力都回到更舒服的状态。',
  allowSkip: false,
  fullscreenOverlay: true,
}

export const DEFAULT_RUNTIME: RuntimeSnapshot = {
  phase: 'focus',
  secondsRemaining: 24 * 60,
  nextBreakAt: '10:30',
  startedAt: '10:06',
}
