# 💣 Encrypted Mines (Arcium MXE + Solana)

Encrypted Mines is a privacy-preserving twist on the classic Minesweeper game. The frontend is built with Next.js/React, while the core game logic (mine placement, moves, and win/loss validation) executes inside Arcium's MXE (Multiparty Execution Environment) for confidential computing, with program interactions settled on Solana.

---

## ✨ Key Features
- Confidential game logic: sensitive values (mine layout, randomness, validations) never leave the encrypted MXE runtime
- Fair, secure randomness for mine generation
- On-chain settlement on Solana with a deployed program
- Modern React UI with Tailwind and shadcn/ui components
- Wallet connect and Solana client integration

---

## 🔗 Deployment
- Solana Program ID: 2JJK2akXDKexC1uMBwRH32KZirQfebQcoGTrXaJmk6Ce
- Explorer (Devnet): https://explorer.solana.com/address/2JJK2akXDKexC1uMBwRH32KZirQfebQcoGTrXaJmk6Ce?cluster=devnet

---

## 🧱 Repository Structure
- client/ — Next.js app (UI, wallet, hooks, components)
  - app/ — Next 13 App Router (layout.tsx, page.tsx, globals.css)
  - components/ — UI and game components (mine-game.tsx, mine-cell.tsx, WalletProvider, etc.)
  - hooks/ — React hooks for Solana, contract, and MPC key mgmt (useSolanaWallet, useContract, useMPCKeyManager)
  - constants.ts — configuration and addresses used by the client
  - package.json — client dependencies and scripts
- mxe/ — Arcium MXE workspace and Solana program
  - programs/mxe/src/lib.rs — core encrypted game/program logic
  - encrypted-ixs/src/lib.rs — encrypted instruction bindings/helpers
  - Anchor.toml, Arcium.toml, Cargo.toml — build and config

---

## 🧠 How It Works (High Level)
1) The user plays Minesweeper from the Next.js UI
2) Each new game request triggers secure randomness and mine placement inside MXE
3) When the user reveals/flags a cell, the verification and state transitions are computed confidentially
4) Only the necessary public outputs are posted on-chain to Solana; private state remains within MXE

This architecture ensures the mine layout and move validation are tamper-resistant and hidden from players and validators, while still enabling on-chain settlement/verification where needed.

---

## 🛠️ Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- Wallet/Chain: @solana/web3.js and Solana wallet adapter (via WalletProvider/WalletConnectButton)
- Confidential Compute: Arcium MXE (Rust)
- Program Framework: Anchor (Solana)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn
- Solana CLI (for local/devnet testing): https://docs.solana.com/cli/install-solana-cli-tools
- Rust + Anchor (for building MXE/program): https://book.anchor-lang.com/
- Arcium toolchain (per Arcium.toml) for MXE builds

### 1) Clone
```
git clone https://github.com/nitinn13/mines
cd mines
```

### 2) Client setup
```
cd client
pnpm install   # or npm install / yarn
```

Environment variables (create .env.local):
- NEXT_PUBLIC_SOLANA_CLUSTER=devnet
- NEXT_PUBLIC_PROGRAM_ID=2JJK2akXDKexC1uMBwRH32KZirQfebQcoGTrXaJmk6Ce
- (Optional) any RPC URL overrides, wallet adapter config, Arcium endpoints if required by your setup

Run the dev server:
```
pnpm dev
# Next.js will start on http://localhost:3000
```

### 3) MXE/Program setup (optional for contributors)
- Ensure Rust, Anchor, and Arcium toolchains are installed
- Review mxe/Anchor.toml, Arcium.toml, and Cargo.toml
- Build MXE crates and Solana program:
```
cd mxe
anchor build
# and/or follow Arcium MXE build steps documented in Arcium docs
```
- Update client/constants.ts if any IDs/addresses change

---

## 🎮 Usage
- Connect a Solana wallet using the WalletConnect button
- Start a new game: the board is generated with secure randomness in MXE
- Click to reveal cells; right-click/long-press to flag mines (UI support via mine-cell.tsx)
- Game state updates are driven by encrypted validations and reflected in the UI

---

## 🧩 Notable Files
- client/components/mine-game.tsx — main game container/logic wiring
- client/components/mine-cell.tsx — individual cell behavior and rendering
- client/components/WalletProvider.tsx — sets up wallet adapters/providers
- client/hooks/useSolanaWallet.ts — wallet connection helpers
- client/hooks/useContract.ts — program interaction helpers
- client/hooks/useMPCKeyManager.ts — MPC key handling for encrypted flows
- mxe/programs/mxe/src/lib.rs — on-chain + MXE entrypoints
- mxe/encrypted-ixs/src/lib.rs — encrypted instruction bindings

---

## 🔐 Security & Privacy
- Mine positions and randomness are computed inside MXE and never exposed
- Only minimal public outputs are sent on-chain for verification
- MPC key material is handled carefully via dedicated hooks and not persisted in plaintext

---

## 🧪 Development Tips
- Use Devnet for testing; ensure your wallet has a small SOL balance (airdrop via Solana CLI)
- If transactions fail, check: cluster RPC, program ID, wallet connection, and browser console
- For MXE issues, re-check the Arcium toolchain install and ensure the encrypted-ixs crate builds

---

## 📦 Scripts (client)
Common scripts (see client/package.json):
- pnpm dev — run Next.js dev server
- pnpm build — production build
- pnpm start — run production server
- pnpm lint — lint the project

---

## 📜 License
MIT — see LICENSE if present, or adapt as needed.

---

## 🙌 Acknowledgements
- Arcium team and docs for MXE
- Solana and Anchor ecosystem
- shadcn/ui and Tailwind CSS
