import { DEFAULT_SETTINGS, DEFAULT_RUNTIME } from '../../../shared/constants/defaults'
import { formatMinutesLabel } from '../../../shared/utils/time'

export function ScheduleCard() {
  return (
    <article className="panel card-accent">
      <div className="panel-header">
        <span className="eyebrow">Schedule</span>
        <h2>提醒节奏</h2>
      </div>
      <div className="metric-grid">
        <div>
          <span>专注时长</span>
          <strong>{formatMinutesLabel(DEFAULT_SETTINGS.focusMinutes)}</strong>
        </div>
        <div>
          <span>短休息</span>
          <strong>{formatMinutesLabel(DEFAULT_SETTINGS.breakMinutes)}</strong>
        </div>
        <div>
          <span>长休息</span>
          <strong>{formatMinutesLabel(DEFAULT_SETTINGS.longBreakMinutes)}</strong>
        </div>
        <div>
          <span>下次提醒</span>
          <strong>{DEFAULT_RUNTIME.nextBreakAt}</strong>
        </div>
      </div>
      <p className="panel-note">
        默认采用 50 / 10 节奏，每 4 个周期进入一次更完整的休息时间。
      </p>
    </article>
  )
}
