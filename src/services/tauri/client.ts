import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { DEFAULT_RULES_SETTINGS } from '../../shared/constants/defaults'
import type { RulesSettings, RuntimeSnapshot } from '../../shared/types/reminder'

const RULES_SETTINGS_STORAGE_KEY = 'screen-monitor.rules-settings'
export const RULES_SETTINGS_UPDATED_EVENT = 'screen-monitor:rules-settings-updated'
export const RUNTIME_SNAPSHOT_UPDATED_EVENT = 'screen-monitor:runtime-snapshot-updated'

export type RuntimeSnapshotListener = (snapshot: RuntimeSnapshot) => void

export interface TauriBridge {
  available: boolean
  currentWindowLabel: string
  getRulesSettings: () => Promise<RulesSettings>
  getRuntimeSnapshot: () => Promise<RuntimeSnapshot>
  listenRuntimeSnapshot: (listener: RuntimeSnapshotListener) => Promise<UnlistenFn>
  saveRulesSettings: (settings: RulesSettings) => Promise<void>
  previewOverlay: () => Promise<void>
  hideOverlay: () => Promise<void>
}

export function createTauriBridge(): TauriBridge {
  const available = '__TAURI_INTERNALS__' in window
  const currentWindowLabel = available ? getCurrentWebviewWindow().label : 'main'

  return {
    available,
    currentWindowLabel,
    async getRulesSettings() {
      if (!available) {
        return readRulesSettingsFromLocalStorage()
      }

      const settings = await invoke<RulesSettings>('get_rules_settings')
      return normalizeRulesSettings(settings)
    },
    async getRuntimeSnapshot() {
      if (!available) {
        return {
          phase: 'focus',
          secondsRemaining: DEFAULT_RULES_SETTINGS.intervalMinutes * 60,
          nextBreakAt: '--:--',
          startedAt: '--:--',
        }
      }

      return invoke<RuntimeSnapshot>('get_runtime_snapshot')
    },
    async listenRuntimeSnapshot(listener) {
      if (!available) {
        return () => {}
      }

      return listen<RuntimeSnapshot>(RUNTIME_SNAPSHOT_UPDATED_EVENT, (event) => {
        listener(event.payload)
      })
    },
    async saveRulesSettings(settings) {
      const normalizedSettings = normalizeRulesSettings(settings)

      if (!available) {
        window.localStorage.setItem(RULES_SETTINGS_STORAGE_KEY, JSON.stringify(normalizedSettings))
        window.dispatchEvent(new CustomEvent<RulesSettings>(RULES_SETTINGS_UPDATED_EVENT, { detail: normalizedSettings }))
        return
      }

      await invoke('save_rules_settings', { settings: normalizedSettings })
      window.dispatchEvent(new CustomEvent<RulesSettings>(RULES_SETTINGS_UPDATED_EVENT, { detail: normalizedSettings }))
    },
    async previewOverlay() {
      if (!available) {
        return
      }

      await invoke('show_overlay')
    },
    async hideOverlay() {
      if (!available) {
        return
      }

      await invoke('hide_overlay')
    },
  }
}

function readRulesSettingsFromLocalStorage(): RulesSettings {
  const savedSettings = window.localStorage.getItem(RULES_SETTINGS_STORAGE_KEY)

  if (!savedSettings) {
    return DEFAULT_RULES_SETTINGS
  }

  try {
    return normalizeRulesSettings(JSON.parse(savedSettings) as Partial<RulesSettings>)
  } catch {
    return DEFAULT_RULES_SETTINGS
  }
}

function normalizeRulesSettings(settings: Partial<RulesSettings>): RulesSettings {
  return {
    reminderEnabled: settings.reminderEnabled ?? DEFAULT_RULES_SETTINGS.reminderEnabled,
    reminderMode: settings.reminderMode ?? DEFAULT_RULES_SETTINGS.reminderMode,
    popupTheme: settings.popupTheme ?? DEFAULT_RULES_SETTINGS.popupTheme,
    intervalMinutes: normalizeMinutes(settings.intervalMinutes, DEFAULT_RULES_SETTINGS.intervalMinutes),
    breakMinutes: normalizeMinutes(settings.breakMinutes, DEFAULT_RULES_SETTINGS.breakMinutes),
    playSoundAfterBreak: settings.playSoundAfterBreak ?? DEFAULT_RULES_SETTINGS.playSoundAfterBreak,
  }
}

function normalizeMinutes(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 1) {
    return fallback
  }

  return Math.round(value)
}
