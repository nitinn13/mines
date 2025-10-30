"use client";

import { useCallback, useMemo, useState } from "react";
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
import { PublicKey, Transaction } from "@solana/web3.js";
import {
    createAssociatedTokenAccount,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
} from "@solana/spl-token";



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










}