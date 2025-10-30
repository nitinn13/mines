import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';

export const useSolanaWallet = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  return {
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    connection,
    wallet,
  };
};
