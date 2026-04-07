use crate::{deserialize_struct, game_maneger::GameManeger, general::{Position, Size}, move_maneger::{BounceData, Gear, MoveData, MoveManeger, MoveType}, serialize_struct_camel};

pub struct BulletManeger {
    move_data: MoveData
}

serialize_struct_camel!(BulletManeger, 1, move_data);
deserialize_struct!(
    BulletManeger,
    BulletVisitor,
    move_data, MoveData, "moveData" | "_moveData"
);

impl BulletManeger {
    const FIELDS: [&'static str; 1] = ["move_data"];

    pub fn new(position: Position, angle: usize) -> Self {
        Self { 
            move_data: MoveData { 
                position, 
                angle, 
                size: Size {
                    width: 8,
                    height: 8
                }, 
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