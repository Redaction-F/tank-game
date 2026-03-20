use std::fs;

use log::error;
use serde::{Deserialize, Serialize, de::{self, Visitor}};

#[tauri::command]
pub fn read_stage(filename: &str) -> Result<Stage, String> {
    let f: String = fs::read_to_string(format!("./resourse/stage/{}", filename))
        .map_err(|_| String::from("Failed to read stage data."))?;
    let map: StageJson = serde_json::from_str(&f)
        .map_err(|_| String::from("Failed to read stage data."))?;
    Ok(map.stage)
}

pub type Stage = [[Grid; 24]; 16];

pub enum Grid {
    Floor,
    Wall,
    CrackedWall
}

impl Grid {
    fn to_string_snakecase(&self) -> String {
        String::from(
            match self {
                Grid::Floor => "floor",
                Grid::Wall => "wall",
                Grid::CrackedWall => "cracked_wall",
            }
        )
    }

    fn from_char(c: char) -> Result<Self, String> {
        match c {
            'F' => Ok(Grid::Floor),
            'W' => Ok(Grid::Wall),
            'C' => Ok(Grid::CrackedWall), 
            _ => Err(String::from("Failed to parse grid."))
        }
    }
}

impl Serialize for Grid {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer {
        serializer.serialize_str(&self.to_string_snakecase())
    }
}

struct StageJson {
    stage: Stage
}

impl StageJson {
    const FIELDS: [&'static str; 1] = ["map"];
}

impl<'de> Deserialize<'de> for StageJson {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
            D: de::Deserializer<'de> {
        deserializer.deserialize_struct(
            "StageJson",
            &StageJson::FIELDS,
            StageJsonVisitor,
        )
    }
}

struct StageJsonVisitor;

impl<'de> Visitor<'de> for StageJsonVisitor {
    type Value = StageJson;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "fields: {}", Self::Value::FIELDS.join(", "))
    }

    fn visit_map<A>(self, map: A) -> Result<Self::Value, A::Error>
    where
        A: de::MapAccess<'de>,
    {
        let mut map: A = map;
        let mut stage: Option<Stage> = None;
        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "map" => {
                    if stage.is_some() {
                        let e = de::Error::duplicate_field(stringify!($field));
                        error!("{:?}", e);
                        return Err(e);
                    }
                    let stage_char: [[char; 24]; 16] = map.next_value::<[[char; 24]; 16]>()?;
                    stage = Some(
                        array_try_map(
                            stage_char, 
                            |row| array_try_map(row, Grid::from_char)
                        )
                            .map_err(|e| {
                                error!("{}", e);
                                de::Error::custom(e)
                            })?
                    )
                }
                v => {
                    let e = ::serde::de::Error::unknown_field(v, &Self::Value::FIELDS);
                    error!("{:?}", e);
                    return Err(e);
                }
            }
        }

        Ok(StageJson { 
            stage: stage.ok_or_else(|| {
                let e = ::serde::de::Error::missing_field("stage");
                error!("{:?}", e);
                e
            })?
        })
    }
}

fn array_try_map<T, U, E, const N: usize, F>(value: [T; N], f: F) -> Result<[U; N], E> 
    where 
        F: Fn(T) -> Result<U, E>
{
    let mut result: [Option<U>; N] = [0; N].map(|_| None);
    let mut mapped_array = value.into_iter().map(|v| f(v));
    for i in 0..N {
        result[i] = Some(mapped_array.next().unwrap()?);
    }
    Ok(result.map(|v| v.unwrap()))
}