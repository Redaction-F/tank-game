use crate::{
    deserialize_struct, 
    serialize_struct_camel,
    game_maneger::{GameManeger, Key}, 
    move_maneger::{Gear, MoveData, MoveManeger, TurnDirection}, 
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

    pub fn move_by_controller(&mut self, game_maneger: &GameManeger) -> bool {
        let mut flag: bool = false;
        if game_maneger.controller_pressed(Key::Right) {
            self.turn(TurnDirection::Right);
            flag = true;
        }
        if game_maneger.controller_pressed(Key::Left) {
            self.turn(TurnDirection::Left);
            flag = true;
        }
        if game_maneger.controller_pressed(Key::Up) {
            self.move_naturally(Gear::Front, game_maneger);
            flag = true;
        }
        if game_maneger.controller_pressed(Key::Down) {
            self.move_naturally(Gear::Back, game_maneger);
            flag = true;
        }
        flag
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