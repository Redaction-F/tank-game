use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::{collision_maneger::CollisionManeger, controller::Controller}, 
    general::Position, 
    stage::StageData
};

pub use controller::{Key, KeyState};
pub use collision_maneger::{HitBox, HitDirection};

mod controller;
mod collision_maneger;

pub mod tauri_command {
    use crate::game_maneger::GameManeger;

    #[tauri::command]
    pub fn controller_update(mut game_maneger: GameManeger, keydown: Vec<String>, keyup: Vec<String>) -> GameManeger {
        game_maneger.controller.update(keydown, keyup);
        game_maneger
    }
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
    pub fn from_stage(stage: &StageData) -> Self {
        Self { 
            controller: Controller::new(), 
            collision_maneger: CollisionManeger::from_stage(stage) 
        }
    }

    pub fn collision_object_hit_wall(&self, hit_box: &HitBox) -> HitDirection {
        self.collision_maneger.object_hit_wall(hit_box)
    }

    pub fn collision_ray_hit_wall(&self, ray_start: &Position, ray_end: &Position) -> bool {
        self.collision_maneger.ray_hit_wall(ray_start, ray_end)
    }

    pub fn collision_object_hit_player(&self, hit_box: &HitBox) -> bool {
        self.collision_maneger.object_hit_player(hit_box)
    }

    pub fn collision_object_hit_enemys(&self, hit_box: &HitBox) -> Option<usize> {
        self.collision_maneger.object_hit_enemys(hit_box)
    }

    pub fn controller_pressed(&mut self, key: Key) -> KeyState {
        self.controller.pressed(key)
    }
}