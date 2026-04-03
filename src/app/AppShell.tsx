import { useCallback, useEffect, useState } from 'react'
import { SoundPanel } from '../features/settings/components/SoundPanel'
import { OverlayPreview } from '../features/overlay/components/OverlayPreview'
import { CountdownPreview } from '../features/timer/components/CountdownPreview'
import { RulesForm } from '../features/rules/components/RulesForm'
import {
  createTauriBridge,
  RULES_SETTINGS_UPDATED_EVENT,
} from '../services/tauri/client'
import type { RulesSettings, RuntimeSnapshot } from '../shared/types/reminder'
import { DEFAULT_RULES_SETTINGS } from '../shared/constants/defaults'
import { formatDuration } from '../shared/utils/time'

const tauriBridge = createTauriBridge()
const MENU_ITEMS = [
  { key: 'rules', label: '规则', caption: '提醒规则与节奏' },
  { key: 'analysis', label: '分析', caption: '运行状态与洞察' },
  { key: 'settings', label: '设置', caption: '提示音与偏好项' },
] as const

type MenuKey = (typeof MENU_ITEMS)[number]['key']

export function AppShell() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('rules')
  const [workCountdownSeconds, setWorkCountdownSeconds] = useState(DEFAULT_RULES_SETTINGS.intervalMinutes * 60)
  const [bridgeMessage, setBridgeMessage] = useState(
    tauriBridge.available ? '可以直接连接 Tauri runtime。' : '当前仍处于浏览器预览态，桌面能力稍后接入。',
  )

  const resetWorkCountdown = useCallback((intervalMinutes: number) => {
    const nextIntervalSeconds = Math.max(1, Math.round(intervalMinutes)) * 60
    setWorkCountdownSeconds(nextIntervalSeconds)
  }, [])

  useEffect(() => {
    if (tauriBridge.available) {
      let isMounted = true
      let unlistenRuntime: (() => void) | null = null

      void (async () => {
        try {
          const snapshot = await tauriBridge.getRuntimeSnapshot()
          if (isMounted) {
            setWorkCountdownSeconds(normalizeSnapshotSeconds(snapshot))
          }

          unlistenRuntime = await tauriBridge.listenRuntimeSnapshot((nextSnapshot) => {
            setWorkCountdownSeconds(normalizeSnapshotSeconds(nextSnapshot))
          })
        } catch {
          // Keep existing fallback countdown when runtime subscription fails.
        }
      })()

      return () => {
        isMounted = false
        if (unlistenRuntime) {
          unlistenRuntime()
        }
      }
    }

    let isMounted = true

    void (async () => {
      try {
        const savedRules = await tauriBridge.getRulesSettings()
        if (!isMounted) {
          return
        }

        resetWorkCountdown(savedRules.intervalMinutes)
      } catch {
        // Keep default interval when settings cannot be loaded.
      }
    })()

    const handleRulesSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<RulesSettings>
      resetWorkCountdown(customEvent.detail.intervalMinutes)
    }

    const timer = window.setInterval(() => {
      setWorkCountdownSeconds((previous) => (previous <= 1 ? 0 : previous - 1))
    }, 1000)

    window.addEventListener(RULES_SETTINGS_UPDATED_EVENT, handleRulesSettingsUpdated)

    return () => {
      isMounted = false
      window.removeEventListener(RULES_SETTINGS_UPDATED_EVENT, handleRulesSettingsUpdated)
      window.clearInterval(timer)
    }
  }, [resetWorkCountdown])

  async function handlePreviewOverlay() {
    try {
      await tauriBridge.previewOverlay()
      setBridgeMessage(
        tauriBridge.available
          ? '已请求 Tauri 打开休息遮罩窗口。'
          : '浏览器模式下只展示页面内预览，真实遮罩需通过 pnpm tauri dev 查看。',
      )
    } catch (error) {
      setBridgeMessage(`遮罩预览调用失败：${String(error)}`)
    }
  }

  function renderContent() {
    if (activeMenu === 'rules') {
      return (
        <section className="content-stack">
          <header className="content-header panel">
            <div>
              <span className="eyebrow">Rules</span>
              <h2>提醒规则</h2>
            </div>
            <p className="panel-note">
              这里是一组可编辑的规则表单，你可以直接配置提醒方式、间隔时间和休息时长。
            </p>
          </header>
          <RulesForm />
        </section>
      )
    }

    if (activeMenu === 'analysis') {
      return (
        <section className="content-stack">
          <header className="content-header panel">
            <div>
              <span className="eyebrow">Analysis</span>
              <h2>运行分析</h2>
            </div>
            <p className="panel-note">
              这里会承接后续的提醒命中率、跳过次数、平均专注时长和休息执行情况。
            </p>
          </header>
          <div className="content-grid two-columns">
            <CountdownPreview />
            <OverlayPreview />
          </div>
          <article className="panel">
            <div className="panel-header">
              <span className="eyebrow">Live</span>
              <h2>当前状态摘要</h2>
            </div>
            <div className="info-list compact">
              <div>
                <strong>Runtime</strong>
                <span>{bridgeMessage}</span>
              </div>
              <div>
                <strong>遮罩调试</strong>
                <span>你可以通过下面的按钮手动触发遮罩窗口，验证多窗口流程是否正常。</span>
              </div>
            </div>
            <div className="hero-actions top-gap">
              <button type="button" onClick={handlePreviewOverlay}>预览休息遮罩</button>
            </div>
          </article>
        </section>
      )
    }

    return (
      <section className="content-stack">
        <header className="content-header panel">
          <div>
            <span className="eyebrow">Settings</span>
            <h2>应用设置</h2>
          </div>
          <p className="panel-note">
            这里会逐步扩展到声音、遮罩风格、是否允许跳过、托盘行为和开机启动等选项。
          </p>
        </header>
        <div className="content-grid two-columns">
          <SoundPanel />
          <article className="panel">
            <div className="panel-header">
              <span className="eyebrow">System</span>
              <h2>桌面集成</h2>
            </div>
            <div className="info-list">
              <div>
                <strong>Tauri Runtime</strong>
                <span>{tauriBridge.available ? '已连接，可调用原生窗口能力。' : '当前是浏览器预览态。'}</span>
              </div>
              <div>
                <strong>遮罩窗口</strong>
                <span>启动时不会预创建，只有在提醒触发时才会新建全屏窗口。</span>
              </div>
              <div>
                <strong>当前目标</strong>
                <span>下一步适合接入本地配置存储，把这几个设置真正保存下来。</span>
              </div>
            </div>
            <div className="hero-actions top-gap">
              <button type="button" onClick={handlePreviewOverlay}>测试遮罩窗口</button>
              <button type="button" className="ghost">试听提示音</button>
            </div>
          </article>
        </div>
      </section>
    )
  }

  return (
    <main className="monitor-layout">
      <aside className="sidebar panel">
        <div className="sidebar-work-countdown" aria-label="工作时间倒计时">
          {formatDuration(workCountdownSeconds)}
        </div>

        <div className="sidebar-brand">
          <h2>Screen Monitor</h2>
        </div>

        <nav className="sidebar-menu" aria-label="主菜单">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`menu-item ${activeMenu === item.key ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.key)}
            >
              <strong>{item.label}</strong>
              <span>{item.caption}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="availability-badge">
            <span className={`dot ${tauriBridge.available ? 'online' : 'offline'}`} />
            {tauriBridge.available ? 'Tauri runtime connected' : 'Tauri runtime pending'}
          </div>
          <p className="bridge-message">{bridgeMessage}</p>
        </div>
      </aside>

      <section className="monitor-content">
        {renderContent()}
      </section>
    </main>
  )
}

function normalizeSnapshotSeconds(snapshot: RuntimeSnapshot): number {
  if (snapshot.secondsRemaining <= 0) {
    return 0
  }

  return Math.round(snapshot.secondsRemaining)
}
