extern crate std;

use soroban_sdk::{testutils::Address as _, token, Address, Env};

use crate::{SolarBond, SolarBondClient};

fn setup(
    env: &Env,
) -> (
    SolarBondClient<'_>,
    token::Client<'_>,
    Address,
    Address,
    Address,
) {
    let asset_admin = Address::generate(env);
    let asset = env.register_stellar_asset_contract(asset_admin.clone());
    let token = token::Client::new(env, &asset);
    let contract_id = env.register(SolarBond, ());
    let vault = SolarBondClient::new(env, &contract_id);
    vault.initialize(&asset_admin, &asset);
    (vault, token, asset_admin, asset, contract_id)
}

#[test]
fn deposit_mints_and_withdraw_burns_shares() {
    let env = Env::default();
    let (vault, token, asset_admin, asset, vault_address) = setup(&env);
    let investor = Address::generate(&env);
    let amount = 500_i128;

    token::StellarAssetClient::new(&env, &asset).mint(&investor, &amount);
    assert_eq!(vault.deposit(&investor, &amount), amount);
    assert_eq!(vault.share_balance(&investor), amount);
    assert_eq!(vault.total_shares(), amount);
    assert_eq!(token.balance(&vault_address), amount);

    assert_eq!(vault.withdraw(&investor, &200), 200);
    assert_eq!(vault.share_balance(&investor), 300);
    assert_eq!(vault.total_shares(), 300);
    assert_eq!(token.balance(&investor), 300);
    assert_eq!(vault.admin(), asset_admin);
}
