use std::{error, fmt::Display};

use serde::Serialize;

#[derive(Debug)]
/// Error by this crate.
/// For more infomation about error message, see `ErrorMsg`
pub enum Error {
    IOError(ErrorMsg),
    FileError(ErrorMsg)
}

impl Error {
    fn from_variant(variant: ErrorVariant, msg: ErrorMsg) -> Self {
        match variant {
            ErrorVariant::IOError => Self::IOError(msg),
            ErrorVariant::FileError => Self::FileError(msg),
        }
    }

    /// Make `Error` from message.
    /// * `variant` - a kind of error
    /// * `for_developers` - an error messsage for developers
    /// * `for_users` - an error messsage for users
    pub fn from_msg(variant: ErrorVariant, for_developers: &str, for_users: &str) -> Self {
        Self::from_variant(variant, ErrorMsg { 
            for_developers: for_developers.to_string(), 
            for_users: for_users.to_string()
        })
    }

    /// Make `Error` from message and original error.
    /// * `variant` - a kind of error
    /// * `for_developers` - an error messsage for developers
    /// * `for_users` - an error messsage for users
    /// * `error` - an original error
    pub fn from_error<E>(variant: ErrorVariant, for_developers: &str, for_users: &str, error: E) -> Self 
    where 
        E: error::Error
    {
        Self::from_variant(variant, ErrorMsg { 
            for_developers: format!("{}/original error: {}", for_developers, error), 
            for_users: for_users.to_string()
        })
    }

    fn to_user_string(&self) -> String {
        match self {
            Self::IOError(v) => format!("IOError({})", v.for_users),
            Self::FileError(v) => format!("FileError({})", v.for_users),
        }
    }
}

// for `error::Error`
impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", match self {
            Self::IOError(v) => format!("IOError({}/{})", v.for_developers, v.for_users),
            Self::FileError(v) => format!("FileError({}/{})", v.for_developers, v.for_users),
        })
    }
}

impl error::Error for Error {}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer {
        serializer.serialize_str(self.to_user_string().as_str())
    }
}

/// `Error` without message.
pub enum ErrorVariant {
    IOError,
    FileError
}

#[derive(Debug)]
pub struct ErrorMsg {
    for_developers: String,
    for_users: String
}
