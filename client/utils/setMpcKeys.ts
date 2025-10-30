// import { x25519 } from "@arcium-hq/client";

// const MPC_STORAGE_PREFIX = "MPC_KEYS_";
// const MPC_ENCRYPTION_KEY = process.env.NEXT_PUBLIC_MPC_ENCRYPTION_KEY // replace with your secret or generate dynamically

// export async function generateAndStoreMPCKeys(walletPublicKey: string) {
//   const { privateKey, publicKey } = x25519.generateKeyPair();

//   const encryptedPrivateKey = await encryptData(privateKey, MPC_ENCRYPTION_KEY);
//   const encryptedPublicKey = await encryptData(publicKey, MPC_ENCRYPTION_KEY);

//   const storageKey = `${MPC_STORAGE_PREFIX}${walletPublicKey}`;
//   const toStore = JSON.stringify({
//     encryptedPrivateKey,
//     encryptedPublicKey,
//   });

//   localStorage.setItem(storageKey, toStore);
//   console.log("✅ MPC keys stored for", walletPublicKey);
// }
