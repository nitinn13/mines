"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { deriveX25519KeyFromWallet, storeMPCKeys, hasMPCKeys, removeMPCKeys } from '../utils/mpcKeys';

/**
 * Hook to manage MPC key derivation and storage when wallet connects
 */
export const useMPCKeyManager = () => {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const { connection } = useConnection();
  const lastConnectedWalletRef = useRef<string | null>(null);

  const deriveAndStoreKeys = useCallback(async () => {
    if (!wallet || !publicKey || !wallet.adapter) {
      console.warn('Wallet not ready for key derivation');
      return;
    }

    const walletPublicKeyString = publicKey.toBase58();
    
    // Check if keys already exist
    if (hasMPCKeys(walletPublicKeyString)) {
      console.log('MPC keys already exist for wallet:', walletPublicKeyString);
      // const storedKeys = await getMPCKeys(publicKey.toBase58());
      // console.log('Stored MPC keys private key:', storedKeys?.privateKey);
      // console.log('Stored MPC keys public key:', storedKeys?.publicKey);
      return;
    }

    try {
      console.log('Deriving MPC keys for wallet:', walletPublicKeyString);
      const keyPair = await deriveX25519KeyFromWallet(wallet, connection);
      await storeMPCKeys(walletPublicKeyString, keyPair.privateKey, keyPair.publicKey);
      // console.log('Stored MPC keys private key:', keyPair.privateKey);
      // console.log('Stored MPC keys public key:', keyPair.publicKey);
      console.log('MPC keys derived and stored successfully');
    } catch (error) {
      console.error('Failed to derive or store MPC keys:', error);
      // Optionally disconnect wallet if key derivation fails
      // disconnect();
    }
  }, [wallet, publicKey, connection]);

  const clearKeys = useCallback(() => {
    if (publicKey) {
      removeMPCKeys(publicKey.toBase58());
    }
  }, [publicKey]);

  // Derive keys when wallet connects
  useEffect(() => {
    if (connected && wallet && publicKey) {
      const walletPublicKeyString = publicKey.toBase58();
      lastConnectedWalletRef.current = walletPublicKeyString;
      deriveAndStoreKeys();
    }
  }, [connected, wallet, publicKey, deriveAndStoreKeys]);

  // Clear keys when wallet disconnects
  useEffect(() => {
    if (!connected && lastConnectedWalletRef.current) {
      console.log('Clearing MPC keys for disconnected wallet:', lastConnectedWalletRef.current);
      removeMPCKeys(lastConnectedWalletRef.current);
      lastConnectedWalletRef.current = null;
    }
  }, [connected]);

  return {
    deriveAndStoreKeys,
    clearKeys,
  };
};
