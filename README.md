# SolarBond

**SolarBond is a Rust smart contract workspace for Stellar Soroban.** It provides
a small, token-backed vault primitive for solar-project bond programs: an
investor deposits a Stellar Asset Contract (SAC) token, receives internal vault
shares, and can later redeem those shares for the same token.

This repository is no longer an EVM application or Solidity project. The
on-chain source of truth is the `solar-bond` Rust crate under
[`contracts/solar-bond`](./contracts/solar-bond). The existing web application,
Python utilities, screenshots, and other folders have deliberately been kept in
place as legacy product material; they are not the contract implementation.

## Contract model

`SolarBond` is intentionally narrow and auditable:

1. An administrator initializes the vault once with its accepted SAC asset.
2. An investor authorizes a `deposit(amount)`. The contract transfers that asset
   into its own address and records one internal share per token unit.
3. An investor authorizes `withdraw(shares)`. The matching shares are burned and
   the contract transfers the same number of asset units back to the investor.

The 1:1 share model makes this crate a custody and accounting primitive, not a
yield engine. Solar-project selection, yield accrual, pricing, KYC, and oracle
reporting should be implemented in separately reviewed contracts or off-chain
services. This separation keeps the asset movement rule easy to inspect.

### Public contract interface

| Method | Auth | Description |
| --- | --- | --- |
| `initialize(admin, asset)` | `admin` | One-time configuration of the vault administrator and accepted SAC asset. |
| `deposit(from, amount)` | `from` | Transfers a positive asset amount into the vault and mints the same number of shares. |
| `withdraw(to, shares)` | `to` | Burns positive shares and transfers the matching asset amount from the vault. |
| `asset()` | None | Returns the configured SAC token contract address. |
| `admin()` | None | Returns the administrator address. |
| `total_shares()` | None | Returns outstanding shares. |
| `share_balance(owner)` | None | Returns an investor's recorded share balance. |

## Repository layout

```text
Cargo.toml                         Rust workspace definition
contracts/
  solar-bond/
    Cargo.toml                      Soroban contract crate
    src/lib.rs                      Contract implementation
    src/test.rs                     Contract-level tests
src/, public/, templates/, static/  Preserved legacy web-product material
```

No existing folder was removed while repurposing the repository. New contract
work belongs under `contracts/`; do not add EVM artifacts, Solidity contracts,
ABIs, or EVM wallet integrations.

## Prerequisites

- Rust stable and Cargo.
- The `wasm32v1-none` target required by your installed Soroban CLI/SDK.
- [Soroban CLI](https://developers.stellar.org/docs/tools/developer-tools/soroban-cli)
  for contract build, deploy, and invocation workflows.

## Build and test

Run contract commands from the repository root:

```bash
cargo fmt --all --check
cargo test -p solar-bond
```

Build the Wasm artifact with the Soroban CLI after installing its target and
following the CLI's current setup instructions:

```bash
soroban contract build
```

The unit test deploys a Stellar Asset Contract in Soroban's in-memory test
environment, mints test tokens, deposits into SolarBond, and verifies share and
asset balances after a withdrawal.

## Deploying safely

1. Run the full test suite and format check.
2. Build the Wasm artifact with `soroban contract build`.
3. Deploy to a non-production Stellar network first.
4. Initialize exactly once with the intended administrator and SAC asset
   contract addresses.
5. Verify the deployed Wasm hash, contract ID, initialization transaction, and
   authorization behavior before accepting deposits.

Treat this code as a starting point, not audited financial infrastructure. Have
the final contract, deployment scripts, token configuration, and operational
access controls independently reviewed before mainnet use.

## Legacy frontend

The retained Next.js files can still be explored with their existing Node/Bun
tooling, but they are outside the contract release path. Their prior investment
dashboard copy and demo data must not be interpreted as a deployed protocol or
a production integration with this contract.

## License

SolarBond is licensed under the [Apache License 2.0](./LICENSE).
