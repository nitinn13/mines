"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import MineCell from "./mine-cell"
import { WalletConnectButton } from "./WalletConnectButton"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useContract } from "@/hooks/useContract"
import { useMPCKeyManager } from "@/hooks/useMPCKeyManager"

interface Cell {
  id: number
  isBomb: boolean
  isRevealed: boolean
}

function MPCKeyManager() {
  useMPCKeyManager()
  return null
}

export default function MineGame() {
  const { wallet } = useSolanaWallet()
  const { choosemine } = useContract()

  const [cells, setCells] = useState<Cell[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gameKey, setGameKey] = useState(0)

  const initializeGame = () => {
    const newCells: Cell[] = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      isBomb: false,
      isRevealed: false,
    }))
    setCells(newCells)
    setGameOver(false)
    setGameWon(false)
    setGameStarted(true)
    setGameKey(prev => prev + 1)
  }

  const handleCellClick = async (id: number) => {
    if (gameOver || gameWon || cells[id].isRevealed || loading) return

    setLoading(true)
    const updatedCells = [...cells]
    const clickedCell = updatedCells[id]
    clickedCell.isRevealed = true
    setCells(updatedCells)

    try {
      console.log("Mine clicked:", id + 1)
      const result : any = await Promise.race([
        choosemine(id + 1),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout after 3s")), 3000)
        ),
      ])

      console.log("Mine result:", result)

      if (!result.success) {
        throw new Error(result.error || "Hook failed")
      }

      // ✅ If hook says success → WIN
      setGameWon(true)
      setGameStarted(false)
    } catch (err) {
      console.warn("Falling back to local demo logic:", err)

      // ❌ If hook fails, fallback to demo bomb logic
      const isBomb = Math.random() < 0.33 // 1/3 chance bomb
      if (isBomb) {
        const finalCells = updatedCells.map(cell => ({
          ...cell,
          isRevealed: cell.id === id ? true : cell.isRevealed,
          isBomb: cell.id === id ? true : cell.isBomb,
        }))
        setCells(finalCells)
        setGameOver(true)
      } else {
        setGameWon(true)
      }
      setGameStarted(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
      <MPCKeyManager />

      <div className="w-full max-w-2xl">
        <div className="bg-black border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white tracking-tighter">MINES</h1>
            <p className="text-white/40 text-sm mt-2 font-light">Pick one. Win or lose.</p>
          </div>

          <div className="flex flex-col gap-8 items-center">
            <div className="flex-1 flex items-center justify-center gap-4 bg-white">
              <WalletConnectButton />
            </div>

            <p className="text-white/60 text-base font-light">
              {wallet?.publicKey
                ? "Wallet connected. Start a new game!"
                : "Please connect your wallet to play."}
            </p>

            <div className="flex-1 flex items-center justify-center">
              <div
                className={`grid grid-cols-3 gap-4 p-6 bg-white/2 rounded-2xl border border-white/5 
                transition-all duration-700 ease-in-out
                ${gameStarted ? "w-[520px] p-8" : "w-[220px] p-6"}`}
              >
                {cells.map(cell => (
                  <MineCell
                    key={`${gameKey}-${cell.id}`}
                    cell={cell}
                    onClick={() => handleCellClick(cell.id)}
                    disabled={gameOver || gameWon || loading}
                  />
                ))}
              </div>
            </div>

            <div className="text-center space-y-3">
              {loading ? (
                <>
                  <p className="text-white/60 text-base font-light animate-pulse">
                    Processing on-chain...
                  </p>
                </>
              ) : gameOver ? (
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
              onClick={() => {
                if (!wallet?.publicKey) {
                  alert("Please connect your wallet first!")
                  return
                }
                initializeGame()
              }}
              disabled={!wallet?.publicKey}
              className={`w-full font-bold py-3 rounded-lg transition-all duration-300 text-base shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-wide
              ${wallet?.publicKey
                  ? "bg-white hover:bg-white/90 text-black"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              {!wallet?.publicKey
                ? "Please Connect Wallet First"
                : gameStarted || gameOver || gameWon
                  ? "Play Again"
                  : "New Game"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
