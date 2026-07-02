import { useState } from 'react'
import { BigCard, bigButtonClass, MascotBubble, BackButton } from '../childUi.jsx'
import { MODULES, MODULES_BY_ID } from './modules.js'
import MasteryScreen from './MasteryScreen.jsx'

// Self-contained mini-app, mirroring ChildApp.jsx's own view-switcher
// pattern: this owns navigation between its 7 practice modules and the
// Mastery screen, and only calls back out to onHome to leave the section
// entirely. Every module here is free, unlimited practice - nothing in
// this whole section ever touches the ledger except the one place mastery
// is *claimed* (MasteryScreen's "I Think I'm Ready!", which only appends a
// pending approval event - a parent's real-cash check is what actually
// pays a reward, over in the Approvals screen).
export default function MoneyLearningHome({ onHome, ...shared }) {
  const [view, setView] = useState('home')

  if (view === 'mastery') {
    return <MasteryScreen {...shared} onBack={() => setView('home')} onPracticeModule={setView} />
  }

  const activeModule = MODULES_BY_ID[view]
  if (activeModule) {
    const { Component } = activeModule
    return <Component onBack={() => setView('home')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onHome}>Home</BackButton>
      <header className="text-center space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neyou-brownDark">💰 Money Learning</h1>
        <p className="text-neyou-brown text-lg">Practice as much as you want!</p>
      </header>

      <MascotBubble>Pick something to practice. Mistakes are okay - try as many times as you want!</MascotBubble>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map((module) => (
          <button
            key={module.id}
            onClick={() => setView(module.id)}
            className={`${bigButtonClass} bg-white border-2 border-neyou-tan/40 text-neyou-brownDark flex items-center gap-3 text-left justify-start`}
          >
            <span className="text-4xl">{module.emoji}</span>
            <span>
              <span className="block text-lg">{module.title}</span>
              <span className="block text-sm font-semibold text-neyou-brown">{module.description}</span>
            </span>
          </button>
        ))}
      </div>

      <BigCard>
        <button onClick={() => setView('mastery')} className={`${bigButtonClass} w-full bg-neyou-purple text-white flex items-center justify-center gap-2`}>
          <span className="text-3xl">🏅</span> My Mastery Badges
        </button>
        <p className="text-neyou-brown text-sm text-center">
          When you're really good at something, tell Mom or Dad you're ready for a real test!
        </p>
      </BigCard>
    </div>
  )
}
