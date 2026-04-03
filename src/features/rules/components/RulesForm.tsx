import { useEffect, useState } from 'react'
import { DEFAULT_RULES_SETTINGS } from '../../../shared/constants/defaults'
import type { ReminderMode, RulesSettings } from '../../../shared/types/reminder'
import { createTauriBridge } from '../../../services/tauri/client'

const tauriBridge = createTauriBridge()

export function RulesForm() {
  const [rules, setRules] = useState<RulesSettings>(DEFAULT_RULES_SETTINGS)
  const [isHydrated, setIsHydrated] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    void (async () => {
      try {
        const savedRules = await tauriBridge.getRulesSettings()
        if (isMounted) {
          setRules(savedRules)
        }
      } catch (error) {
        if (isMounted) {
          setSaveMessage(`读取配置失败：${String(error)}`)
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    let isMounted = true

    void (async () => {
      try {
        await tauriBridge.saveRulesSettings(rules)
        if (isMounted) {
          setSaveMessage('规则已自动保存到本地。')
        }
      } catch (error) {
        if (isMounted) {
          setSaveMessage(`保存失败：${String(error)}`)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [isHydrated, rules])

  function updateField<Key extends keyof RulesSettings>(key: Key, value: RulesSettings[Key]) {
    setRules((prev) => ({ ...prev, [key]: value }))
  }

  function updateMinutesField(key: 'intervalMinutes' | 'breakMinutes', rawValue: string) {
    const numericValue = Number(rawValue)
    const nextValue = Number.isNaN(numericValue) ? 1 : Math.max(1, Math.round(numericValue))
    updateField(key, nextValue)
  }

  async function handleTestPopup() {
    if (!tauriBridge.available) {
      setTestMessage('当前是浏览器预览环境，请使用 pnpm tauri dev 查看真实遮罩窗口。')
      return
    }

    try {
      await tauriBridge.saveRulesSettings(rules)
      await tauriBridge.previewOverlay()
      setTestMessage('已触发测试：遮罩层窗口会按当前规则展示。')
    } catch (error) {
      setTestMessage(`测试失败：${String(error)}`)
    }
  }

  const shouldShowPopupStyle = rules.reminderMode !== 'notification'

  return (
    <form className="panel rules-form" aria-label="规则配置表单" onSubmit={(event) => event.preventDefault()}>
      <fieldset className="rules-group">
        <legend>提醒</legend>

        <label className="rules-row switch-row" htmlFor="reminder-enabled">
          <div>
            <strong>开启提醒</strong>
            <p className="panel-note">关闭后将暂停所有自动提醒。</p>
          </div>
          <input
            id="reminder-enabled"
            type="checkbox"
            className="switch-input"
            checked={rules.reminderEnabled}
            onChange={(event) => updateField('reminderEnabled', event.target.checked)}
          />
        </label>

        <label className="rules-row" htmlFor="reminder-mode">
          <div>
            <strong>提醒方式</strong>
            <p className="panel-note">可选择全屏提醒、迷你弹窗或通知。</p>
          </div>
          <select
            id="reminder-mode"
            className="rules-select"
            value={rules.reminderMode}
            onChange={(event) => updateField('reminderMode', event.target.value as ReminderMode)}
          >
            <option value="fullscreen">全屏提醒</option>
            <option value="mini-popup">迷你弹窗</option>
            <option value="notification">通知</option>
          </select>
        </label>

        {shouldShowPopupStyle ? (
          <section className="popup-style-box" aria-label="弹窗样式">
            <header className="popup-style-header">
              <strong>弹窗样式</strong>
              <button type="button" className="rules-test-button" onClick={handleTestPopup}>
                测试
              </button>
            </header>
            {testMessage ? <p className="panel-note">{testMessage}</p> : null}
            <div className="radio-group" role="radiogroup" aria-label="弹窗样式选择">
              <label className="radio-item" htmlFor="popup-theme-system">
                <input
                  id="popup-theme-system"
                  name="popup-theme"
                  type="radio"
                  value="system"
                  checked={rules.popupTheme === 'system'}
                  onChange={() => updateField('popupTheme', 'system')}
                />
                <span>跟随系统</span>
              </label>
              <label className="radio-item" htmlFor="popup-theme-light">
                <input
                  id="popup-theme-light"
                  name="popup-theme"
                  type="radio"
                  value="light"
                  checked={rules.popupTheme === 'light'}
                  onChange={() => updateField('popupTheme', 'light')}
                />
                <span>浅色</span>
              </label>
              <label className="radio-item" htmlFor="popup-theme-dark">
                <input
                  id="popup-theme-dark"
                  name="popup-theme"
                  type="radio"
                  value="dark"
                  checked={rules.popupTheme === 'dark'}
                  onChange={() => updateField('popupTheme', 'dark')}
                />
                <span>深色</span>
              </label>
            </div>
          </section>
        ) : null}
      </fieldset>

      <fieldset className="rules-group">
        <legend>规则</legend>

        <label className="rules-row" htmlFor="interval-minutes">
          <div>
            <strong>间隔时间</strong>
            <p className="panel-note">输入数字，单位为分钟。</p>
          </div>
          <div className="number-field">
            <input
              id="interval-minutes"
              type="number"
              min={1}
              value={rules.intervalMinutes}
              onChange={(event) => updateMinutesField('intervalMinutes', event.target.value)}
            />
            <span>分钟</span>
          </div>
        </label>

        <label className="rules-row" htmlFor="break-minutes">
          <div>
            <strong>休息时间</strong>
            <p className="panel-note">输入数字，单位为分钟。</p>
          </div>
          <div className="number-field">
            <input
              id="break-minutes"
              type="number"
              min={1}
              value={rules.breakMinutes}
              onChange={(event) => updateMinutesField('breakMinutes', event.target.value)}
            />
            <span>分钟</span>
          </div>
        </label>

        <label className="rules-row switch-row" htmlFor="play-sound-after-break">
          <div>
            <strong>休息结束播放声音</strong>
            <p className="panel-note">开启后会在休息倒计时结束时播放提示音。</p>
          </div>
          <input
            id="play-sound-after-break"
            type="checkbox"
            className="switch-input"
            checked={rules.playSoundAfterBreak}
            onChange={(event) => updateField('playSoundAfterBreak', event.target.checked)}
          />
        </label>
      </fieldset>

      {saveMessage ? <p className="panel-note">{saveMessage}</p> : null}
    </form>
  )
}
