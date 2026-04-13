use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::{GameManeger, HitBox, Key, KeyState}, 
    move_maneger::{Gear, MoveData, MoveManeger, TurnDirection, bullet_maneger::BulletManeger} 
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Player logic.
pub struct PlayerManeger {
    #[serde(alias="_moveData")]
    move_data: MoveData
}

impl PlayerManeger { 
    /// Read the controller and move player. This function should be called constantly.
    /// * `game_maneger` - the game maneger
    /// ## Return
    /// Whether player moved or not and shot `BulletManeger`(if exist).
    pub fn move_by_controller(&mut self, game_maneger: &mut GameManeger) -> (bool, Option<BulletManeger>) {
        let mut flag: bool = false;
        let mut bullet: Option<BulletManeger> = None;
        if let KeyState::Pressing = game_maneger.controller_pressed(Key::Right) {
            self.turn(TurnDirection::Right);
            flag = true;
        }
        if let KeyState::Pressing = game_maneger.controller_pressed(Key::Left) {
            self.turn(TurnDirection::Left);
            flag = true;
        }
        if let KeyState::Pressing = game_maneger.controller_pressed(Key::Up) {
            self.move_naturally(Gear::Front, game_maneger);
            flag = true;
        }
        if let KeyState::Pressing = game_maneger.controller_pressed(Key::Down) {
            self.move_naturally(Gear::Back, game_maneger);
            flag = true;
        }
        if let KeyState::Pressing = game_maneger.controller_pressed(Key::Space) {
            bullet = Some(BulletManeger::shoot_maneger_bullet(self, 2.5));
            flag = true;
        }
        (flag, bullet)
    }

    pub fn get_hit_box(&self) -> HitBox {
        self.get_move_data().get_hit_box()
    }
}

impl MoveManeger for PlayerManeger {
    fn get_move_data(&self) -> &MoveData {
        &self.move_data
    }

    fn get_move_data_mut(&mut self) -> &mut MoveData {
        &mut self.move_data
    }
}