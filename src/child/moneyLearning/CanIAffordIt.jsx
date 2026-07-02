import { useState } from 'react'
import { formatCents } from '../../engine/index.js'
import { generateAffordScenario } from './moneyData.js'
import { BigCard, bigButtonClass, MascotBubble, BackButton } from '../childUi.jsx'
import { FeedbackBanner, NextProblemButton } from './practiceUi.jsx'

export default function CanIAffordIt({ onBack }) {
  const [scenario, setScenario] = useState(generateAffordScenario)
  const [result, setResult] = useState(null)

  function answer(saysYes) {
    setResult(saysYes === scenario.canAfford)
  }

  function next() {
    setScenario(generateAffordScenario())
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onBack} />
      <MascotBubble>Can you afford it?</MascotBubble>

      <BigCard>
        <div className="text-center space-y-2">
          <div className="text-6xl">{scenario.item.emoji}</div>
          <div className="text-2xl font-extrabold text-neyou-brownDark">{scenario.item.name}</div>
          <div className="text-xl font-bold text-neyou-brown">Costs {formatCents(scenario.item.priceCents)}</div>
          <div className="text-xl font-bold text-neyou-teal">You have {formatCents(scenario.haveCents)}</div>
        </div>
      </BigCard>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => answer(true)} className={`${bigButtonClass} bg-emerald-300 text-emerald-950`}>
          Yes, I can!
        </button>
        <button onClick={() => answer(false)} className={`${bigButtonClass} bg-rose-300 text-rose-950`}>
          No, not enough
        </button>
      </div>

      <FeedbackBanner
        result={result}
        correctText={
          result === false
            ? scenario.canAfford
              ? `You had enough - ${formatCents(scenario.haveCents)} covers ${formatCents(scenario.item.priceCents)}.`
              : `Not quite enough - ${formatCents(scenario.haveCents)} is less than ${formatCents(scenario.item.priceCents)}.`
            : undefined
        }
      />

      <NextProblemButton onClick={next}>New Item</NextProblemButton>
    </div>
  )
}
