"use client";

import React, { useState } from 'react';
import { Bomb, Gem } from 'lucide-react';

type GameState = 'start' | 'playing' | 'won' | 'lost';

export default function MinesGame() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [revealedMines, setRevealedMines] = useState<number[]>([]);
  const [bombs, setBombs] = useState<number[]>([]);

  const initGame = () => {
    const bombPositions: number[] = [];
    while (bombPositions.length < 3) {
      const pos = Math.floor(Math.random() * 9);
      if (!bombPositions.includes(pos)) {
        bombPositions.push(pos);
      }
    }
    setBombs(bombPositions);
    setRevealedMines([]);
    setGameState('playing');
  };

  const handleMineClick = (index: number) => {
    if (gameState !== 'playing') return;

    setRevealedMines([index]);

    if (bombs.includes(index)) {
      setGameState('lost');
      setTimeout(() => setRevealedMines([0, 1, 2, 3, 4, 5, 6, 7, 8]), 300);
    } else {
      setGameState('won');
      setTimeout(() => setRevealedMines([0, 1, 2, 3, 4, 5, 6, 7, 8]), 300);
    }
  };

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-zinc-950 border border-zinc-800/50 rounded-3xl p-12 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-white mb-3">MINES</h1>
              <p className="text-zinc-500 text-base">Pick one. Win or lose.</p>
            </div>

            <div className="flex justify-center mb-12">
              <div className="bg-zinc-900/50 rounded-2xl p-6 inline-block">
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-zinc-800 rounded-sm"></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mb-8 space-y-3">
              <p className="text-zinc-400 text-lg">Ready to play?</p>
              <p className="text-zinc-500 text-sm">3 bombs hidden among 9 cells</p>
              <p className="text-zinc-600 text-sm">Click any cell to start</p>
            </div>

            <button
              onClick={initGame}
              className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-5 rounded-2xl transition-all duration-200 text-sm tracking-wider uppercase"
            >
              NEW GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-zinc-950 border border-zinc-800/50 rounded-3xl p-12 shadow-2xl">
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-white mb-2">MINES</h1>
            <p className="text-zinc-500 text-sm">
              {gameState === 'playing'
                ? 'Choose carefully...'
                : gameState === 'won'
                ? 'You won!'
                : 'You lost!'}
            </p>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleMineClick(index)}
                  disabled={gameState !== 'playing'}
                  className={`aspect-square rounded-xl transition-all duration-300 relative flex items-center justify-center ${
                    !revealedMines.includes(index)
                      ? 'bg-zinc-800 hover:bg-zinc-700 active:scale-95 cursor-pointer shadow-lg'
                      : bombs.includes(index)
                      ? 'bg-red-900/30 border-2 border-red-500/50'
                      : 'bg-emerald-900/30 border-2 border-emerald-500/50'
                  } ${gameState !== 'playing' ? 'cursor-not-allowed' : ''}`}
                >
                  {revealedMines.includes(index) && (
                    <div className="animate-in zoom-in duration-300">
                      {bombs.includes(index) ? (
                        <Bomb className="w-12 h-12 text-red-400" strokeWidth={1.5} />
                      ) : (
                        <Gem className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {gameState !== 'playing' && (
            <div
              className={`mb-8 p-6 rounded-2xl text-center ${
                gameState === 'won'
                  ? 'bg-emerald-900/20 border border-emerald-500/30'
                  : 'bg-red-900/20 border border-red-500/30'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${
                  gameState === 'won' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}
              >
                {gameState === 'won' ? (
                  <Gem className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
                ) : (
                  <Bomb className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                )}
              </div>
              <p
                className={`text-3xl font-bold mb-2 ${
                  gameState === 'won' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {gameState === 'won' ? 'YOU WON!' : 'YOU LOST!'}
              </p>
              <p className="text-zinc-400 text-sm">
                {gameState === 'won' ? 'Safe tile found' : 'Bomb triggered'}
              </p>
            </div>
          )}

          <button
            onClick={initGame}
            className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-5 rounded-2xl transition-all duration-200 text-sm tracking-wider uppercase mb-8"
          >
            NEW GAME
          </button>

         
        </div>
      </div>
    </div>
  );
}
