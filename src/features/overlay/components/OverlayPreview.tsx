import { DEFAULT_SETTINGS } from '../../../shared/constants/defaults'

export function OverlayPreview() {
  return (
    <article className="panel overlay-preview">
      <div className="panel-header">
        <span className="eyebrow">Overlay</span>
        <h2>全屏遮罩预览</h2>
      </div>
      <div className="overlay-stage">
        <div className="overlay-scrim" />
        <div className="overlay-content">
          <span className="overlay-chip">Break Mode</span>
          <strong>09:59</strong>
          <p>{DEFAULT_SETTINGS.overlayMessage}</p>
        </div>
      </div>
      <p className="panel-note">正式接入 Tauri 后，这一部分将提升为独立全屏窗口，而不是主界面内预览块。</p>
    </article>
  )
}
