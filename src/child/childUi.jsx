// Kid-facing style kit - deliberately brighter and bigger than the parent
// dashboard's dark theme, so it's visually obvious which mode the tablet
// is in. Same tablet-first rules apply: large touch targets, no tiny tap
// zones.
//
// Colors come from the "neyou" palette in tailwind.config.js, pulled from
// the mascot reference sheet. The actual illustrated character art isn't
// wired in yet - it lives outside this repo (pasted into chat, not saved
// as a file) - so MascotBubble below stands in with an emoji avatar until
// real artwork is dropped into public/mascot/ and swapped in.

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function BigCard({ title, children }) {
  return (
    <section className="bg-white/90 rounded-3xl p-5 sm:p-6 shadow-lg space-y-3">
      {title && <h2 className="text-xl font-extrabold text-neyou-brownDark">{title}</h2>}
      {children}
    </section>
  )
}

export const bigButtonClass =
  'min-h-[72px] rounded-2xl text-xl font-extrabold px-6 py-4 shadow-md active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed'

export const inputClass =
  'w-full min-h-[56px] rounded-2xl border-2 border-neyou-tan/40 px-4 py-3 text-xl text-neyou-brownDark focus:outline-none focus:ring-4 focus:ring-neyou-gold/50'

export function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-base font-semibold text-neyou-brown">{label}</span>
      {children}
    </label>
  )
}

export function BackButton({ onClick, children = 'Back' }) {
  return (
    <button
      onClick={onClick}
      className="min-h-[56px] rounded-2xl bg-white/80 text-neyou-brownDark font-bold px-5 py-3 shadow"
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

// A small stand-in for the illustrated Neyou mascot - a warm emoji avatar
// in a speech-bubble layout. Swap the emoji span for an <img> once the
// character artwork is available as a project asset.
export function MascotBubble({ children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-14 h-14 rounded-full bg-neyou-gold flex items-center justify-center text-3xl shadow">
        👧🏾
      </div>
      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow text-neyou-brownDark font-semibold flex-1">
        {children}
      </div>
    </div>
  )
}

const ENCOURAGEMENTS = [
  'Nice work! 🎉',
  "You're doing great! 🌟",
  'Way to go! 💪',
  "That's awesome! 🙌",
  'So proud of you! 💛',
]

export function randomEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
}

// A friendly progress bar for things like the savings goal - percent is
// clamped so an over-target balance still renders a sane, full bar.
export function ProgressBar({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="w-full h-4 rounded-full bg-neyou-tan/30 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-neyou-gold to-neyou-teal transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
