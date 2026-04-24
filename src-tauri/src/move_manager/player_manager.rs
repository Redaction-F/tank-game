use serde::{Deserialize, Serialize};

use crate::{
    game_manager::{GameManager, HitBox, Key, KeyState}, general::{Position, Size}, move_manager::{Gear, MoveData, MoveManager, MoveType, TurnDirection, bullet_manager::BulletManager}, stage::GridPosition 
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Player logic.
pub struct PlayerManager {
    #[serde(alias="_moveData")]
    move_data: MoveData,
    #[serde(alias="_isDead")]
    is_dead: bool,
}

impl PlayerManager {
    const MOVE_TYPE: MoveType = MoveType::Hit;
    const SPEED: f64 = 2.0;
    const WIDTH: usize = 32;
    const HEIGHT: usize = 24;

    pub(super) fn size() -> Size {
        Size::new(PlayerManager::WIDTH, PlayerManager::HEIGHT)
    }

    pub fn new(start: GridPosition) -> PlayerManager {
        let position: Position = <GridPosition as Into<Position>>::into(start) 
            - Position::new(PlayerManager::WIDTH as f64 / 2.0, PlayerManager::HEIGHT as f64 / 2.0);
        Self { 
            move_data: MoveData { 
                position, 
                angle: 0, 
                size: PlayerManager::size(), 
                move_type: PlayerManager::MOVE_TYPE, 
                speed: PlayerManager::SPEED 
            },
            is_dead: false
        }
    }

    /// Read the controller and move player. This function should be called constantly.
    /// * `game_manager` - the game manager
    /// ## Return
    /// Whether player moved or not and shot `BulletManager`(if exist).
    pub(super) fn move_by_controller(&mut self, game_manager: &GameManager) -> (bool, Option<BulletManager>) {
        let mut flag: bool = false;
        let mut bullet: Option<BulletManager> = None;
        if let KeyState::Pressing = game_manager.controller_key_state(Key::Right) {
            self.turn(TurnDirection::Right);
            flag = true;
        }
        if let KeyState::Pressing = game_manager.controller_key_state(Key::Left) {
            self.turn(TurnDirection::Left);
            flag = true;
        }
        if let KeyState::Pressing = game_manager.controller_key_state(Key::Up) {
            self.move_naturally(Gear::Front, game_manager);
            flag = true;
        }
        if let KeyState::Pressing = game_manager.controller_key_state(Key::Down) {
            self.move_naturally(Gear::Back, game_manager);
            flag = true;
        }
        if let KeyState::JustPressing = game_manager.controller_key_state(Key::Space) {
            bullet = Some(BulletManager::shoot_manager_bullet(self, 2.5));
            flag = true;
        }
        (flag, bullet)
    }

    pub fn get_hit_box(&self) -> HitBox {
        self.get_move_data().get_hit_box()
    }

    pub fn die(&mut self) {
        self.is_dead = true;
    }
}

impl MoveManager for PlayerManager {
    fn get_move_data(&self) -> &MoveData {
        &self.move_data
    }

    fn get_move_data_mut(&mut self) -> &mut MoveData {
        &mut self.move_data
    }
}