export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function formatMinutesLabel(minutes: number): string {
  return `${minutes} 分钟`
}
