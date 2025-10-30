"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useContract } from "@/hooks/useContract";
import { WalletConnectButton } from "./WalletConnectButton";
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useMPCKeyManager } from "@/hooks/useMPCKeyManager";


function MPCKeyManager() {
  useMPCKeyManager();
  return null;
}

export default function Test() {
  const { choosemine } = useContract();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChooseMine = async (choice: number) => {
      console.log("Mine clicked:", choice);
      console.log(process.env.NEXT_PUBLIC_MPC_ENCRYPTION_KEY)

    setLoading(true);
    setStatus(null);

    try {
      const result = await choosemine(choice);
      console.log("Mine result:", result);

      if (!result.success) {
        setStatus(`❌ Lost or failed: ${result.error || "Mine exploded!"}`);
      } else {
        setStatus("🎉 You won!");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("⚠️ Error while mining!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-red-200">
      <MPCKeyManager/>
      
      {/* <WalletMultiButton/> */}
      <WalletConnectButton/>
      <h1 className="text-xl font-bold text-white">Mine Game</h1>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <Button
            key={num}
            onClick={() => handleChooseMine(num)}
            disabled={loading}
          >
            {loading ? "Processing..." : `Mine ${num}`}
          </Button>
        ))}
      </div>
      {status && <p className="mt-4 text-lg">{status}</p>}
    </div>
  );
}
