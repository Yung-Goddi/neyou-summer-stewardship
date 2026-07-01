import { useState } from 'react'
import { verifyPin } from '../engine/index.js'
import { inputClass, buttonClass } from './ui.jsx'

// Gates the whole parent dashboard behind one shared PIN. This is a soft
// deterrent on a shared family tablet, not real security - see pin.js.
export default function PinGate({ pinHash, onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [checking, setChecking] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setChecking(true)
    setError(null)
    const ok = await verifyPin(pin, pinHash)
    setChecking(false)
    if (!ok) {
      setError('Incorrect PIN.')
      setPin('')
      return
    }
    onUnlock()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        <p className="text-slate-400">Enter the parent PIN to continue.</p>
        <input
          className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className={`${buttonClass} w-full`} type="submit" disabled={checking || !pin}>
          {checking ? 'Checking...' : 'Unlock'}
        </button>
      </form>
    </div>
  )
}
