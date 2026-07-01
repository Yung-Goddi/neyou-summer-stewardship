// Small shared style/layout building blocks for the parent-facing screens.
// Tablet-first: large touch targets, high-contrast dark theme, no tiny tap
// zones.

export function labelize(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function Card({ title, action, children }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-slate-400">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full min-h-[44px] rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400'

export const buttonClass =
  'min-h-[48px] rounded-lg bg-amber-400 text-slate-950 font-semibold text-base px-4 py-2 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed'

export const secondaryButtonClass =
  'min-h-[48px] rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-base px-4 py-2 hover:bg-slate-700'

export const dangerButtonClass =
  'min-h-[48px] rounded-lg bg-red-600 text-white font-semibold text-base px-4 py-2 hover:bg-red-500'

export function Toast({ message }) {
  if (!message) return null
  return (
    <div
      className={`rounded-xl p-4 text-base ${
        message.tone === 'error'
          ? 'bg-red-950 text-red-200 border border-red-800'
          : 'bg-emerald-950 text-emerald-200 border border-emerald-800'
      }`}
    >
      {message.text}
    </div>
  )
}

// Warnings (Parent Withdrawal / Correction admin overrides) are
// non-blocking - the human still has to say "yes, do it anyway."
export function confirmWarnings(warnings) {
  if (!warnings || warnings.length === 0) return true
  return window.confirm(`${warnings.join('\n')}\n\nContinue?`)
}
