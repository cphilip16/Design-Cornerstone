import { useEffect, useMemo, useState } from 'react'

type Mode = 'focus' | 'break'
type Session = { id: string; duration: number; completedAt: string }

const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60
const STORAGE_KEY = 'focus-study-sessions'

const readSessions = (): Session[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Session[]
  } catch {
    return []
  }
}

function App() {
  const [mode, setMode] = useState<Mode>('focus')
  const [remaining, setRemaining] = useState(FOCUS_SECONDS)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(readSessions)

  const totalSeconds = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
  const seconds = String(remaining % 60).padStart(2, '0')
  const studiedMinutes = useMemo(
    () => Math.round(sessions.reduce((total, session) => total + session.duration, 0) / 60),
    [sessions],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current > 1) return current - 1
        if (mode === 'focus') {
          setSessions((currentSessions) => [
            { id: crypto.randomUUID(), duration: FOCUS_SECONDS, completedAt: new Date().toISOString() },
            ...currentSessions,
          ])
        }
        setRunning(false)
        return 0
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, mode])

  function changeMode(nextMode: Mode) {
    setRunning(false)
    setMode(nextMode)
    setRemaining(nextMode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS)
  }

  function resetTimer() {
    setRunning(false)
    setRemaining(totalSeconds)
  }

  function startOrPause() {
    if (remaining === 0) {
      setRemaining(totalSeconds)
      setRunning(true)
      return
    }
    setRunning((current) => !current)
  }

  function skipTimer() {
    if (mode === 'focus' && remaining < FOCUS_SECONDS) {
      setSessions((currentSessions) => [
        { id: crypto.randomUUID(), duration: FOCUS_SECONDS - remaining, completedAt: new Date().toISOString() },
        ...currentSessions,
      ])
    }
    changeMode(mode === 'focus' ? 'break' : 'focus')
  }

  return (
    <main className="app-shell">
      <header>
        <a className="brand" href="#top" aria-label="Focus home"><span>✦</span> focus</a>
        <p className="header-note">Make room for what matters.</p>
      </header>

      <section className="hero" id="top">
        <div className="mode-switch" role="tablist" aria-label="Timer mode">
          <button className={mode === 'focus' ? 'active' : ''} onClick={() => changeMode('focus')} role="tab" aria-selected={mode === 'focus'}>Focus</button>
          <button className={mode === 'break' ? 'active' : ''} onClick={() => changeMode('break')} role="tab" aria-selected={mode === 'break'}>Break</button>
        </div>

        <div className="timer-wrap" aria-live="polite">
          <svg className="timer-ring" viewBox="0 0 260 260" aria-hidden="true">
            <circle className="track" cx="130" cy="130" r="112" />
            <circle className="progress" cx="130" cy="130" r="112" pathLength="100" style={{ strokeDasharray: '100', strokeDashoffset: `${100 - progress}` }} />
          </svg>
          <div className="timer-copy">
            <p>{mode === 'focus' ? 'FOCUS SESSION' : 'TAKE A BREATH'}</p>
            <time>{minutes}:{seconds}</time>
          </div>
        </div>

        <button className="primary" onClick={startOrPause}>{running ? 'Pause' : remaining === 0 ? 'Start again' : mode === 'focus' ? 'Start focus' : 'Start break'}</button>
        <div className="timer-actions">
          <button onClick={resetTimer}>↺ Reset</button>
          <button onClick={skipTimer}>Skip <span>→</span></button>
        </div>
      </section>

      <section className="summary" aria-label="Study summary">
        <article><span className="stat-number">{studiedMinutes}</span><span className="stat-label">minutes studied</span></article>
        <article><span className="stat-number">{sessions.length}</span><span className="stat-label">sessions completed</span></article>
        <article><span className="stat-number">25</span><span className="stat-label">minute focus blocks</span></article>
      </section>

      <section className="recent">
        <div className="section-title"><h1>Your study log</h1><p>Completed focus time is saved on this device.</p></div>
        {sessions.length === 0 ? (
          <div className="empty-state"><span>◌</span><p>Your completed sessions will appear here.</p></div>
        ) : (
          <ul>
            {sessions.slice(0, 5).map((session) => <li key={session.id}><span>{Math.max(1, Math.round(session.duration / 60))} minute focus session</span><time>{new Date(session.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></li>)}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
