use serde::{Deserialize, Serialize};

use crate::{
    game_manager::GameManager, 
    general::{Position, Size}, 
    move_manager::{BounceData, Gear, MoveData, MoveManager, MoveType}
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Bullet logic. Player can shoot a bullet.
pub struct BulletManager {
    #[serde(alias="_moveData")]
    move_data: MoveData,
    #[serde(alias="_hitDooldown")]
    hit_cooldown: Option<usize>
}

impl BulletManager {
    const WIDTH: usize = 8;
    const HEIGHT: usize = 8;

    pub fn new(position: Position, angle: usize, speed: f64) -> Self {
        Self { 
            move_data: MoveData { 
                position, 
                angle, 
                size: Size::new(BulletManager::WIDTH, BulletManager::HEIGHT),
                move_type: MoveType::Bounce(BounceData::new(2)), 
                speed: speed
            },
            hit_cooldown: Some(20)
        } 
    }

    pub(super) fn shoot_manager_bullet<M>(move_manager: &M, speed: f64) -> Self 
    where 
        M: MoveManager
    {
        Self::new(
            Position::new(
                move_manager.get_move_data().get_position().get_x() 
                    + move_manager.get_move_data().get_size().get_width() as f64 / 2.0
                    + move_manager.get_move_data().get_size().get_width() as f64 * f64::cos(move_manager.get_move_data().get_angle_rad()) / 2.0
                    - BulletManager::WIDTH as f64 / 2.0, 
                move_manager.get_move_data().get_position().get_y() 
                    + move_manager.get_move_data().get_size().get_height() as f64 / 2.0
                    + move_manager.get_move_data().get_size().get_width() as f64 * f64::sin(move_manager.get_move_data().get_angle_rad()) / 2.0
                    - BulletManager::HEIGHT as f64 / 2.0, 
            ), 
            move_manager.get_move_data().get_angle(),
            speed
        )
    }

    fn hit_tank(&mut self, game_manager: &mut GameManager) {
        self.hit_cooldown = self.hit_cooldown.and_then(|v| v.checked_sub(1));
        if self.hit_cooldown.is_some() {
            return;
        }
        if game_manager.collision_object_hit_player(&self.get_move_data().get_hit_box()) {
            return game_manager.player_die();
        }
        if let Some(i) = game_manager.collision_object_hit_enemys(&self.get_move_data().get_hit_box()) {
            return game_manager.enemy_die(i);
        }
    }

    pub fn move_forward(&mut self, game_manager: &mut GameManager) -> bool {
        let disappear: bool = self.move_naturally(Gear::Front, game_manager);
        self.hit_tank(game_manager);
        disappear
    }
}

impl MoveManager for BulletManager {
    fn get_move_data(&self) -> &MoveData {
        &self.move_data
    }

    fn get_move_data_mut(&mut self) -> &mut MoveData {
        &mut self.move_data
    }

    // bullet doesn't bounce enemys
    fn hit_object_in_stage(&self, game_manager: &GameManager) -> crate::game_manager::HitDirection {
        game_manager.collision_object_hit_walls(&self.get_move_data().get_hit_box())
    }
}