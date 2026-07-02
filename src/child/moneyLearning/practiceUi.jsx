import { formatCents } from '../../engine/index.js'
import { bigButtonClass } from '../childUi.jsx'

// Shared building blocks for the practice modules. Coins/bills are drawn
// with CSS, not real artwork - there's no image asset for them yet (same
// situation as the mascot). Colors/sizes stand in for the visual cues real
// coins and bills give (bigger = higher value, etc.).

const COIN_SIZE = { penny: 56, nickel: 68, dime: 52, quarter: 72 }

export function CoinChip({ coin, onClick, disabled }) {
  const size = COIN_SIZE[coin.id] ?? 60
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 disabled:opacity-40"
      style={{ minWidth: 80 }}
    >
      <span
        className="rounded-full flex items-center justify-center font-extrabold text-slate-800 shadow-md border-2 border-black/10"
        style={{ width: size, height: size, backgroundColor: coin.color, fontSize: size / 3.2 }}
      >
        {coin.value}¢
      </span>
      <span className="text-xs font-bold text-neyou-brown">{coin.name}</span>
    </button>
  )
}

export function BillChip({ bill, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 disabled:opacity-40"
    >
      <span
        className="rounded-lg flex items-center justify-center font-extrabold text-white shadow-md border-2 border-black/10 px-4 py-3"
        style={{ backgroundColor: bill.color, minWidth: 90 }}
      >
        ${bill.value / 100}
      </span>
      <span className="text-xs font-bold text-neyou-brown">{bill.name}</span>
    </button>
  )
}

export function MoneyPile({ pieces }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-2">
      {pieces.map((piece, index) =>
        piece.type === 'coin' ? (
          <CoinChip key={`${piece.id}-${index}`} coin={piece} onClick={undefined} disabled />
        ) : (
          <BillChip key={`${piece.id}-${index}`} bill={piece} onClick={undefined} disabled />
        )
      )}
    </div>
  )
}

export function ChoiceButton({ cents, onClick, selected }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[64px] rounded-2xl text-xl font-extrabold border-2 ${
        selected ? 'bg-neyou-gold border-neyou-gold text-neyou-brownDark' : 'bg-white border-neyou-tan/40 text-neyou-brownDark'
      }`}
    >
      {formatCents(cents)}
    </button>
  )
}

// null = no attempt yet, true = correct, false = incorrect. Feedback is
// always gentle - practice mistakes are expected and unlimited.
export function FeedbackBanner({ result, correctText }) {
  if (result === null || result === undefined) return null
  if (result === true) {
    return <div className="rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-lg text-center p-4">Yes! That's right! 🎉</div>
  }
  return (
    <div className="rounded-2xl bg-amber-100 text-amber-800 font-bold text-lg text-center p-4">
      Not quite - try again! {correctText ? <span className="block text-sm font-semibold mt-1">{correctText}</span> : null}
    </div>
  )
}

export function NextProblemButton({ onClick, children = 'New Problem' }) {
  return (
    <button onClick={onClick} className={`${bigButtonClass} w-full bg-neyou-teal text-white`}>
      {children}
    </button>
  )
}
