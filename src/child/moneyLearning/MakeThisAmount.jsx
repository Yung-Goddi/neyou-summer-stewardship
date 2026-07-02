import { useState } from 'react'
import { formatCents } from '../../engine/index.js'
import { COINS, BILLS, randomMakeAmountTarget } from './moneyData.js'
import { BigCard, bigButtonClass, MascotBubble, BackButton } from '../childUi.jsx'
import { CoinChip, BillChip, FeedbackBanner } from './practiceUi.jsx'

// Tapping a piece in the palette adds it to the tray (unlimited supply of
// each denomination - the point is building an exact amount, not managing
// a limited hand of coins). Tapping a tray piece removes it again.
export default function MakeThisAmount({ onBack }) {
  const [target, setTarget] = useState(randomMakeAmountTarget)
  const [tray, setTray] = useState([])
  const [result, setResult] = useState(null)

  const trayTotal = tray.reduce((sum, piece) => sum + piece.value, 0)

  function addPiece(piece) {
    setTray((prev) => [...prev, piece])
    setResult(null)
  }

  function removePiece(index) {
    setTray((prev) => prev.filter((_, i) => i !== index))
    setResult(null)
  }

  function check() {
    setResult(trayTotal === target)
  }

  function clearTray() {
    setTray([])
    setResult(null)
  }

  function next() {
    setTarget(randomMakeAmountTarget())
    setTray([])
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onBack} />
      <MascotBubble>Can you build exactly {formatCents(target)}?</MascotBubble>

      <BigCard title={`Your Amount: ${formatCents(trayTotal)}`}>
        {tray.length === 0 ? (
          <p className="text-neyou-brown text-center py-4">Tap coins and bills below to add them here.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 py-2">
            {tray.map((piece, index) =>
              piece.type === 'coin' ? (
                <CoinChip key={index} coin={piece} onClick={() => removePiece(index)} />
              ) : (
                <BillChip key={index} bill={piece} onClick={() => removePiece(index)} />
              )
            )}
          </div>
        )}
        {tray.length > 0 && (
          <button onClick={clearTray} className="text-sm text-neyou-brown underline">
            Clear
          </button>
        )}
      </BigCard>

      <BigCard title="Coins">
        <div className="flex flex-wrap justify-center gap-4">
          {COINS.map((coin) => (
            <CoinChip key={coin.id} coin={coin} onClick={() => addPiece(coin)} />
          ))}
        </div>
      </BigCard>

      <BigCard title="Bills">
        <div className="flex flex-wrap justify-center gap-4">
          {BILLS.map((bill) => (
            <BillChip key={bill.id} bill={bill} onClick={() => addPiece(bill)} />
          ))}
        </div>
      </BigCard>

      <button onClick={check} className={`${bigButtonClass} w-full bg-neyou-gold text-neyou-brownDark`}>
        Check My Amount
      </button>

      <FeedbackBanner result={result} correctText={result === false ? `Try adjusting - you need ${formatCents(target)}.` : undefined} />

      <button onClick={next} className={`${bigButtonClass} w-full bg-neyou-teal text-white`}>
        New Amount
      </button>
    </div>
  )
}
