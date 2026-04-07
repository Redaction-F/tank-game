use std::fs;

use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::GameManeger,
};

/// [tauri command]
/// Read json file and get `StageData`.
/// * `file_name` - A name of file which have stage data
/// * `game_maneger` - The game maneger
#[tauri::command]
pub fn read_stage(file_name: String, mut game_maneger: GameManeger) -> Result<(StageData, GameManeger), String> {
    let path_name: String = format!("./resourse/stage/{}", file_name);
    let f: String = fs::read_to_string(path_name)
        .map_err(|_| String::from("Failed to read stage data."))?;
    let stage: StageData = serde_json::from_str(&f)
        .map_err(|_| String::from("Failed to parse stage data."))?;
    game_maneger.update_stage(&stage);
    Ok((stage, game_maneger))
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StageData {
    #[serde(alias = "_gridMap")]
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
    #[serde(alias = "_gridX")]
    grid_x: f64,
    #[serde(alias = "_gridY")]
    grid_y: f64
}
