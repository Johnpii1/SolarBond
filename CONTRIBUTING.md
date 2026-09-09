# Contributing to SolarBond

Thanks for contributing to SolarBond, a Rust/Soroban contract workspace for
token-backed solar-project bonds on Stellar. We value small, reviewable changes,
explicit authorization rules, reproducible tests, and documentation that does
not overstate what is deployed.

## Scope

The active product is the Rust contract in
[`contracts/solar-bond`](./contracts/solar-bond). This repository intentionally
retains its historical frontend, Python, static, and template folders. Do not
delete or reorganize those folders as part of the Soroban migration unless a
maintainer explicitly asks for it.

SolarBond is **not** an EVM project. Please do not add Solidity, Hardhat,
Foundry, EVM ABI, MetaMask, or EVM RPC dependencies. Contract changes should use
the Soroban SDK and Stellar Asset Contract interfaces.

## Local setup

Install Rust stable, Cargo, and the Soroban CLI. From the repository root:

```bash
git clone <your-fork-url>
cd SolarBond
cargo fmt --all --check
cargo test -p solar-bond
```

The first Cargo run downloads the Soroban SDK and its transitive dependencies.
If you plan to produce deployable Wasm, also install the target and configuration
required by the version of Soroban CLI you are using, then run:

```bash
soroban contract build
```

## Contract contribution workflow

1. Open an issue or discussion for changes that alter asset custody, share
   accounting, authorization, storage layout, or the public contract interface.
2. Create a focused branch and implement the smallest safe change.
3. Add or update tests in `contracts/solar-bond/src/test.rs`. Cover both the
   successful behavior and the rejected/unauthorized path where practical.
4. Run the checks below before opening a pull request.
5. Describe storage migrations, auth requirements, event changes, and deployment
   steps in the PR body. Never claim a deployment or audit that did not happen.

## Required checks

```bash
cargo fmt --all --check
cargo test -p solar-bond
```

For changes that produce Wasm, additionally run:

```bash
soroban contract build
```

The legacy Next.js app has its own `package.json` scripts. Run its Node/Bun
checks only when your change touches that retained frontend; it is not required
for an isolated Rust-contract patch.

## Soroban review checklist

- **Authentication:** Every state-changing path must call `require_auth()` on
  the appropriate principal. Do not substitute a caller-supplied address for an
  authenticated one.
- **Asset handling:** Use the configured Stellar Asset Contract only. Validate
  positive token and share amounts before changing storage or transferring
  assets.
- **State consistency:** Update balances and total supply together. Preserve
  invariants such as `total_shares >= 0` and never silently overwrite
  initialization.
- **Compatibility:** Treat contract methods, storage keys, and emitted events as
  public interfaces. Explain any migration or compatibility impact.
- **Testing:** Prefer deterministic Soroban test environments. Test deposits,
  withdrawals, initialization guards, invalid amounts, and authorization
  failures when modifying related behavior.
- **Security:** Do not commit private keys, seed phrases, RPC credentials, or
  production contract IDs. Report vulnerabilities under the process in
  [`SECURITY.md`](./SECURITY.md), not in a public issue.

## Documentation

Keep [`README.md`](./README.md) and this guide aligned with the implemented
contract. If a method, asset model, build requirement, or deployment step
changes, update the relevant documentation in the same pull request.

## Code of conduct

All contributors must follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
