import { useState } from 'react'
import { formatCents } from '../../engine/index.js'
import { generateChangeScenario } from './moneyData.js'
import { BigCard, MascotBubble, BackButton } from '../childUi.jsx'
import { ChoiceButton, FeedbackBanner, NextProblemButton } from './practiceUi.jsx'

export default function MakingChange({ onBack }) {
  const [scenario, setScenario] = useState(generateChangeScenario)
  const [result, setResult] = useState(null)

  function answer(cents) {
    setResult(cents === scenario.changeCents)
  }

  function next() {
    setScenario(generateChangeScenario())
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onBack} />
      <MascotBubble>How much change should you get back?</MascotBubble>

      <BigCard>
        <div className="text-center space-y-2">
          <div className="text-xl font-bold text-neyou-brown">Item costs</div>
          <div className="text-3xl font-extrabold text-neyou-brownDark">{formatCents(scenario.priceCents)}</div>
          <div className="text-xl font-bold text-neyou-brown pt-2">You pay with</div>
          <div className="text-3xl font-extrabold text-neyou-teal">{formatCents(scenario.paidCents)}</div>
        </div>
      </BigCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenario.choices.map((cents) => (
          <ChoiceButton key={cents} cents={cents} onClick={() => answer(cents)} />
        ))}
      </div>

      <FeedbackBanner
        result={result}
        correctText={result === false ? `Your change is ${formatCents(scenario.changeCents)}.` : undefined}
      />

      <NextProblemButton onClick={next}>New Problem</NextProblemButton>
    </div>
  )
}
