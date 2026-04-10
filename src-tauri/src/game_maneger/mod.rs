use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::{collision_maneger::CollisionManeger, controller::Controller},
    stage::StageData,
};

pub use controller::{Key, KeyState};
pub use collision_maneger::{HitBox, HitDirection};

mod controller;
mod collision_maneger;

/// [[tauri command]]
/// 
/// Check keydown and get datas of necessary key. This function must be run when a key is pressed.
/// * `controller` - the controller
/// * `key` - a pressed key
#[tauri::command]
pub fn check_keydown(mut controller: Controller, key: String) -> Controller {
    controller.check_keydown(key);
    controller
}

/// [[tauri command]]
/// 
/// Check keyup and get datas of necessary key. This function must be run when a key is released.
/// * `controller` - the controller
/// * `key` - a released key
#[tauri::command]
pub fn check_keyup(mut controller: Controller, key: String) -> Controller {
    controller.check_keyup(key);
    controller
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Tank-game logic. This has controller system and collision system.
pub struct GameManeger {
    #[serde(alias="_controller")]
    controller: Controller,
    #[serde(alias="_collisionManeger")]
    collision_maneger: CollisionManeger
}

impl GameManeger {
    pub fn update_stage(&mut self, stage: &StageData) {
        self.collision_maneger.update_stage(stage);
    }

    pub fn collision_hit_wall(&self, hit_box: &HitBox) -> HitDirection {
        self.collision_maneger.hit_wall(hit_box)
    }

    pub fn controller_pressed(&mut self, key: Key) -> KeyState {
        self.controller.pressed(key)
    }
}