use std::fs;

use serde::{Deserialize, Serialize, de::{self, Visitor}};

use crate::{
    deserialize_struct, 
    serialize_struct_camel,
    game_maneger::GameManeger, 
};

#[tauri::command]
pub fn read_stage(file_name: String, mut game_maneger: GameManeger) -> Result<(StageData, GameManeger), String> {
    let f: String = fs::read_to_string(format!("./resourse/stage/{}", file_name))
        .map_err(|_| String::from("Failed to read stage data."))?;
    let stage: StageData = serde_json::from_str(&f)
        .map_err(|_| String::from("Failed to parse stage data."))?;
    game_maneger.update_stage(&stage);
    Ok((stage, game_maneger))
}

pub struct StageData {
    grid_map: GridMap,
    start: GridPosition,
}

impl StageData {
    const FIELDS: [&'static str; 2] = ["grid_map", "start"];

    pub fn get_grid_map(&self) -> &GridMap {
        &self.grid_map
    }
}

serialize_struct_camel!(StageData, 2, grid_map, start);
deserialize_struct!(
    StageData,
    StageDataVisitor,
    grid_map, GridMap, "grid_map" | "gridMap" | "_gridMap",
    start, GridPosition, "start" | "_start"
);

pub type GridMap = Vec<Vec<Grid>>;

pub enum Grid {
    Floor,
    Wall,
    CrackedWall
}

impl Grid {
    const VARIANTS: [&'static str; 3] = ["Floor", "Wall", "CrackedWall"];

    fn to_string_frontend(&self) -> String {
        String::from(
            match self {
                Grid::Floor => "floor",
                Grid::Wall => "wall",
                Grid::CrackedWall => "crackedWall",
            }
        )
    }
}

impl TryFrom<&String> for Grid {
    type Error = String;

    fn try_from(value: &String) -> Result<Self, Self::Error> {
        match value.as_str() {
            "F" | "floor" => Ok(Grid::Floor),
            "W" | "wall" => Ok(Grid::Wall),
            "C" | "crackedWall" => Ok(Grid::CrackedWall),
            _ => Err(String::from("Unkown variant"))
        }
    }
}

// struct to json(frontend)
impl Serialize for Grid {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer {
        serializer.serialize_str(&self.to_string_frontend())
    }
}

// json(frontend, json file) to struct
impl<'de> Deserialize<'de> for Grid {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
            D: de::Deserializer<'de> {
        deserializer.deserialize_enum(
            "Grid", 
            &Grid::VARIANTS, 
            GridVisitor
        )
    }
}

struct GridVisitor;

impl<'de> Visitor<'de> for GridVisitor {
    type Value = Grid;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "fields: {}", Self::Value::VARIANTS.join(", "))
    }

    fn visit_enum<A>(self, data: A) -> Result<Self::Value, A::Error>
        where
            A: de::EnumAccess<'de>, {
        // Stringで取得したバリアント
        let variant = data.variant::<String>()?.0;
        // TryFron<String>で変換
        Grid::try_from(&variant)
            .map_err(|_| de::Error::unknown_variant(&variant.to_string(), &Self::Value::VARIANTS))
    }
}

struct GridPosition {
    grid_x: f64,
    grid_y: f64
}

impl GridPosition {
    const FIELDS: [&'static str; 2] = ["grid_x", "grid_y"];
}

serialize_struct_camel!(GridPosition, 2, grid_x, grid_y);
deserialize_struct!(
    GridPosition,
    GridPositionVisitor,
    grid_x, f64, "grid_x" | "gridX" | "_gridX",
    grid_y, f64, "grid_y" | "gridY" | "_gridY"
);