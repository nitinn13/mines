"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import MineCell from "./mine-cell"

interface Cell {
    id: number
    isBomb: boolean
    isRevealed: boolean
}

export default function MineGame() {
    const [cells, setCells] = useState<Cell[]>([])
    const [gameOver, setGameOver] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [gameKey, setGameKey] = useState(0)

    const initializeGame = () => {
        const newCells: Cell[] = Array.from({ length: 9 }, (_, i) => ({
            id: i,
            isBomb: false,
            isRevealed: false,
        }))

        // randomly place 3 bombs
        const bombs: number[] = []
        while (bombs.length < 3) {
            const randomIndex = Math.floor(Math.random() * 9)
            if (!bombs.includes(randomIndex)) {
                bombs.push(randomIndex)
                newCells[randomIndex].isBomb = true
            }
        }

        setCells(newCells)
        setGameOver(false)
        setGameWon(false)
        setGameStarted(true)
        setGameKey(prev => prev + 1)
    }

    const handleCellClick = (id: number) => {
        if (gameOver || gameWon || cells[id].isRevealed) return

        const updatedCells = [...cells]
        const clickedCell = updatedCells[id]
        clickedCell.isRevealed = true
        setCells(updatedCells)

        // ✅ immediate finish logic
        if (clickedCell.isBomb) {
            const finalCells = updatedCells.map(cell => ({
                ...cell,
                isRevealed: cell.isBomb ? true : cell.isRevealed
            }))
            setCells(finalCells)
            setGameOver(true)
            setGameStarted(false)
        } else {
            setGameWon(true)
            setGameStarted(false)
        }
    }

    const handleButtonClick = () => {
        initializeGame()
    }

    return (
        <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-black border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-white tracking-tighter">MINES</h1>
                        <p className="text-white/40 text-sm mt-2 font-light">Pick one. Win or lose.</p>
                    </div>

                    {/* Main Game Area */}
                    <div className="flex flex-col gap-8 items-center">
                        <div className="flex-1 flex items-center justify-center">
                            <div
                                className={`grid grid-cols-3 gap-4 p-6 bg-white/2 rounded-2xl border border-white/5 
                                    transition-all duration-700 ease-in-out
                                    ${gameStarted ? "w-[520px] p-8" : "w-[320px] p-6"}`}
                            >
                                {cells.map((cell) => (
                                    <MineCell
                                        key={`${gameKey}-${cell.id}`}
                                        cell={cell}
                                        onClick={() => handleCellClick(cell.id)}
                                        disabled={gameOver || gameWon}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Status below grid */}
                        <div className="text-center space-y-3">
                            {gameOver ? (
                                <>
                                    <div className="text-6xl font-black text-white/20">💣</div>
                                    <p className="text-white font-bold text-2xl tracking-tight">BOMB HIT</p>
                                    <p className="text-white/40 text-sm mt-2 font-light">You lost this round</p>
                                </>
                            ) : gameWon ? (
                                <>
                                    <div className="text-6xl font-black text-white/20">✨</div>
                                    <p className="text-white font-bold text-2xl tracking-tight">SAFE</p>
                                    <p className="text-white/40 text-sm mt-2 font-light">You won this round</p>
                                </>
                            ) : !gameStarted ? (
                                <>
                                    <p className="text-white/60 text-base font-light">Ready to play?</p>
                                    <p className="text-white/30 text-sm">3 bombs hidden among 9 cells</p>
                                    <p className="text-white/20 text-xs mt-4">Click “New Game” to start</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-white/60 text-base font-light">Game in progress...</p>
                                    <p className="text-white/30 text-sm">Pick a cell to test your luck!</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <Button
                            onClick={handleButtonClick}
                            className="w-full bg-white hover:bg-white/90 text-black font-bold py-3 rounded-lg transition-all duration-300 text-base shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-wide"
                        >
                            {gameStarted || gameOver || gameWon ? "Play Again" : "New Game"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
