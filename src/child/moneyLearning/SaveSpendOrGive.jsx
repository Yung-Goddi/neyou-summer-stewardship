import { useState } from 'react'
import { randomScenario } from './moneyData.js'
import { BigCard, bigButtonClass, MascotBubble, BackButton } from '../childUi.jsx'
import { NextProblemButton } from './practiceUi.jsx'

const BUCKETS = [
  { id: 'spend', emoji: '🛍️', label: 'Spend', color: 'bg-neyou-gold text-neyou-brownDark' },
  { id: 'save', emoji: '🐷', label: 'Save', color: 'bg-neyou-teal text-white' },
  { id: 'give', emoji: '💝', label: 'Give', color: 'bg-neyou-pink text-white' },
]

// This is about thinking, not memorizing - every choice gets the same
// warm, explanatory feedback, whether or not it matches the scenario's
// intended answer. There's no "wrong" buzzer here.
export default function SaveSpendOrGive({ onBack }) {
  const [scenario, setScenario] = useState(randomScenario)
  const [picked, setPicked] = useState(null)

  function pick(bucketId) {
    setPicked(bucketId)
  }

  function next() {
    setScenario(randomScenario())
    setPicked(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onBack} />
      <MascotBubble>What would you do?</MascotBubble>

      <BigCard>
        <p className="text-xl font-bold text-neyou-brownDark text-center">{scenario.text}</p>
      </BigCard>

      <div className="grid grid-cols-3 gap-3">
        {BUCKETS.map((bucket) => (
          <button
            key={bucket.id}
            onClick={() => pick(bucket.id)}
            className={`${bigButtonClass} min-h-[88px] flex flex-col items-center gap-1 ${
              picked === bucket.id ? `${bucket.color} ring-4 ring-offset-2 ring-neyou-brownDark` : bucket.color
            }`}
          >
            <span className="text-3xl">{bucket.emoji}</span>
            {bucket.label}
          </button>
        ))}
      </div>

      {picked && (
        <BigCard>
          <p className="text-lg font-bold text-neyou-brownDark text-center">
            {picked === scenario.answer ? "That's what I was thinking too! " : ''}
            {scenario.explanation}
          </p>
        </BigCard>
      )}

      <NextProblemButton onClick={next}>New Scenario</NextProblemButton>
    </div>
  )
}
