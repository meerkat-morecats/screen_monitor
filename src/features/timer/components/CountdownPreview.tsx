import { DEFAULT_RUNTIME } from '../../../shared/constants/defaults'
import { formatDuration } from '../../../shared/utils/time'

export function CountdownPreview() {
  return (
    <article className="panel timer-panel">
      <div className="panel-header">
        <span className="eyebrow">Runtime</span>
        <h2>当前状态</h2>
      </div>
      <div className="countdown-value">{formatDuration(DEFAULT_RUNTIME.secondsRemaining)}</div>
      <div className="status-row">
        <span>阶段</span>
        <strong>{DEFAULT_RUNTIME.phase}</strong>
      </div>
      <div className="status-row">
        <span>开始时间</span>
        <strong>{DEFAULT_RUNTIME.startedAt}</strong>
      </div>
    </article>
  )
}
