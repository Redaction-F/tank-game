use crate::{
    deserialize_struct, game_maneger::{GameManeger, Key, KeyState}, general::{Position, Size}, move_maneger::{Gear, MoveData, MoveManeger, MoveType, TurnDirection, bullet_maneger::BulletManeger}, serialize_struct_camel 
};

pub struct PlayerManeger {
    move_data: MoveData
}

serialize_struct_camel!(PlayerManeger, 1, move_data);
deserialize_struct!(
    PlayerManeger,
    PlayerManegerVisitor,
    move_data, MoveData, "moveData" | "_moveData"
);

impl PlayerManeger {
    const FIELDS: [&'static str; 1] = ["move_data"];

    pub fn new() -> Self {
        Self { 
            move_data: MoveData { 
                position: Position {
                    x: 0.0,
                    y: 0.0
                }, 
                angle: 0, 
                size: Size { 
                    height: 32, 
                    width: 32 
                }, 
                move_type: MoveType::Hit, 
                speed: 2.0 
            } 
        }
    }

    pub fn move_by_controller(&mut self, game_maneger: &mut GameManeger) -> (Option<BulletManeger>, bool) {
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
            bullet = Some(BulletManeger::new(self.get_move_data().position.clone(), self.get_move_data().angle));
            flag = true;
        }
        (bullet, flag)
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