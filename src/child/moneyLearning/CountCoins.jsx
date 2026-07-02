import { useState } from 'react'
import { formatCents } from '../../engine/index.js'
import { generateCoinPile, generateAmountChoices } from './moneyData.js'
import { BigCard, MascotBubble, BackButton } from '../childUi.jsx'
import { MoneyPile, ChoiceButton, FeedbackBanner, NextProblemButton } from './practiceUi.jsx'

function newProblem() {
  const { pieces, total } = generateCoinPile()
  return { pieces, total, choices: generateAmountChoices(total) }
}

export default function CountCoins({ onBack }) {
  const [problem, setProblem] = useState(newProblem)
  const [result, setResult] = useState(null)

  function answer(cents) {
    setResult(cents === problem.total)
  }

  function next() {
    setProblem(newProblem())
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onBack} />
      <MascotBubble>How much money is this altogether?</MascotBubble>

      <BigCard>
        <MoneyPile pieces={problem.pieces} />
      </BigCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {problem.choices.map((cents) => (
          <ChoiceButton key={cents} cents={cents} onClick={() => answer(cents)} />
        ))}
      </div>

      <FeedbackBanner result={result} correctText={result === false ? `The total is ${formatCents(problem.total)}.` : undefined} />

      <NextProblemButton onClick={next}>New Coins</NextProblemButton>
    </div>
  )
}
