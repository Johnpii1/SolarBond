#![no_std]

//! SolarBond is a minimal, token-backed bond vault for Stellar Soroban.
//!
//! Depositors transfer the configured Stellar Asset Contract token into this
//! contract and receive one vault share per deposited token unit. Shares can be
//! redeemed at the same rate while the vault has liquidity. Project yield and
//! oracle accounting intentionally live in separate contracts so the custody
//! rule here remains easy to audit.

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contract]
pub struct SolarBond;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Asset,
    TotalShares,
    Shares(Address),
}

#[contractimpl]
impl SolarBond {
    /// Configures the administrator and the SAC token accepted by this vault.
    /// This may only be called once.
    pub fn initialize(env: Env, admin: Address, asset: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Asset, &asset);
        env.storage().instance().set(&DataKey::TotalShares, &0_i128);
    }

    /// Deposits `amount` of the configured asset and mints the same number of
    /// internal shares to `from`. Returns the number of shares minted.
    pub fn deposit(env: Env, from: Address, amount: i128) -> i128 {
        from.require_auth();
        Self::require_positive(amount);

        let asset = Self::asset(env.clone());
        token::Client::new(&env, &asset).transfer(&from, &env.current_contract_address(), &amount);

        let shares = Self::share_balance(env.clone(), from.clone()) + amount;
        env.storage()
            .instance()
            .set(&DataKey::Shares(from), &shares);
        let total = Self::total_shares(env.clone()) + amount;
        env.storage().instance().set(&DataKey::TotalShares, &total);
        amount
    }

    /// Burns `shares` held by `to` and transfers the matching asset amount to
    /// that address. The token contract enforces that the vault is solvent.
    pub fn withdraw(env: Env, to: Address, shares: i128) -> i128 {
        to.require_auth();
        Self::require_positive(shares);

        let balance = Self::share_balance(env.clone(), to.clone());
        if shares > balance {
            panic!("insufficient shares");
        }

        env.storage()
            .instance()
            .set(&DataKey::Shares(to.clone()), &(balance - shares));
        let total = Self::total_shares(env.clone()) - shares;
        env.storage().instance().set(&DataKey::TotalShares, &total);

        let asset = Self::asset(env.clone());
        token::Client::new(&env, &asset).transfer(&env.current_contract_address(), &to, &shares);
        shares
    }

    /// Returns the configured Stellar Asset Contract address.
    pub fn asset(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Asset)
            .unwrap_or_else(|| panic!("not initialized"))
    }

    /// Returns the vault administrator address.
    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("not initialized"))
    }

    /// Returns the outstanding internal share supply.
    pub fn total_shares(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalShares)
            .unwrap_or_else(|| panic!("not initialized"))
    }

    /// Returns the number of vault shares owned by `owner`.
    pub fn share_balance(env: Env, owner: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Shares(owner))
            .unwrap_or(0_i128)
    }

    fn require_positive(amount: i128) {
        if amount <= 0 {
            panic!("amount must be positive");
        }
    }
}

#[cfg(test)]
mod test;
