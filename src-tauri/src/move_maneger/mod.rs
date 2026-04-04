use std::f64::consts::PI;

use serde::{Deserialize, Serialize};

use crate::{
    deserialize_struct, 
    serialize_struct_camel,
    game_maneger::{GameManeger, HitBox, HitDirection}, 
    general::{Position, Size}, 
    move_maneger::player_maneger::PlayerManeger, 
};

mod player_maneger;

#[tauri::command]
pub fn move_by_controller(mut player_maneger: PlayerManeger, game_maneger: GameManeger) -> (PlayerManeger, bool) {
    let res: bool = player_maneger.move_by_controller(&game_maneger);
    (player_maneger, res)
}

struct MoveData {
  // 位置
  position: Position,
  // 角度
  angle: usize,
  size: Size,
  move_type: MoveType,
  speed: usize
}

impl MoveData {
    const FIELDS: [&'static str; 5] = ["position", "angle", "size", "move_type", "speed"];

    fn get_hit_box(&self) -> HitBox {
        HitBox::from((
            self.position.clone(),
            self.size.clone()
        ))
    }

    fn get_angle_rad(&self) -> f64 {
        (self.angle as f64) / 180.0 * PI
    }
}

serialize_struct_camel!(MoveData, 5, position, angle, size, move_type, speed);
deserialize_struct!(
    MoveData,
    MoveDataVisitor,
    position, Position, "position" | "_position",
    angle, usize, "angle" | "_angle",
    size, Size, "size" | "_size",
    move_type, MoveType, "moveType" | "_moveType",
    speed, usize, "speed" | "_speed"
);

trait MoveManeger {
    fn get_move_data(&self) -> &MoveData;
    fn get_move_data_mut(&mut self) -> &mut MoveData;

    fn move_diff(&mut self, d: Position, game_maneger: &GameManeger) {
        let move_data: &mut MoveData = self.get_move_data_mut();
        let pre_position: Position = move_data.position.clone();
        move_data.position.x += d.x;
        move_data.position.y += d.y;
        if let HitDirection::NoHit = game_maneger.collision_hit_wall(&self.get_move_data().get_hit_box()) {
            return;
        }
        self.get_move_data_mut().position = pre_position;
    }

    fn turn(&mut self, turn_direction: TurnDirection) {
        let move_data: &mut MoveData = self.get_move_data_mut();
        move_data.angle += match turn_direction {
            TurnDirection::Right => 3,
            TurnDirection::Left => 357
        };
        move_data.angle %= 360;
    }

    fn move_naturally(&mut self, gear: Gear, game_maneger: &GameManeger) {
        let speed: usize = self.get_move_data().speed;
        let d: Position = match gear {
            Gear::Front => {
                Position {
                    x: (speed as f64) * f64::cos(self.get_move_data().get_angle_rad()), 
                    y: (speed as f64) * f64::sin(self.get_move_data().get_angle_rad()),
                }
            }
            Gear::Back => {
                Position {
                    x: -1.0 * (speed as f64) * f64::cos(self.get_move_data().get_angle_rad()), 
                    y: -1.0 * (speed as f64) * f64::sin(self.get_move_data().get_angle_rad()),
                }
            }
        };
        self.move_diff(d, game_maneger);
    }
}

#[derive(Serialize, Deserialize)]
enum MoveType {
  Hit,
  Bounce(BounceData)
}

struct BounceData {
    max_count: usize,
    count: usize
}

impl BounceData {
    const FIELDS: [&'static str; 2] = ["max_count", "count"];
}

serialize_struct_camel!(BounceData, 2, max_count, count);
deserialize_struct!(
    BounceData,
    BounceDataVisitor,
    max_count, usize, "maxCount" | "_maxCount",
    count, usize, "count" | "_count"
);

enum TurnDirection {
    Right,
    Left,
}

enum Gear {
    Front,
    Back,
}