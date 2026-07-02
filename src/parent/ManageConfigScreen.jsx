import { useState } from 'react'
import { dollarsToCents, centsToDollars, verifyPin, hashPin } from '../engine/index.js'
import { Card, Field, inputClass, buttonClass, secondaryButtonClass, dangerButtonClass } from './ui.jsx'

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

// inputClass bakes in `w-full`, which is exactly what you want for a
// standalone field but fights `flex-1`/`w-20` when several inputs need to
// share one row - Tailwind resolves conflicting width utilities by their
// order in the generated stylesheet, not by className string order, so
// `w-full` can silently win even when it's written first. Stripping it
// here lets the row-specific width class actually take effect.
const rowInputClass = inputClass.replace('w-full', 'min-w-0')

export default function ManageConfigScreen({
  state,
  updateSettings,
  updateOperators,
  updateResponsibilities,
  updateAchievements,
  updateBadges,
  updateGivingCategories,
  updateSavingsGoal,
  onError,
  onExport,
  onImportClick,
  onReset,
  fileInputRef,
  onImportFile,
}) {
  return (
    <div className="space-y-6">
      <SettingsCard settings={state.settings} updateSettings={updateSettings} onError={onError} />

      <ListEditorCard
        title="Operators"
        idPrefix="op"
        items={state.operators}
        columns={[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'role', label: 'Role', type: 'select', options: ['parent', 'child'] },
        ]}
        defaults={{ name: '', role: 'parent' }}
        onSave={(items) => updateOperators(items, 'Operators updated.')}
      />

      <ListEditorCard
        title="Responsibilities"
        idPrefix="resp"
        items={state.responsibilities}
        columns={[
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'frequency', label: 'Frequency', type: 'select', options: ['daily', 'weekly', 'custom'] },
          { key: 'customFrequencyLabel', label: 'Custom schedule (if Custom)', type: 'text' },
        ]}
        defaults={{ title: '', frequency: 'daily', customFrequencyLabel: '' }}
        onSave={(items) => updateResponsibilities(items, 'Responsibilities updated.')}
      />

      <ListEditorCard
        title="Achievements"
        idPrefix="ach"
        items={state.achievements}
        columns={[
          { key: 'icon', label: 'Icon (emoji)', type: 'text', narrow: true },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'text' },
          { key: 'rewardCents', label: 'Reward ($)', type: 'money' },
          { key: 'assessmentInstructions', label: 'How to test it in real life', type: 'text' },
        ]}
        defaults={{ icon: '🏅', title: '', description: '', rewardCents: '0.00', assessmentInstructions: '' }}
        onSave={(items) => updateAchievements(items, 'Achievements updated.')}
      />

      <ListEditorCard
        title="Badges"
        idPrefix="badge"
        items={state.badges}
        columns={[
          { key: 'icon', label: 'Icon (emoji)', type: 'text', narrow: true },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'text' },
          {
            key: 'categoryId',
            label: 'Category',
            type: 'select',
            options: state.badgeCategories.map((c) => ({ value: c.id, label: c.label })),
          },
        ]}
        defaults={{ icon: '🏅', title: '', description: '', categoryId: state.badgeCategories[0]?.id ?? '' }}
        onSave={(items) => updateBadges(items, 'Badges updated.')}
      />

      <ListEditorCard
        title="Giving Categories"
        idPrefix="give"
        items={state.givingCategories}
        columns={[{ key: 'label', label: 'Name', type: 'text' }]}
        defaults={{ label: '' }}
        onSave={(items) => updateGivingCategories(items, 'Giving categories updated.')}
      />

      <SavingsGoalCard goal={state.savingsGoal} updateSavingsGoal={updateSavingsGoal} onError={onError} />

      <ChangePinCard settings={state.settings} updateSettings={updateSettings} onError={onError} />

      <Card title="Storage">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className={buttonClass} onClick={onExport} type="button">
            Export JSON
          </button>
          <button className={secondaryButtonClass} onClick={onImportClick} type="button">
            Import JSON
          </button>
          <button className={dangerButtonClass} onClick={onReset} type="button">
            Reset to Seed Data
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
        </div>
      </Card>
    </div>
  )
}

function SettingsCard({ settings, updateSettings, onError }) {
  const [weeklyIncomeAmount, setWeeklyIncomeAmount] = useState(String(settings.weeklyIncomeAmount / 100))
  const [spend, setSpend] = useState(String(settings.splitPercentages.spend))
  const [save, setSave] = useState(String(settings.splitPercentages.save))
  const [give, setGive] = useState(String(settings.splitPercentages.give))
  const [summerStart, setSummerStart] = useState(settings.summerStart)
  const [summerEnd, setSummerEnd] = useState(settings.summerEnd)

  function submit(e) {
    e.preventDefault()
    try {
      updateSettings(
        {
          weeklyIncomeAmount: dollarsToCents(weeklyIncomeAmount),
          splitPercentages: { spend: Number(spend), save: Number(save), give: Number(give) },
          summerStart,
          summerEnd,
        },
        'Settings saved.'
      )
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Settings">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Weekly income (dollars)">
          <input className={inputClass} value={weeklyIncomeAmount} onChange={(e) => setWeeklyIncomeAmount(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Spend %">
            <input className={inputClass} value={spend} onChange={(e) => setSpend(e.target.value)} />
          </Field>
          <Field label="Save %">
            <input className={inputClass} value={save} onChange={(e) => setSave(e.target.value)} />
          </Field>
          <Field label="Give %">
            <input className={inputClass} value={give} onChange={(e) => setGive(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Summer start">
            <input type="date" className={inputClass} value={summerStart} onChange={(e) => setSummerStart(e.target.value)} />
          </Field>
          <Field label="Summer end">
            <input type="date" className={inputClass} value={summerEnd} onChange={(e) => setSummerEnd(e.target.value)} />
          </Field>
        </div>
        <button className={buttonClass} type="submit">
          Save Settings
        </button>
      </form>
    </Card>
  )
}

// Only one active goal in Summer V1 - "current" progress is always the
// live Save balance (see ChildHome.jsx), so this form only ever needs to
// capture the title and the target.
function SavingsGoalCard({ goal, updateSavingsGoal, onError }) {
  const [title, setTitle] = useState(goal?.title ?? '')
  const [target, setTarget] = useState(goal ? String(goal.targetCents / 100) : '')

  function submit(e) {
    e.preventDefault()
    try {
      if (!title.trim()) {
        onError(new Error('Give the goal a name.'))
        return
      }
      updateSavingsGoal({ title: title.trim(), targetCents: dollarsToCents(target || '0') }, 'Savings goal saved.')
    } catch (error) {
      onError(error)
    }
  }

  function clearGoal() {
    updateSavingsGoal(null, 'Savings goal cleared.')
    setTitle('')
    setTarget('')
  }

  return (
    <Card title="Savings Goal">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Goal name">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nintendo Game" />
        </Field>
        <Field label="Target ($)">
          <input className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="60.00" />
        </Field>
        <div className="flex gap-3">
          <button className={buttonClass} type="submit">
            Save Goal
          </button>
          {goal && (
            <button type="button" className={dangerButtonClass} onClick={clearGoal}>
              Clear Goal
            </button>
          )}
        </div>
      </form>
    </Card>
  )
}

// Draft rows always store money columns as dollar strings (matching what
// the input displays), never as cents - that keeps a freshly-loaded,
// never-touched row and a hand-edited row in the same shape, so save()
// can convert every row the same way instead of guessing which rows were
// edited. Non-money columns default to '' when missing - an item saved
// before a column existed (e.g. an achievement from before
// assessmentInstructions was added) would otherwise hand `undefined` to a
// controlled input.
function toDraftItem(item, columns) {
  const copy = { ...item }
  columns.forEach((col) => {
    if (col.type === 'money') copy[col.key] = centsToDollars(Number(item[col.key]) || 0)
    else if (copy[col.key] === undefined) copy[col.key] = ''
  })
  return copy
}

function ListEditorCard({ title, idPrefix, items, columns, defaults, onSave }) {
  const [draft, setDraft] = useState(() => items.map((item) => toDraftItem(item, columns)))

  function updateField(index, key, value) {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  function removeItem(index) {
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }

  function addItem() {
    setDraft((prev) => [...prev, { id: makeId(idPrefix), ...defaults }])
  }

  function save() {
    const normalized = draft.map((item) => {
      const copy = { ...item }
      columns.forEach((col) => {
        if (col.type === 'money') copy[col.key] = dollarsToCents(String(item[col.key]))
      })
      return copy
    })
    onSave(normalized)
  }

  return (
    <Card title={title}>
      <div className="space-y-2">
        {draft.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 bg-slate-800 rounded-xl p-2">
            {columns.map((col) =>
              col.type === 'select' ? (
                <select
                  key={col.key}
                  className={`${rowInputClass} ${col.narrow ? 'w-20 shrink-0' : 'flex-1'}`}
                  value={item[col.key]}
                  onChange={(e) => updateField(index, col.key, e.target.value)}
                >
                  {col.options.map((option) => {
                    const value = typeof option === 'string' ? option : option.value
                    const label = typeof option === 'string' ? option : option.label
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <input
                  key={col.key}
                  className={`${rowInputClass} ${col.narrow ? 'w-20 shrink-0' : 'flex-1'}`}
                  value={item[col.key]}
                  onChange={(e) => updateField(index, col.key, e.target.value)}
                />
              )
            )}
            <button
              type="button"
              className="min-h-[44px] px-3 rounded-lg bg-red-900 text-red-200 text-sm font-semibold hover:bg-red-800"
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-3">
          <button type="button" className={secondaryButtonClass} onClick={addItem}>
            + Add
          </button>
          <button type="button" className={buttonClass} onClick={save}>
            Save {title}
          </button>
        </div>
      </div>
    </Card>
  )
}

function ChangePinCard({ settings, updateSettings, onError }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [checking, setChecking] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setChecking(true)
    try {
      const ok = await verifyPin(current, settings.parentPinHash)
      if (!ok) {
        setChecking(false)
        onError(new Error('Current PIN is incorrect.'))
        return
      }
      if (!next || next !== confirm) {
        setChecking(false)
        onError(new Error('New PIN and confirmation must match.'))
        return
      }
      const parentPinHash = await hashPin(next)
      updateSettings({ parentPinHash }, 'Parent PIN changed.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card title="Change Parent PIN">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Current PIN">
          <input
            className={inputClass}
            type="password"
            inputMode="numeric"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>
        <Field label="New PIN">
          <input
            className={inputClass}
            type="password"
            inputMode="numeric"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label="Confirm new PIN">
          <input
            className={inputClass}
            type="password"
            inputMode="numeric"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <button className={buttonClass} type="submit" disabled={checking}>
          {checking ? 'Checking...' : 'Change PIN'}
        </button>
      </form>
    </Card>
  )
}
