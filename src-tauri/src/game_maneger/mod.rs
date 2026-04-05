use crate::{
    deserialize_struct, 
    serialize_struct_camel, 
    game_maneger::{collision_maneger::CollisionManeger, controller::Controller}, 
    stage::StageData,
};

pub use controller::Key;
pub use collision_maneger::{HitBox, HitDirection};

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

pub struct GameManeger {
    controller: Controller,
    collision_maneger: CollisionManeger
}

impl GameManeger {
    const FIELDS: [&'static str; 2] = ["controller", "collision_maneger"];
}

serialize_struct_camel!(GameManeger, 2, controller, collision_maneger);
deserialize_struct!(
    GameManeger,
    GameManegerVisitor,
    controller, Controller, "controller" | "_controller",
    collision_maneger, CollisionManeger, "collisionManeger" | "_collisionManeger"
);

impl GameManeger {
    pub fn update_stage(&mut self, stage: &StageData) {
        self.collision_maneger.update_stage(stage);
    }

    pub fn collision_hit_wall(&self, hit_box: &HitBox) -> HitDirection {
        self.collision_maneger.hit_wall(hit_box)
    }

    pub fn controller_pressed(&self, key: Key) -> bool {
        self.controller.pressed(key)
    }
}