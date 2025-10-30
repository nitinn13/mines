export const SHARE_PPM = 1000000;
export const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; 
export const SLIPPAGE = 1.05;
export const DEFAULT_BADGE = "new";

// MPC Key derivation constants
export const MPC_KEY_DERIVATION_MESSAGE = 'Sign this message to derive your encryption key for Mine Game';
export const MPC_STORAGE_PREFIX = 'mine_mpc_keys_';

/**
 * Validates that the MPC encryption key environment variable is set
 * Throws an error if missing to prevent runtime issues
 */
function validateMPCEncryptionKey(): string {
  const mpcKey = process.env.NEXT_PUBLIC_MPC_ENCRYPTION_KEY;
  
  if (!mpcKey) {
    const errorMessage = 'NEXT_PUBLIC_MPC_ENCRYPTION_KEY environment variable is required but not set. Please set this variable in your .env file.';
    console.error('❌ MPC Encryption Key Validation Failed:', errorMessage);
    console.error('🔧 To fix this issue:');
    console.error('   1. Create a .env file in your project root');
    console.error('   2. Add: NEXT_PUBLIC_MPC_ENCRYPTION_KEY=your_secure_encryption_key_here');
    console.error('   3. Restart your development server');
    throw new Error(errorMessage);
  }
  
  console.log('✅ MPC Encryption Key validation passed');
  return mpcKey;
}

export const MPC_ENCRYPTION_KEY = validateMPCEncryptionKey();
