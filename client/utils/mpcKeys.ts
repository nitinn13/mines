import { x25519 } from "@arcium-hq/client";
import { MPC_KEY_DERIVATION_MESSAGE, MPC_STORAGE_PREFIX, MPC_ENCRYPTION_KEY } from "../constants";

export interface MPCKeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export interface EncryptedMPCKeys {
  encryptedPrivateKey: string;
  encryptedPublicKey: string;
  walletPublicKey: string;
}

/**
 * Derives X25519 key pair from wallet signature
 */
export async function deriveX25519KeyFromWallet(
  wallet: any, // Solana wallet adapter
  connection?: any, // Solana connection
  message?: string
): Promise<MPCKeyPair> {
  // 1. Create a deterministic message to sign
  const messageToSign = message || MPC_KEY_DERIVATION_MESSAGE;
  const encodedMessage = new TextEncoder().encode(messageToSign);
  
  // 2. Try different signing methods based on wallet capabilities
  let signature: Uint8Array;
  
  // First try signMessage if available
  if (wallet.adapter && typeof wallet.adapter.signMessage === 'function') {
    signature = await wallet.adapter.signMessage(encodedMessage);
  } 
  // Fallback to using signTransaction with a dummy transaction
  else if (wallet.adapter && typeof wallet.adapter.signTransaction === 'function') {
    // Create a minimal transaction that can be signed
    const { Transaction, SystemProgram } = await import('@solana/web3.js');
    const dummyTransaction = new Transaction();
    
    // Add a dummy instruction that does nothing but can be signed
    dummyTransaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.adapter.publicKey!,
        toPubkey: wallet.adapter.publicKey!,
        lamports: 0, // Transfer 0 lamports (no actual transfer)
      })
    );
    
    // Set recent blockhash (required for signing)
    if (connection) {
      const { blockhash } = await connection.getLatestBlockhash();
      dummyTransaction.recentBlockhash = blockhash;
    } else {
      // Fallback to devnet connection
      const { Connection } = await import('@solana/web3.js');
      const fallbackConnection = new Connection('https://api.devnet.solana.com');
      const { blockhash } = await fallbackConnection.getLatestBlockhash();
      dummyTransaction.recentBlockhash = blockhash;
    }
    
    dummyTransaction.feePayer = wallet.adapter.publicKey!;
    
    const signedTransaction = await wallet.adapter.signTransaction(dummyTransaction);
    signature = signedTransaction.signature;
  } else {
    throw new Error('Wallet adapter does not support signMessage or signTransaction');
  }
  
  // 3. Derive key material from signature using SHA-256
  // @ts-ignore
  const keyMaterial = await crypto.subtle.digest('SHA-256', signature);
  
  // 4. Use first 32 bytes as x25519 private key
  const privateKey = new Uint8Array(keyMaterial);
  
  // 5. Derive public key
  const publicKey = x25519.getPublicKey(privateKey);
  
  return { privateKey, publicKey };
}

/**
 * Encrypts data using AES-GCM
 */
async function encryptData(data: Uint8Array, key: string): Promise<string> {
  // Convert string key to proper AES key length (256 bits = 32 bytes)
  const keyBuffer = new TextEncoder().encode(key);
  let aesKey: Uint8Array;
  
  if (keyBuffer.length === 32) {
    aesKey = keyBuffer;
  } else if (keyBuffer.length === 16) {
    aesKey = keyBuffer;
  } else {
    // Hash the key to get exactly 32 bytes
      // @ts-ignore
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
    aesKey = new Uint8Array(hashBuffer);
  }
 
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
      // @ts-ignore
    aesKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
      // @ts-ignore
    data
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using AES-GCM
 */
async function decryptData(encryptedData: string, key: string): Promise<Uint8Array> {
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(char => char.charCodeAt(0))
  );
  
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  // Convert string key to proper AES key length (256 bits = 32 bytes)
  const keyBuffer = new TextEncoder().encode(key);
  let aesKey: Uint8Array;
  
  if (keyBuffer.length === 32) {
    aesKey = keyBuffer;
  } else if (keyBuffer.length === 16) {
    aesKey = keyBuffer;
  } else {
    // Hash the key to get exactly 32 bytes
      // @ts-ignore
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
    aesKey = new Uint8Array(hashBuffer);
  }
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
      // @ts-ignore
    aesKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );
  
  return new Uint8Array(decrypted);
}

/**
 * Stores encrypted MPC keys in localStorage
 */
export async function storeMPCKeys(
  walletPublicKey: string,
  privateKey: Uint8Array,
  publicKey: Uint8Array
): Promise<void> {
  try {
    const encryptedPrivateKey = await encryptData(privateKey, MPC_ENCRYPTION_KEY);
    const encryptedPublicKey = await encryptData(publicKey, MPC_ENCRYPTION_KEY);
    
    const encryptedKeys: EncryptedMPCKeys = {
      encryptedPrivateKey,
      encryptedPublicKey,
      walletPublicKey,
    };
    
    const storageKey = `${MPC_STORAGE_PREFIX}${walletPublicKey}`;
    localStorage.setItem(storageKey, JSON.stringify(encryptedKeys));
    
    console.log('MPC keys stored successfully for wallet:', walletPublicKey);
  } catch (error) {
    console.error('Failed to store MPC keys:', error);
    throw error;
  }
}

/**
 * Retrieves and decrypts MPC keys from localStorage
 */
export async function getMPCKeys(walletPublicKey: string): Promise<MPCKeyPair | null> {
  try {
    const storageKey = `${MPC_STORAGE_PREFIX}${walletPublicKey}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return null;
    }
    
    const encryptedKeys: EncryptedMPCKeys = JSON.parse(stored);
    
    const privateKey = await decryptData(encryptedKeys.encryptedPrivateKey, MPC_ENCRYPTION_KEY);
    const publicKey = await decryptData(encryptedKeys.encryptedPublicKey, MPC_ENCRYPTION_KEY);
    
    return { privateKey, publicKey };
  } catch (error) {
    console.error('Failed to retrieve MPC keys:', error);
    return null;
  }
}

/**
 * Checks if MPC keys exist for a wallet
 */
export function hasMPCKeys(walletPublicKey: string): boolean {
  const storageKey = `${MPC_STORAGE_PREFIX}${walletPublicKey}`;
  return localStorage.getItem(storageKey) !== null;
}

/**
 * Removes MPC keys from localStorage
 */
export function removeMPCKeys(walletPublicKey: string): void {
  const storageKey = `${MPC_STORAGE_PREFIX}${walletPublicKey}`;
  localStorage.removeItem(storageKey);
  console.log('MPC keys removed for wallet:', walletPublicKey);
}

/**
 * Clears all MPC keys from localStorage
 */
export function clearAllMPCKeys(): void {
  const keys = Object.keys(localStorage);
  const mpcKeys = keys.filter(key => key.startsWith(MPC_STORAGE_PREFIX));
  
  mpcKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`Cleared ${mpcKeys.length} MPC key entries from localStorage`);
}