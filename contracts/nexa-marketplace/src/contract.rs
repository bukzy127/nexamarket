use cosmwasm_std::{
    entry_point, to_json_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult, Uint128,
};

use crate::error::ContractError;
use crate::msg::{AccessResponse, ExecuteMsg, InstantiateMsg, ProjectResponse, QueryMsg};
use crate::state::{Config, Project, ACCESS, CONFIG, PROJECTS};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let denom = msg.denom.unwrap_or_else(|| "inj".to_string());
    CONFIG.save(deps.storage, &Config { denom: denom.clone() })?;
    Ok(Response::new()
        .add_attribute("action", "instantiate")
        .add_attribute("denom", denom))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::RegisterProject {
            project_id,
            price,
            metadata_hash,
        } => execute_register_project(deps, env, info, project_id, price, metadata_hash),
        ExecuteMsg::Purchase { project_id } => execute_purchase(deps, info, project_id),
        ExecuteMsg::UpdatePrice { project_id, price } => {
            execute_update_price(deps, env, info, project_id, price)
        }
    }
}

fn execute_register_project(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    project_id: String,
    price: Uint128,
    metadata_hash: Option<String>,
) -> Result<Response, ContractError> {
    if PROJECTS.has(deps.storage, &project_id) {
        return Err(ContractError::ProjectExists);
    }

    let project = Project {
        project_id: project_id.clone(),
        owner: info.sender.clone(),
        price,
        metadata_hash,
        created_at: env.block.time.seconds(),
        updated_at: env.block.time.seconds(),
    };

    PROJECTS.save(deps.storage, &project_id, &project)?;
    ACCESS.save(deps.storage, (&project_id, &info.sender), &true)?;

    Ok(Response::new()
        .add_attribute("action", "register_project")
        .add_attribute("project_id", project_id)
        .add_attribute("owner", info.sender)
        .add_attribute("price", price))
}

fn execute_purchase(
    deps: DepsMut,
    info: MessageInfo,
    project_id: String,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    let project = PROJECTS
        .may_load(deps.storage, &project_id)?
        .ok_or(ContractError::ProjectNotFound)?;

    assert_exact_payment(&info.funds, &config.denom, project.price)?;

    ACCESS.save(deps.storage, (&project_id, &info.sender), &true)?;

    let transfer = BankMsg::Send {
        to_address: project.owner.to_string(),
        amount: vec![Coin {
            denom: config.denom,
            amount: project.price,
        }],
    };

    Ok(Response::new()
        .add_message(transfer)
        .add_attribute("action", "purchase")
        .add_attribute("project_id", project_id)
        .add_attribute("buyer", info.sender)
        .add_attribute("seller", project.owner)
        .add_attribute("price", project.price))
}

fn execute_update_price(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    project_id: String,
    price: Uint128,
) -> Result<Response, ContractError> {
    PROJECTS.update(deps.storage, &project_id, |maybe| {
        let mut project = maybe.ok_or(ContractError::ProjectNotFound)?;
        if project.owner != info.sender {
            return Err(ContractError::Unauthorized);
        }
        project.price = price;
        project.updated_at = env.block.time.seconds();
        Ok(project)
    })?;

    Ok(Response::new()
        .add_attribute("action", "update_price")
        .add_attribute("project_id", project_id)
        .add_attribute("price", price))
}

fn assert_exact_payment(
    funds: &[Coin],
    denom: &str,
    expected: Uint128,
) -> Result<(), ContractError> {
    let paid = funds
        .iter()
        .find(|coin| coin.denom == denom)
        .map(|coin| coin.amount)
        .ok_or(ContractError::MissingFunds)?;

    if paid != expected {
        return Err(ContractError::IncorrectPayment);
    }

    Ok(())
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Project { project_id } => to_json_binary(&query_project(deps, project_id)?),
        QueryMsg::HasAccess { project_id, wallet } => {
            to_json_binary(&query_has_access(deps, project_id, wallet)?)
        }
    }
}

fn query_project(deps: Deps, project_id: String) -> StdResult<ProjectResponse> {
    let project = PROJECTS.load(deps.storage, &project_id)?;
    Ok(ProjectResponse {
        project_id: project.project_id,
        owner: project.owner.to_string(),
        price: project.price,
        metadata_hash: project.metadata_hash,
        created_at: project.created_at,
        updated_at: project.updated_at,
    })
}

fn query_has_access(
    deps: Deps,
    project_id: String,
    wallet: String,
) -> StdResult<AccessResponse> {
    let wallet_addr = deps.api.addr_validate(&wallet)?;
    let has_access = ACCESS
        .may_load(deps.storage, (&project_id, &wallet_addr))?
        .unwrap_or(false);

    Ok(AccessResponse {
        project_id,
        wallet,
        has_access,
    })
}
