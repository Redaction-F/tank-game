use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::{GameManeger, HitBox, Key, KeyState}, general::{Position, Size}, move_maneger::{Gear, MoveData, MoveManeger, MoveType, TurnDirection, bullet_maneger::BulletManeger}, stage::GridPosition 
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Player logic.
pub struct PlayerManeger {
    #[serde(alias="_moveData")]
    move_data: MoveData,
    #[serde(alias="_isDead")]
    is_dead: bool,
}

impl PlayerManeger {
    const MOVE_TYPE: MoveType = MoveType::Hit;
    const SPEED: f64 = 2.0;
    const WIDTH: usize = 32;
    const HEIGHT: usize = 24;

    pub fn size() -> Size {
        Size::new(PlayerManeger::WIDTH, PlayerManeger::HEIGHT)
    }

    pub fn new(start: GridPosition) -> PlayerManeger {
        let position: Position = <GridPosition as Into<Position>>::into(start) 
            - Position::new(PlayerManeger::WIDTH as f64 / 2.0, PlayerManeger::HEIGHT as f64 / 2.0);
        Self { 
            move_data: MoveData { 
                position, 
                angle: 0, 
                size: PlayerManeger::size(), 
                move_type: PlayerManeger::MOVE_TYPE, 
                speed: PlayerManeger::SPEED 
            },
            is_dead: false
        }
    }

    /// Read the controller and move player. This function should be called constantly.
    /// * `game_maneger` - the game maneger
    /// ## Return
    /// Whether player moved or not and shot `BulletManeger`(if exist).
    pub fn move_by_controller(&mut self, game_maneger: &mut GameManeger) -> (bool, Option<BulletManeger>) {
        let mut flag: bool = false;
        let mut bullet: Option<BulletManeger> = None;
        if let KeyState::JustPressing = game_maneger.controller_pressed(Key::Right) {
            self.turn(TurnDirection::Right);
            flag = true;
        }
        if let KeyState::JustPressing = game_maneger.controller_pressed(Key::Left) {
            self.turn(TurnDirection::Left);
            flag = true;
        }
        if let KeyState::JustPressing = game_maneger.controller_pressed(Key::Up) {
            self.move_naturally(Gear::Front, game_maneger);
            flag = true;
        }
        if let KeyState::JustPressing = game_maneger.controller_pressed(Key::Down) {
            self.move_naturally(Gear::Back, game_maneger);
            flag = true;
        }
        if let KeyState::JustPressing = game_maneger.controller_pressed(Key::Space) {
            bullet = Some(BulletManeger::shoot_maneger_bullet(self, 2.5));
            flag = true;
        }
        (flag, bullet)
    }

    pub fn get_hit_box(&self) -> HitBox {
        self.get_move_data().get_hit_box()
    }

    pub fn is_dead(&self) -> bool {
        self.is_dead
    }

    pub fn die(&mut self) {
        self.is_dead = true;
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