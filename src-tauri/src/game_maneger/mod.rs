use crate::{
    game_maneger::{collision_maneger::CollisionManeger, controller::Controller},
    stage::StageData,
};

pub use controller::{Key, KeyState};
pub use collision_maneger::{HitBox, HitDirection};
use serde::{Deserialize, Serialize};

mod controller;
mod collision_maneger;

#[tauri::command]
pub fn check_key_down(mut controller: Controller, key: String) -> Controller {
    controller.check_key_down(key);
    controller
}

#[tauri::command]
pub fn check_key_up(mut controller: Controller, key: String) -> Controller {
    controller.check_key_up(key);
    controller
}

#[tauri::command]
pub fn hit_wall(game_maneger: GameManeger, hit_box: HitBox) -> HitDirection {
    game_maneger.collision_maneger.hit_wall(&hit_box)
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
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