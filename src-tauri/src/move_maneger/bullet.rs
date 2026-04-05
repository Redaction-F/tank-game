use crate::{deserialize_struct, general::{Position, Size}, move_maneger::{BounceData, MoveData, MoveManeger, MoveType}, serialize_struct_camel};

pub struct Bullet {
    move_data: MoveData
}

serialize_struct_camel!(Bullet, 1, move_data);
deserialize_struct!(
    Bullet,
    BulletVisitor,
    move_data, MoveData, "moveData" | "_moveData"
);

impl Bullet {
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
}

impl MoveManeger for Bullet {
    fn get_move_data(&self) -> &MoveData {
        &self.move_data
    }

    fn get_move_data_mut(&mut self) -> &mut MoveData {
        &mut self.move_data
    }
}