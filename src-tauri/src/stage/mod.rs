use std::fs;

use log::error;
use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::GameManeger, general::{Error, ErrorVariant},
};

/// [tauri command]
/// Read json file and get `StageData`.
/// * `file_name` - A name of file which have stage data
/// * `game_maneger` - The game maneger
#[tauri::command]
pub fn read_stage(file_name: String, mut game_maneger: GameManeger) -> Result<(StageData, GameManeger), Error> {
    let path_name: String = format!("./resourse/stage/{}", file_name);
    let f: String = fs::read_to_string(path_name)
        .map_err(|e| {
            let e: Error = Error::from_error(
                ErrorVariant::IOError,
                "Failed to read stage data.",
                "ステージの読み込みに失敗しました。",
                e
            );
            error!("{}", e);
            e
        })?;
    let stage: StageData = serde_json::from_str(&f)
        .map_err(|e| {
            let e: Error = Error::from_error(
                ErrorVariant::FileError,
                "Failed to parse stage data.",
                "ステージの読み込みに失敗しました。",
                e
            );
            error!("{}", e);
            e
        })?;
    game_maneger.update_stage(&stage);
    Ok((stage, game_maneger))
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StageData {
    // snake_case alias for json
    #[serde(alias = "grid_map", alias = "_gridMap")]
    grid_map: GridMap,
    #[serde(alias = "_start")]
    start: GridPosition,
}

impl StageData {
    pub fn get_grid_map(&self) -> &GridMap {
        &self.grid_map
    }
}

pub type GridMap = Vec<Vec<Grid>>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Grid {
    #[serde(alias = "F", alias = "_floor")]
    Floor,
    #[serde(alias = "W", alias = "_wall")]
    Wall,
    #[serde(alias = "C", alias = "_crackedWall")]
    CrackedWall
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GridPosition {
    // snake_case alias for json
    #[serde(alias = "grid_x", alias = "_gridX")]
    grid_x: f64,
    // snake_case alias for json
    #[serde(alias = "grid_y", alias = "_gridY")]
    grid_y: f64
}
