use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::GameManeger, 
    general::{Position, Size}, 
    move_maneger::{BounceData, Gear, MoveData, MoveManeger, MoveType}
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Bullet logic. Player can shoot a bullet.
pub struct BulletManeger {
    #[serde(alias="_moveData")]
    move_data: MoveData,
    #[serde(alias="_hitDooldown")]
    hit_cooldown: Option<usize>
}

impl BulletManeger {
    const WIDTH: usize = 8;
    const HEIGHT: usize = 8;

    pub fn new(position: Position, angle: usize, speed: f64) -> Self {
        Self { 
            move_data: MoveData { 
                position, 
                angle, 
                size: Size::new(BulletManeger::WIDTH, BulletManeger::HEIGHT),
                move_type: MoveType::Bounce(BounceData::new(2)), 
                speed: speed
            },
            hit_cooldown: Some(20)
        } 
    }

    pub(super) fn shoot_maneger_bullet<M>(move_maneger: &M, speed: f64) -> Self 
    where 
        M: MoveManeger
    {
        Self::new(
            Position::new(
                move_maneger.get_move_data().get_position().get_x() 
                    + move_maneger.get_move_data().get_size().get_width() as f64 / 2.0
                    + move_maneger.get_move_data().get_size().get_width() as f64 * f64::cos(move_maneger.get_move_data().get_angle_rad()) / 2.0
                    - BulletManeger::WIDTH as f64 / 2.0, 
                move_maneger.get_move_data().get_position().get_y() 
                    + move_maneger.get_move_data().get_size().get_height() as f64 / 2.0
                    + move_maneger.get_move_data().get_size().get_width() as f64 * f64::sin(move_maneger.get_move_data().get_angle_rad()) / 2.0
                    - BulletManeger::HEIGHT as f64 / 2.0, 
            ), 
            move_maneger.get_move_data().get_angle(),
            speed
        )
    }

    fn hit_tank(&mut self, game_maneger: &GameManeger) -> HitTank {
        self.hit_cooldown = self.hit_cooldown.and_then(|v| v.checked_sub(1));
        if self.hit_cooldown.is_some() {
            return HitTank::NoHit;
        }
        if game_maneger.collision_object_hit_player(&self.get_move_data().get_hit_box()) {
            return HitTank::Player;
        }
        if let Some(i) = game_maneger.collision_object_hit_enemys(&self.get_move_data().get_hit_box()) {
            return HitTank::Enemy(i);
        }
        HitTank::NoHit
    }

    pub fn move_forward(&mut self, game_maneger: &GameManeger) -> (bool, HitTank) {
        let disappear: bool = self.move_naturally(Gear::Front, game_maneger);
        let hit: HitTank = self.hit_tank(game_maneger);
        (disappear, hit)
    }
}

impl MoveManeger for BulletManeger {
    fn get_move_data(&self) -> &MoveData {
        &self.move_data
    }

    fn get_move_data_mut(&mut self) -> &mut MoveData {
        &mut self.move_data
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub enum HitTank {
    Player,
    Enemy(usize),
    NoHit
}