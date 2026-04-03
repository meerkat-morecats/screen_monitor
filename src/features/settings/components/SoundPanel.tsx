import { SOUND_OPTIONS } from '../../../services/audio/audioCatalog'
import { DEFAULT_SETTINGS } from '../../../shared/constants/defaults'

export function SoundPanel() {
  return (
    <article className="panel">
      <div className="panel-header">
        <span className="eyebrow">Sound</span>
        <h2>提示音配置</h2>
      </div>
      <div className="sound-list">
        {SOUND_OPTIONS.map((sound) => (
          <div
            className={`sound-item ${sound.id === DEFAULT_SETTINGS.soundId ? 'selected' : ''}`}
            key={sound.id}
          >
            <strong>{sound.name}</strong>
            <span>{sound.description}</span>
          </div>
        ))}
      </div>
      <p className="panel-note">音量默认 {DEFAULT_SETTINGS.volume}%，后续会接入试听与本地文件导入。</p>
    </article>
  )
}
