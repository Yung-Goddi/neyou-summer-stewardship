// Kid-facing style kit - deliberately brighter and bigger than the parent
// dashboard's dark theme, so it's visually obvious which mode the tablet
// is in. Same tablet-first rules apply: large touch targets, no tiny tap
// zones.

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function BigCard({ title, children }) {
  return (
    <section className="bg-white/90 rounded-3xl p-5 sm:p-6 shadow-lg space-y-3">
      {title && <h2 className="text-xl font-extrabold text-slate-800">{title}</h2>}
      {children}
    </section>
  )
}

export const bigButtonClass =
  'min-h-[72px] rounded-2xl text-xl font-extrabold px-6 py-4 shadow-md active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed'

export const inputClass =
  'w-full min-h-[56px] rounded-2xl border-2 border-slate-200 px-4 py-3 text-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-300'

export function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-base font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export function BackButton({ onClick, children = 'Back' }) {
  return (
    <button
      onClick={onClick}
      className="min-h-[56px] rounded-2xl bg-white/80 text-slate-700 font-bold px-5 py-3 shadow"
    >
      ← {children}
    </button>
  )
}

export function Toast({ message }) {
  if (!message) return null
  return (
    <div
      className={`rounded-2xl p-4 text-lg font-semibold text-center ${
        message.tone === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {message.text}
    </div>
  )
}
