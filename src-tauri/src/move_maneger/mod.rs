use std::f64::consts::PI;

use serde::{Deserialize, Serialize};

use crate::{
    deserialize_struct, 
    serialize_struct_camel, 
    game_maneger::{GameManeger, HitBox, HitDirection}, 
    general::{Position, Size}, 
    move_maneger::{bullet::Bullet, player_maneger::PlayerManeger}, 
};

mod player_maneger;
mod bullet;

#[tauri::command]
pub fn player_maneger_init() -> PlayerManeger {
    PlayerManeger::new()
}

#[tauri::command]
pub fn move_by_controller(mut player_maneger: PlayerManeger, game_maneger: GameManeger) -> (PlayerManeger, bool) {
    let res: bool = player_maneger.move_by_controller(&game_maneger);
    (player_maneger, res)
}

#[tauri::command]
pub fn bullet_create(position: Position, angle: usize) -> Bullet {
    Bullet::new(position, angle)
}

struct MoveData {
  // 位置
  position: Position,
  // 角度
  angle: usize,
  size: Size,
  move_type: MoveType,
  speed: f64,
}

impl MoveData {
    const FIELDS: [&'static str; 5] = ["position", "angle", "size", "move_type", "speed"];

    fn get_hit_box(&self) -> HitBox {
        HitBox::from((
            self.position.clone(),
            self.size.clone()
        ))
    }

    fn move_diff(&mut self, d: Position) {
        self.position.x += d.x;
        self.position.y += d.y;
    }

    fn turn(&mut self, a: usize) {
        self.angle += a;
        self.angle %= 360;
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
    speed, f64, "speed" | "_speed"
);

trait MoveManeger {
    fn get_move_data(&self) -> &MoveData;
    fn get_move_data_mut(&mut self) -> &mut MoveData;

    fn move_diff(&mut self, d: Position, game_maneger: &GameManeger) -> bool {
        let move_data: &mut MoveData = self.get_move_data_mut();
        let pre_position: Position = move_data.position.clone();
        move_data.move_diff(d);
        match (game_maneger.collision_hit_wall(&move_data.get_hit_box()), &mut move_data.move_type) {
            (HitDirection::NoHit, _) => (),
            (_, MoveType::Hit) => move_data.position = pre_position,
            (HitDirection::Right | HitDirection::Left, MoveType::Bounce(b)) => {
                if b.count >= b.max_count {
                    return true;
                } else {
                    move_data.position = pre_position;
                    move_data.angle = 360 - move_data.angle;
                    b.count += 1;
                }
            },
            (HitDirection::Down | HitDirection::Up, MoveType::Bounce(b)) => {
                if b.count >= b.max_count {
                    return true;
                } else {
                    move_data.position = pre_position;
                    move_data.angle = 540 - move_data.angle;
                    move_data.angle %= 360;
                    b.count += 1;
                }
            }
        }
        false
    }

    fn turn(&mut self, turn_direction: TurnDirection) {
        let move_data: &mut MoveData = self.get_move_data_mut();
        move_data.turn(match turn_direction {
            TurnDirection::Right => 3,
            TurnDirection::Left => 357
        });
    }

    fn move_naturally(&mut self, gear: Gear, game_maneger: &GameManeger) -> bool {
        let speed: f64 = self.get_move_data().speed;
        let d: Position = match gear {
            Gear::Front => {
                Position {
                    x: speed * f64::cos(self.get_move_data().get_angle_rad()), 
                    y: speed * f64::sin(self.get_move_data().get_angle_rad()),
                }
            }
            Gear::Back => {
                Position {
                    x: -1.0 * speed * f64::cos(self.get_move_data().get_angle_rad()), 
                    y: -1.0 * speed * f64::sin(self.get_move_data().get_angle_rad()),
                }
            }
        };
        self.move_diff(d, game_maneger)
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

    fn new(max_count: usize) -> Self {
        Self { 
            max_count, 
            count: 0 
        }
    }
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