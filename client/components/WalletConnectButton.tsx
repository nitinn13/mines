import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle, WalletIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletConnectButtonProps {
  className?: string;
}

export function WalletConnectButton({ className }: WalletConnectButtonProps) {
  const { wallet, connecting, connected, disconnect } = useWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  // If connected, show custom disconnect button
  if (connected) {
    return (
      <Button
        onClick={handleDisconnect}
        disabled={connecting}
        className={cn(
          "flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90",
          className
        )}
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden sm:inline">
          {wallet?.adapter.name || 'Connected'}
        </span>
        <span className="sm:hidden">Connected</span>
      </Button>
    );
  }

  // If not connected, show themed connect button
  return (
    <div className={className}>
      <WalletMultiButton 
        className="wallet-adapter-button !bg-accent !text-accent-foreground hover:!bg-accent/90 !border-accent/20 !rounded-md !font-medium !transition-all !duration-200 hover:!shadow-lg hover:!shadow-accent/10"
        style={{
          background: 'hsl(var(--accent))',
          color: 'hsl(var(--accent-foreground))',
          border: '1px solid hsl(var(--accent) / 0.2)',
          borderRadius: '0.375rem',
          fontWeight: '500',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none'
        }}
      />
    </div>
  );
}
