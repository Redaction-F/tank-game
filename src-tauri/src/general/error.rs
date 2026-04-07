use std::{error::Error as ErrorTrait, fmt::Display};

use serde::{Deserialize, Serialize};

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub enum Error {
    #[serde(alias="_iOError")]
    IOError(String)
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", match self {
            Self::IOError(v) => format!("IOError({})", v)
        })
    }
}

impl ErrorTrait for Error {}