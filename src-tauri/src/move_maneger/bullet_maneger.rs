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
    move_data: MoveData
}

impl BulletManeger {
    pub fn new(position: Position, angle: usize) -> Self {
        Self { 
            move_data: MoveData { 
                position, 
                angle, 
                size: Size::new(8, 8),
                move_type: MoveType::Bounce(BounceData::new(1)), 
                speed: 1.0 
            } 
        } 
    }

    pub fn move_forward(&mut self, game_maneger: &GameManeger) -> bool {
        self.move_naturally(Gear::Front, game_maneger)
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