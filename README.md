# SolarBond

**SolarBond is a Stellar application for transparent solar-project bond programs.**
It combines a Next.js investor experience, a small Flask API for development and
operational records, and an auditable Soroban vault contract. A wallet connection
is self-custodial: the application never receives a private key, and transactions
are signed in the visitor's selected Stellar wallet.

> **Status:** This repository includes demo data and a development backend. Do
> not treat it as audited financial infrastructure or deploy it to mainnet
> without an independent security, legal, and operational review.

## What is included

- **SolarBond web app** (`src/`) — browse projects, connect a Stellar wallet,
  preview deposits and withdrawals, and submit transactions when a contract is
  configured.
- **SolarBond API** (`app.py`) — Flask/SQLite endpoints for health checks,
  wallet-connection records, and investment intents. It never stores secrets or
  signs a transaction.
- **SolarBond vault** (`contracts/solar-bond/`) — a Soroban contract that
  accepts one Stellar Asset Contract (SAC) token and keeps one internal share
  for each deposited asset unit.

## How connection works

1. Select **Connect** in the SolarBond header. This immediately opens Stellar
   Wallets Kit; it does not merely navigate to a placeholder screen.
2. Choose a compatible wallet such as Freighter, xBull, Albedo, or Lobstr and
   approve the connection in that wallet.
3. The frontend stores only the public address and wallet identifier locally so
   the session can be restored. If `NEXT_PUBLIC_API_URL` is configured, it also
   posts an address-only connection record to `POST /api/wallet-sessions`.
4. Deposits and withdrawals are built client-side and presented to the selected
   wallet for signing. The Soroban contract is the source of truth for asset
   movement and shares.

The “Start with email or passkey” path is intentionally a **demo session**. It
allows a visitor to explore the interface but cannot sign on-chain transactions.

## Run locally

### 1. Web app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To send connection records
to the development API, create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
# Set this only after deploying the Soroban contract:
# NEXT_PUBLIC_VAULT_CONTRACT_ID=...
```

### 2. Development API

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API starts on port `5000` and creates `solarbond.db` automatically. Verify
it with:

```bash
curl http://localhost:5000/api/health
```

Available endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service status for deployment and local checks. |
| `POST` | `/api/wallet-sessions` | Records a public wallet address, wallet ID, and network after connection. |
| `POST` | `/api/investments` | Records a validated development investment intent. |

## Soroban vault

The contract is deliberately small and auditable:

1. An administrator initializes it once with the accepted SAC asset.
2. `deposit(from, amount)` transfers a positive amount into the contract and
   credits the same number of internal shares.
3. `withdraw(to, shares)` burns shares and transfers the matching asset amount
   back to the investor.

Run the contract checks from the repository root:

```bash
cargo fmt --all --check
cargo test -p solar-bond
```

Build the Wasm artifact with an installed Soroban CLI:

```bash
soroban contract build
```

## Repository layout

```text
src/                       Next.js SolarBond app
app.py                     Flask development API
contracts/solar-bond/      Soroban vault contract
messages/                  Localized UI copy
public/                    Brand assets and screenshots
```

## Security notes

- Never put secret keys, seed phrases, or contract-admin credentials in browser
  environment variables.
- Configure production CORS, authentication, database migrations, rate limits,
  and observability before exposing the Flask API publicly.
- Verify a deployed contract ID, Wasm hash, initialization transaction, and
  authorization behavior on a non-production Stellar network before use.

## License

SolarBond is licensed under the [Apache License 2.0](./LICENSE).
