# 💣 Encrypted Mines — Built for the Arcium Hackathon

**Encrypted Mines** is a privacy-preserving twist on the classic *Mines* game, built using **Arcium’s Confidential Compute Layer**.  
Every move, mine placement, and outcome is securely computed on **Arcium MXE (Multiparty Execution)** — ensuring that sensitive game logic never leaves the encrypted runtime.

---


## 🔗 Deployment Details

Deployed Program ID:
2JJK2akXDKexC1uMBwRH32KZirQfebQcoGTrXaJmk6Ce

View on Solana Explorer:
👉 https://explorer.solana.com/address/2JJK2akXDKexC1uMBwRH32KZirQfebQcoGTrXaJmk6Ce?cluster=devnet

--- 


## 🚀 Overview

This project was built as part of the **Arcium Hackathon**, showcasing how **on-chain games** can maintain *complete fairness and privacy* using encrypted computation.  

Instead of running the game logic on a public backend or frontend, we leverage **Arcium’s MXE** to handle:
- Secure random mine placement  
- Encrypted win/loss determination  
- Game state verification without revealing internal values  

This demonstrates a practical use case for **confidential compute in Web3 gaming**.

---

## 🧠 Tech Stack

| Layer | Tech Used |
|-------|------------|
| **Frontend** | Next.js, React, Tailwind CSS |
| **UI Components** | Shadcn/UI |
| **State Management** | React Hooks |
| **Confidential Compute** | **Arcium MXE** (Multiparty Execution Environment) |
| **Language Bindings** | Rust (for MXE encrypted logic) |
| **Blockchain** | Solana (Deployed Smart Contract) |

---

## 🔒 How Arcium Fits In

Traditional blockchain games expose logic and randomness publicly, making them vulnerable to exploitation.  
With **Arcium**, we can:
- Run game logic inside **encrypted multiparty enclaves**
- Use **secure randomness** for fair mine generation
- Keep all internal data — mine positions, outcomes — confidential from both players and hosts

> 🧩 The MXE acts as a decentralized, encrypted backend for the game, returning only verified results.

---

## 🎮 Gameplay

1. Click **Start Game** to initialize a new encrypted session.  
2. Once the grid appears, select any cell.  
   - If you hit a **mine**, the MXE computes a *loss* state.  
   - Otherwise, the MXE verifies a *win* state.  
3. The frontend updates the result instantly based on the secure response.

The UI dynamically expands once the game begins and displays a clear status message below the grid.

---
