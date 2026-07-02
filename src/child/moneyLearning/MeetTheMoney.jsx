import { useState } from 'react'
import { formatCents } from '../../engine/index.js'
import { COINS, BILLS } from './moneyData.js'
import { BigCard, bigButtonClass, BackButton, MascotBubble } from '../childUi.jsx'
import { CoinChip, BillChip } from './practiceUi.jsx'

const FUN_FACTS = {
  penny: 'Pennies are made mostly of zinc with a thin copper coating.',
  nickel: 'A nickel is worth 5 pennies!',
  dime: 'A dime is the smallest coin, but worth more than a nickel.',
  quarter: 'Four quarters make one whole dollar.',
  one: 'A one-dollar bill has been around since 1862!',
  five: 'Five one-dollar bills equal one five-dollar bill.',
  ten: 'Two five-dollar bills equal one ten-dollar bill.',
  twenty: 'Twenty one-dollar bills equal one twenty-dollar bill.',
}

export default function MeetTheMoney({ onBack }) {
  const [tab, setTab] = useState('coins')
  const [selected, setSelected] = useState(null)
  const items = tab === 'coins' ? COINS : BILLS

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onBack} />
      <MascotBubble>Tap a coin or bill to learn about it!</MascotBubble>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setTab('coins')
            setSelected(null)
          }}
          className={`min-h-[56px] rounded-2xl font-extrabold text-lg ${tab === 'coins' ? 'bg-neyou-gold text-neyou-brownDark' : 'bg-white text-neyou-brown'}`}
        >
          🪙 Coins
        </button>
        <button
          onClick={() => {
            setTab('bills')
            setSelected(null)
          }}
          className={`min-h-[56px] rounded-2xl font-extrabold text-lg ${tab === 'bills' ? 'bg-neyou-teal text-white' : 'bg-white text-neyou-brown'}`}
        >
          💵 Bills
        </button>
      </div>

      <BigCard>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
          {items.map((item) =>
            tab === 'coins' ? (
              <CoinChip key={item.id} coin={item} onClick={() => setSelected(item)} />
            ) : (
              <BillChip key={item.id} bill={item} onClick={() => setSelected(item)} />
            )
          )}
        </div>
      </BigCard>

      {selected && (
        <BigCard title={`${selected.name} — ${formatCents(selected.value)}`}>
          <p className="text-neyou-brown text-lg">Shows {selected.person}.</p>
          <p className="text-neyou-brownDark font-semibold">{FUN_FACTS[selected.id]}</p>
        </BigCard>
      )}

      <button onClick={onBack} className={`${bigButtonClass} w-full bg-white text-neyou-brown border-2 border-neyou-tan/40`}>
        Done Learning
      </button>
    </div>
  )
}
