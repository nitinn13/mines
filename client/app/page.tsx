import MineGame from "@/components/mine-game"
import { WalletContextProvider } from "@/components/WalletProvider"

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <WalletContextProvider>
        <MineGame />
      </WalletContextProvider>
    </main>
  )
}

