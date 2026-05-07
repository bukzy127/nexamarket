use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Uint128;

#[cw_serde]
pub struct InstantiateMsg {
    /// Native Injective denom accepted for purchases. Defaults to "inj".
    pub denom: Option<String>,
}

#[cw_serde]
pub enum ExecuteMsg {
    /// Registers a Firebase-backed listing on-chain and grants uploader access.
    RegisterProject {
        project_id: String,
        price: Uint128,
        metadata_hash: Option<String>,
    },
    /// Purchases access. Funds must equal the listing price and go to owner.
    Purchase { project_id: String },
    /// Allows the owner to update future purchase price.
    UpdatePrice {
        project_id: String,
        price: Uint128,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(ProjectResponse)]
    Project { project_id: String },
    #[returns(AccessResponse)]
    HasAccess { project_id: String, wallet: String },
}

#[cw_serde]
pub struct ProjectResponse {
    pub project_id: String,
    pub owner: String,
    pub price: Uint128,
    pub metadata_hash: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

#[cw_serde]
pub struct AccessResponse {
    pub project_id: String,
    pub wallet: String,
    pub has_access: bool,
}
