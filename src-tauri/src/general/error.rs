use std::{error, fmt::Display};

use serde::{Deserialize, Serialize, de::Visitor};

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Error by this crate.
/// For more infomation about error message, see `ErrorMsg`
pub enum Error {
    #[serde(alias="_iOError")]
    IOError(ErrorMsg),
    #[serde(alias="_fileError")]
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
    pub fn from_msg(variant: ErrorVariant, for_developer: &str, for_user: &str) -> Self {
        Self::from_variant(variant, ErrorMsg { 
            for_developer: for_developer.to_string(), 
            for_user: for_user.to_string()
        })
    }

    /// Make `Error` from message and original error.
    pub fn from_error<E>(variant: ErrorVariant, for_developer: &str, for_user: &str, error: E) -> Self 
    where 
        E: error::Error
    {
        Self::from_variant(variant, ErrorMsg { 
            for_developer: format!("{}/original error: {}", for_developer, error), 
            for_user: for_user.to_string()
        })
    }
}

// for `error::Error`
impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", match self {
            Self::IOError(v) => format!("IOError({}/{})", v.for_developer, v.for_user),
            Self::FileError(v) => format!("FileError({}/{})", v.for_developer, v.for_user),
        })
    }
}

impl error::Error for Error {}

/// `Error` without message.
pub enum ErrorVariant {
    IOError,
    FileError
}

#[derive(Debug)]
pub struct ErrorMsg {
    for_developer: String,
    for_user: String
}

// string -> ErrorMsg
impl Serialize for ErrorMsg {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer {
        serializer.serialize_str(&self.for_user)
    }
}

// ErrorMsg -> string
// only message for user
impl<'de> Deserialize<'de> for ErrorMsg {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
            D: serde::Deserializer<'de> {
        deserializer.deserialize_str(ErrorMsgVisitor)
    }
}

struct ErrorMsgVisitor;

impl<'de> Visitor<'de> for ErrorMsgVisitor {
    type Value = ErrorMsg;
    
    fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "a string")
    }

    fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
        where
            E: serde::de::Error, {
        Ok(Self::Value {
            for_developer: String::default(),
            for_user: v
        })
    }
}