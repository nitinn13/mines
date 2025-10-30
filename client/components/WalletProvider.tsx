import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Note: CSS styles are imported in main.tsx instead of here to avoid require() issues

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // Use custom RPC endpoint from environment variables
  const endpoint = useMemo(() => {
    // Check if custom RPC URL is provided in environment
    const customRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    // const debugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
    
    // if (debugLogs) {
    //   console.log('Environment variables loaded:');
    //   console.log('- VITE_SOLANA_RPC_URL:', customRpcUrl || 'not set');
    //   console.log('- VITE_SOLANA_NETWORK:', import.meta.env.VITE_SOLANA_NETWORK || 'not set');
    //   console.log('- VITE_DEBUG_LOGS:', debugLogs);
    // }
    
    if (customRpcUrl) {
      console.log('✅ Using custom RPC endpoint');
      return customRpcUrl;
    }
    
    // Fallback to default cluster API URL
    console.log('⚠️ Using default RPC endpoint for network:', network);
    return clusterApiUrl(network);
  }, [network]);

  // Suppress wallet-related warnings
  React.useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      // Suppress Solflare MetaMask detection warnings
      if (args[0] && typeof args[0] === 'string' && args[0].includes('solflare-detect-metamask')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      // Suppress React duplicate key warnings for wallet modal
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('Encountered two children with the same key') || 
           args[0].includes('Non-unique keys may cause children to be duplicated'))) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const wallets = useMemo(() => {
    // Configure wallets to avoid conflicts
    const walletAdapters = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];

    return walletAdapters;
  }, [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export wallet components for easy use
export { WalletMultiButton, WalletDisconnectButton };