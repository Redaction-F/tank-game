use serde::{Deserialize, Serialize};

use crate::{general::Position, move_manager::EnemyTypeVariable};

pub mod tauri_command {
    use std::fs;
    use log::error;

    use crate::{
        game_manager::GameManager, 
        general::{Error, ErrorVariant}, 
        stage::StageData
    };

    /// [[tauri command]]
    /// 
    /// Read json file and get `StageData`.
    /// * `file_name` - a name of file which have stage data
    /// * `game_manager` - the game manager
    /// ## Return
    /// Leaded `StageData` and updated `game_manager`. If failed, return `Err(Error)`.
    #[tauri::command]
    pub fn load_stage(file_name: String) -> Result<(StageData, GameManager), Error> {
        let path_name: String = format!("./resourse/stage/stage_{}.json", file_name);
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
        let game_manager: GameManager = GameManager::from_stage(&stage);
        Ok((stage, game_manager))
    }
}

/// A data of tank-game stage.
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StageData {
    #[serde(alias = "stage_id", alias = "_stageId")]
    stage_id: usize,
    // snake_case alias for json
    #[serde(alias = "grid_map", alias = "_gridMap")]
    grid_map: GridMap,
    #[serde(alias = "start_grid", alias = "_startGrid")]
    start_grid: GridPosition,
    #[serde(alias = "_enemys")]
    enemys: Vec<EnemyData>
}

impl StageData {
    pub fn get_grid_map(&self) -> &GridMap {
        &self.grid_map
    }
    pub fn start_grid(&self) -> &GridPosition {
        &self.start_grid
    }
    pub fn enemys(&self) -> &Vec<EnemyData> {
        &self.enemys
    }
}

pub type GridMap = Vec<Vec<Grid>>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
/// A grid of stage.
pub enum Grid {
    #[serde(alias = "F", alias = "_floor")]
    /// The tank can go through this gird.
    Floor,
    #[serde(alias = "W", alias = "_wall")]
    /// The tank can't go through this gird.
    Wall,
    #[serde(alias = "C", alias = "_crackedWall")]
    /// The tank can't go through this gird but can break.
    CrackedWall
}

#[derive(Clone)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
/// A stage position based grid.
pub struct GridPosition {
    // snake_case alias for json
    #[serde(alias = "grid_x", alias = "_gridX")]
    grid_x: f64,
    // snake_case alias for json
    #[serde(alias = "grid_y", alias = "_gridY")]
    grid_y: f64
}

impl Into<Position> for GridPosition {
    fn into(self) -> Position {
        Position::new(
            32.0 * self.grid_x, 
            32.0 * self.grid_y
        )
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct EnemyData {
    #[serde(alias="enemy_type", alias="_kind")]
    enemy_type: EnemyTypeVariable,
    #[serde(alias="start_grid", alias="_startGrid")]
    start_grid: GridPosition
}

impl EnemyData {
    pub fn get_enemy_type(&self) -> &EnemyTypeVariable {
        &self.enemy_type
    }

    pub fn get_start_grid(&self) -> &GridPosition {
        &self.start_grid
    }
}