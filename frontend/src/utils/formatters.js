export const formatPercent = (value) => `${Math.round(value)}%`
export const formatDate = (value) => new Date(value).toLocaleDateString()
export const formatDuration = (seconds) => `${Math.round(seconds / 60)} min`
