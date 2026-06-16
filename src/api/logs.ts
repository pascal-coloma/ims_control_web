import type { LogEntry } from '../types/api'

/**
 * Consumes the NDJSON-streamed audit log feed, calling `onEntry` for each
 * complete JSON line as it arrives. Resolves once the stream ends, or
 * rejects if `signal` aborts it first.
 */
export async function streamLogs(onEntry: (entry: LogEntry) => void, signal?: AbortSignal): Promise<void> {
  const response = await fetch('/ims/api/logs/', { credentials: 'include', signal })
  if (!response.ok || !response.body) {
    throw new Error(`Failed to open audit log stream (${response.status})`)
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value

    let newlineIndex = buffer.indexOf('\n')
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim()
      buffer = buffer.slice(newlineIndex + 1)
      if (line) onEntry(JSON.parse(line) as LogEntry)
      newlineIndex = buffer.indexOf('\n')
    }
  }

  const trailing = buffer.trim()
  if (trailing) onEntry(JSON.parse(trailing) as LogEntry)
}
