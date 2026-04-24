use serde::{Deserialize, Serialize};

use crate::{
    game_manager::{collision_manager::CollisionManager, controller::Controller}, 
    general::Position, 
    stage::StageData
};

pub use controller::{Key, KeyState};
pub use collision_manager::{HitBox, HitDirection};

mod controller;
mod collision_manager;

pub mod tauri_command {
    use crate::game_manager::GameManager;

    /// [[tauri command]]
    /// Read keys which are pressed or released and update controller. This function should be called constantly.
    /// * `game_manager` - the game manager
    /// * `keydown` - keys which are pressed
    /// * `keydown` - keys which are released
    /// ## Return
    /// Updated `GameManager`
    #[tauri::command]
    pub fn controller_update(mut game_manager: GameManager, keydown: Vec<String>, keyup: Vec<String>) -> GameManager {
        game_manager.controller.update(keydown, keyup);
        game_manager
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Tank-game logic. This has controller system and collision system.
pub struct GameManager {
    #[serde(alias="_controller")]
    controller: Controller,
    #[serde(alias="_collisionManager")]
    collision_manager: CollisionManager
}

impl GameManager {
    /// Initialize `GameManager` from `StageData`.
    /// * `stage` - a `StageData`
    pub fn from_stage(stage: &StageData) -> Self {
        Self { 
            controller: Controller::new(), 
            collision_manager: CollisionManager::from_stage(stage) 
        }
    }

    /// Check whether a object hits walls or not.
    /// * `hit_box` - a `HitBox` of the object witch you want to check
    /// ## Return
    /// A direction witch a object hits walls from
    pub fn collision_object_hit_walls(&self, hit_box: &HitBox) -> HitDirection {
        self.collision_manager.object_hit_walls(hit_box)
    }
    
    /// Check whether a object hits walls or enemys or not.
    /// * `hit_box` - a `HitBox` of the object witch you want to check
    /// ## Return
    /// A direction witch a object hits walls or enemys from
    pub fn collision_object_hit_walls_or_enemys(&self, hit_box: &HitBox) -> HitDirection {
        self.collision_manager.object_hit_walls_or_enemys(hit_box)
    }

    /// Check whether a ray hits walls or not.
    /// * `ray_start` - a start `Position` of the ray
    /// * `ray_end` - a end `Position` of the ray
    pub fn collision_ray_hit_walls(&self, ray_start: &Position, ray_end: &Position) -> bool {
        self.collision_manager.ray_hit_walls(ray_start, ray_end)
    }

    /// Check whether a object hits the player.
    /// * `hit_box` - a `HitBox` of the object witch you want to check
    pub fn collision_object_hit_player(&self, hit_box: &HitBox) -> bool {
        self.collision_manager.object_hit_player(hit_box)
    }

    /// Check whether a object hits enemys.
    /// * `hit_box` - a `HitBox` of the object witch you want to check
    /// ## Return
    /// If the object hits a enemy, the enemy index in `Some`. If not, `None`
    pub fn collision_object_hit_enemys(&self, hit_box: &HitBox) -> Option<usize> {
        self.collision_manager.object_hit_enemys(hit_box)
    }

    pub fn player_die(&mut self) {
        self.collision_manager.player_die();
    }

    pub fn enemy_die(&mut self, index: usize) {
        self.collision_manager.enemy_die(index);
    }

    /// Get a key state.
    pub fn controller_key_state(&self, key: Key) -> KeyState {
        self.controller.key_state(key)
    }
}