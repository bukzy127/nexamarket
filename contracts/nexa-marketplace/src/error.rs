use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("project already exists")]
    ProjectExists,

    #[error("project not found")]
    ProjectNotFound,

    #[error("unauthorized")]
    Unauthorized,

    #[error("incorrect payment amount")]
    IncorrectPayment,

    #[error("missing required native funds")]
    MissingFunds,
}
