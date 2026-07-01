// Shown once right after the shared PIN unlocks. Picking a name doesn't
// authenticate anything - the PIN already did that - it just sets who
// shows up in approvedBy on whatever this operator does next.
export default function OperatorPicker({ operators, onSelect }) {
  const parents = operators.filter((op) => op.role === 'parent')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold">Who's this?</h1>
        <p className="text-slate-400">Pick who's using the dashboard right now.</p>
        <div className="grid grid-cols-1 gap-3">
          {parents.map((op) => (
            <button
              key={op.id}
              onClick={() => onSelect(op)}
              className="min-h-[64px] rounded-xl bg-amber-400 text-slate-950 text-xl font-semibold hover:bg-amber-300 active:bg-amber-500"
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
