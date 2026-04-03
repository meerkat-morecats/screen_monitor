import { useEffect, useState } from 'react'
import { DEFAULT_RULES_SETTINGS } from '../../../shared/constants/defaults'
import { formatDuration } from '../../../shared/utils/time'
import type { RulesSettings } from '../../../shared/types/reminder'
import { createTauriBridge } from '../../../services/tauri/client'

const tauriBridge = createTauriBridge()

export function BreakOverlayWindow() {
  const [rules, setRules] = useState<RulesSettings>(DEFAULT_RULES_SETTINGS)
  const [secondsRemaining, setSecondsRemaining] = useState(DEFAULT_RULES_SETTINGS.breakMinutes * 60)
  const [isReady, setIsReady] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    let isMounted = true

    void (async () => {
      try {
        const savedRules = await tauriBridge.getRulesSettings()
        if (isMounted) {
          setRules(savedRules)
          setSecondsRemaining(savedRules.breakMinutes * 60)
        }
      } finally {
        if (isMounted) {
          setIsReady(true)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isReady || isClosing) {
      return
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(timerId)
          return 0
        }

        return currentValue - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [isClosing, isReady])

  useEffect(() => {
    if (!isReady || isClosing || secondsRemaining > 0) {
      return
    }

    void handleClose()
  }, [isClosing, isReady, secondsRemaining])

  async function handleClose() {
    if (isClosing) {
      return
    }

    setIsClosing(true)
    await tauriBridge.hideOverlay()
  }

  const resolvedTheme =
    rules.popupTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : rules.popupTheme

  const overlayThemeClass =
    resolvedTheme === 'dark'
      ? 'break-overlay-card break-overlay-card-dark'
      : 'break-overlay-card break-overlay-card-light'
  const isMiniPopup = rules.reminderMode === 'mini-popup'
  const overlayCardClass = isMiniPopup ? `${overlayThemeClass} break-overlay-card-mini` : overlayThemeClass
  const overlayWindowThemeClass =
    resolvedTheme === 'dark'
      ? 'break-overlay-window break-overlay-window-dark'
      : 'break-overlay-window break-overlay-window-light'
  const overlayWindowClass = isMiniPopup
    ? `${overlayWindowThemeClass} break-overlay-window-mini`
    : `${overlayWindowThemeClass} break-overlay-window-fullscreen`

  useEffect(() => {
    const themeClass = resolvedTheme === 'dark' ? 'break-overlay-theme-dark' : 'break-overlay-theme-light'

    document.documentElement.classList.remove('break-overlay-theme-dark', 'break-overlay-theme-light')
    document.body.classList.remove('break-overlay-theme-dark', 'break-overlay-theme-light')
    document.documentElement.classList.add(themeClass)
    document.body.classList.add(themeClass)

    return () => {
      document.documentElement.classList.remove(themeClass)
      document.body.classList.remove(themeClass)
    }
  }, [resolvedTheme])

  return (
    <main className={overlayWindowClass}>
      <div className="break-overlay-backdrop" />
      <section className={overlayCardClass}>
        <strong>{formatDuration(secondsRemaining)}</strong>
        <button type="button" className="break-overlay-text-button" onClick={() => void handleClose()}>
          结束
        </button>
      </section>
    </main>
  )
}
