use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Config {
    pub denom: String,
}

#[cw_serde]
pub struct Project {
    pub project_id: String,
    pub owner: Addr,
    pub price: Uint128,
    /// Optional hash of the off-chain metadata document. The Firebase URL is
    /// deliberately not stored on-chain.
    pub metadata_hash: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const PROJECTS: Map<&str, Project> = Map::new("projects");
pub const ACCESS: Map<(&str, &Addr), bool> = Map::new("access");
