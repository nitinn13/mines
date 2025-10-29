"use client"

interface Cell {
  id: number
  isBomb: boolean
  isRevealed: boolean
}

interface MineCellProps {
  cell: Cell
  onClick: () => void
  disabled: boolean
}

export default function MineCell({ cell, onClick, disabled }: MineCellProps) {
  // Force re-render when cell properties change
  return (
    <button
      onClick={onClick}
      disabled={disabled || cell.isRevealed}
      className={`
        aspect-square rounded-xl font-bold text-4xl transition-all duration-300 transform
        border flex items-center justify-center relative overflow-hidden group
        ${
          cell.isRevealed
            ? cell.isBomb
              ? "bg-white/10 border-white/20 text-white/60 cursor-default scale-100"
              : "bg-white border-white text-black cursor-default scale-100 shadow-lg"
            : "bg-black border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
        }
      `}
    >
      {!cell.isRevealed && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-white/0 group-hover:from-white/10 transition-all duration-300"></div>
      )}

      <span className="relative z-10">
        {cell.isRevealed && (cell.isBomb ? "💣" : "✓")}
      </span>
    </button>
  )
}