"use client";

import { useCallback, useMemo } from "react";
import { useSolanaWallet } from "./useSolanaWallet";
import * as anchor from "@coral-xyz/anchor";
import { Gamemine } from "../lib/contract/gamemine";
import { randomBytes } from "crypto";
import {
    awaitComputationFinalization,
    getCompDefAccOffset,
    RescueCipher,
    deserializeLE,
    getMXEAccAddress,
    getMempoolAccAddress,
    getCompDefAccAddress,
    getExecutingPoolAccAddress,
    x25519,
    getComputationAccAddress,
    getMXEPublicKey,
    getClusterAccAddress,
} from "@arcium-hq/client";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import IDL from "../lib/contract/gamemine.json";
import { getMPCKeys } from "@/utils/mpcKeys";



type Event = anchor.IdlEvents<Gamemine>;

async function waitForComputationFinalization(
    provider: anchor.AnchorProvider,
    computationOffset: anchor.BN,
    programId: anchor.Program<Gamemine>["programId"],
    commitment: "confirmed" | "finalized" = "finalized",
    timeoutMs: number = 120000
) {
    try {
        const finalizeSig = await Promise.race([
            awaitComputationFinalization(
                provider,
                computationOffset,
                programId,
                commitment
            ),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Computation finalization timeout after ${timeoutMs / 1000} seconds`)), timeoutMs)
            )
        ]);

        return { success: true, finalizeSig, error: null };
    } catch (error) {
        console.warn("Computation finalization failed or timed out:", error);
        return {
            success: false,
            finalizeSig: null,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}


export const useContract = () => {
    const clusterOffset = 1078779259;
    const clusterAccount = getClusterAccAddress(clusterOffset);
    const { connected, publicKey, signTransaction, connection, wallet } =
        useSolanaWallet();
    const anchorWallet = useAnchorWallet();
    const provider = useMemo(() => {
        return new anchor.AnchorProvider(connection, anchorWallet!, {
            commitment: "confirmed",
        });
    }, [connection, anchorWallet]);
    const program = useMemo(() => {
        if (!provider) {
            return null;
        }
        // Create a clean IDL object to avoid structuredClone issues
        const cleanIdl = JSON.parse(JSON.stringify(IDL));
        return new anchor.Program<Gamemine>(
            cleanIdl,
            provider
        ) as anchor.Program<Gamemine>;
    }, [provider]);


    const cipherDataPromise = useMemo(async () => {
        if (!program || !publicKey) {
            return null;
        }

        try {
            const mxePublicKey = await getMXEPublicKey(provider, program.programId);
            if (!mxePublicKey) {
                throw new Error("Failed to get MXE public key");
            }

            // Try to get stored MPC keys first
            const storedKeys = await getMPCKeys(publicKey.toBase58());
            let cipherPrivateKey: Uint8Array;
            let cipherPublicKey: Uint8Array;

            if (storedKeys) {
                console.log("Using stored MPC keys for wallet:", publicKey.toBase58());
                cipherPrivateKey = storedKeys.privateKey;
                cipherPublicKey = storedKeys.publicKey;
            } else {
                console.error("No stored MPC keys found", publicKey.toBase58());
                throw new Error("No stored MPC keys found");
            }

            const cipherSharedSecret = x25519.getSharedSecret(
                cipherPrivateKey,
                mxePublicKey
            );
            const cipher = new RescueCipher(cipherSharedSecret);
            return { cipher, cipherPublicKey };
        } catch (error) {
            console.error("Error in cipherDataPromise:", error);
            return null;
        }
    }, [provider, program, publicKey]);


    const choosemine = useCallback(
        async (choice: number) => {
            console.log("mine choice", choice);

            if (!program || !publicKey || !signTransaction) {
                return {
                    success: false,
                    error: "Wallet not connected",
                };
            }

            const cipherData = await cipherDataPromise;
            if (!cipherData) {
                return {
                    success: false,
                    error: "Failed to get cipher data",
                };
            }


            try {
                const { cipher, cipherPublicKey } = cipherData;
                const nonce = randomBytes(16);
                const plaintext = [BigInt(choice)];
                const ciphertext = cipher.encrypt(plaintext, nonce);
                const ComputationOffset = new anchor.BN(randomBytes(8), "hex");
                const gameMineTx = await program.methods
                    .mine(
                        ComputationOffset,
                        Array.from(ciphertext[0]),
                        Array.from(cipherPublicKey),
                        new anchor.BN(deserializeLE(nonce).toString())
                    )
                    .accountsPartial({
                        computationAccount: getComputationAccAddress(
                            program.programId,
                            ComputationOffset
                        ),
                        clusterAccount: clusterAccount,
                        mxeAccount: getMXEAccAddress(program.programId),
                        mempoolAccount: getMempoolAccAddress(program.programId),
                        executingPool: getExecutingPoolAccAddress(program.programId),
                        compDefAccount: getCompDefAccAddress(
                            program.programId,
                            Buffer.from(getCompDefAccOffset("mine")).readUInt32LE()
                        ),
                        payer: publicKey,
                    })
                    .transaction();

                gameMineTx.recentBlockhash = (
                    await connection.getLatestBlockhash()
                ).blockhash;
                gameMineTx.feePayer = publicKey;

                const signedTx = await signTransaction(gameMineTx);
                const txid = await connection.sendRawTransaction(signedTx.serialize(), {
                    skipPreflight: true,
                });

                const finalizationResult = await waitForComputationFinalization(
                    provider as anchor.AnchorProvider,
                    ComputationOffset,
                    program.programId
                );
                console.log("Buy shares finalizationResult", finalizationResult);
                if (!finalizationResult.success || !finalizationResult.finalizeSig) {
                    return {
                        success: false,
                        error: "Computation finalization failed or missing signature",
                    };
                }

                const gameMineEvent = await parseEvent(
                    "gameMineEvent",
                    finalizationResult.finalizeSig as string
                );
                return {
                    success: gameMineEvent.status === 1 ? true : false,
                    txHash: txid,
                    event: gameMineEvent,
                    finalizeSig: finalizationResult.finalizeSig,
                    warning: !finalizationResult.success ? "Transaction sent but computation finalization timed out." : undefined
                };
            }
            catch (error) {
                console.error("Error in buyShares:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }

        }, [program, publicKey, cipherDataPromise]);


    async function parseEvent(eventName: string, signature: string) {
        const tx = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

        if (!tx) {
            console.log('Transaction not found');
            return null;
        }

        let data = null;

        if (!program) {
            console.warn("Program not initialized");
            return null;
        }
        if (!tx.meta?.logMessages) {
            console.warn("No log messages found in transaction");
            return null;
        }


        const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
        const events = eventParser.parseLogs(tx.meta.logMessages);
        for (let event of events) {
            console.log("event", event);
            if (event.name === eventName) {
                data = event.data;
            }
        }

        return data
    }


    return { choosemine };

}