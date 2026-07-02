import { useState } from 'react'
import ChildHome from './ChildHome.jsx'
import MoneyRequestScreen from './MoneyRequestScreen.jsx'
import TasksScreen from './TasksScreen.jsx'
import BadgesScreen from './BadgesScreen.jsx'
import MoneyLearningHome from './moneyLearning/MoneyLearningHome.jsx'

// Only one child operator exists in the seed data today, so there's no
// picker here the way the parent side has Dad/Mom - the app just finds
// "the" child and goes straight to their home screen. No PIN either:
// Phase 0's "no authentication" mission applies to this side of the app,
// the parent side is the one gated (see ParentApp.jsx).
export default function ChildApp({ state, onSwitchToParent, ...shared }) {
  const [view, setView] = useState({ name: 'home' })
  const childOperator = state.operators.find((op) => op.role === 'child')

  const screenProps = {
    state,
    childOperator,
    onHome: () => setView({ name: 'home' }),
    ...shared,
  }

  if (view.name === 'request') {
    return <MoneyRequestScreen {...screenProps} requestType={view.requestType} />
  }
  if (view.name === 'tasks') {
    return <TasksScreen {...screenProps} />
  }
  if (view.name === 'badges') {
    return <BadgesScreen {...screenProps} />
  }
  if (view.name === 'money-learning') {
    return <MoneyLearningHome {...screenProps} />
  }

  return (
    <ChildHome
      {...screenProps}
      onRequestMoney={(requestType) => setView({ name: 'request', requestType })}
      onOpenTasks={() => setView({ name: 'tasks' })}
      onOpenBadges={() => setView({ name: 'badges' })}
      onOpenMoneyLearning={() => setView({ name: 'money-learning' })}
      onSwitchToParent={onSwitchToParent}
    />
  )
}
