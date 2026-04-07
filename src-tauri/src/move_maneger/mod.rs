use std::f64::consts::PI;

use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::{GameManeger, HitBox, HitDirection}, 
    general::{Position, Size}, 
    move_maneger::{bullet_maneger::BulletManeger, player_maneger::PlayerManeger}, 
};

mod player_maneger;
mod bullet_maneger;

#[tauri::command]
pub fn player_maneger_init() -> PlayerManeger {
    PlayerManeger::new()
}

#[tauri::command]
pub fn player_move_by_controller(mut player_maneger: PlayerManeger, mut game_maneger: GameManeger) -> (PlayerManeger, GameManeger, Option<BulletManeger>, bool) {
    let res: (Option<BulletManeger>, bool) = player_maneger.move_by_controller(&mut game_maneger);
    (player_maneger, game_maneger, res.0, res.1)
}

#[tauri::command]
pub fn bullet_move_forward(mut bullet_maneger: BulletManeger, game_maneger: GameManeger) -> (BulletManeger, bool) {
    let res: bool = bullet_maneger.move_forward(&game_maneger);
    (bullet_maneger, res)
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
struct MoveData {
    // 位置
    #[serde(alias="_position")]
    position: Position,
    // 角度
    #[serde(alias="_angle")]
    angle: usize,
    #[serde(alias="_size")]
    size: Size,
    #[serde(alias="_moveType")]
    move_type: MoveType,
    #[serde(alias="_speed")]
    speed: f64,
}

impl MoveData {
    fn get_hit_box(&self) -> HitBox {
        HitBox::from((
            self.position.clone(),
            self.size.clone()
        ))
    }

    fn move_diff(&mut self, d: Position) {
        *self.position.get_x_mut() += d.get_x();
        *self.position.get_y_mut() += d.get_y();
    }

    fn turn(&mut self, a: usize) {
        self.angle += a;
        self.angle %= 360;
    }

    fn turn_map<F>(&mut self, f: F) 
    where 
        F: Fn(usize) -> usize
    {
        self.angle = f(self.angle);
        self.angle %= 360;
    }

    fn get_angle_rad(&self) -> f64 {
        (self.angle as f64) / 180.0 * PI
    }
}

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
                    b.count += 1;
                    move_data.position = pre_position;
                    move_data.turn_map(|v| 360 - v);
                }
            },
            (HitDirection::Down | HitDirection::Up, MoveType::Bounce(b)) => {
                if b.count >= b.max_count {
                    return true;
                } else {
                    b.count += 1;
                    move_data.position = pre_position;
                    move_data.turn_map(|v| 540 - v);
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
                Position::new(
                    speed * f64::cos(self.get_move_data().get_angle_rad()), 
                    speed * f64::sin(self.get_move_data().get_angle_rad()),
                )
            }
            Gear::Back => {
                Position::new(
                    -1.0 * speed * f64::cos(self.get_move_data().get_angle_rad()), 
                    -1.0 * speed * f64::sin(self.get_move_data().get_angle_rad()),
                )
            }
        };
        self.move_diff(d, game_maneger)
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
enum MoveType {
  Hit,
  Bounce(BounceData)
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
struct BounceData {
    #[serde(alias="_maxCount")]
    max_count: usize,
    #[serde(alias="_count")]
    count: usize
}

impl BounceData {
    fn new(max_count: usize) -> Self {
        Self { 
            max_count, 
            count: 0 
        }
    }
}

enum TurnDirection {
    Right,
    Left,
}

enum Gear {
    Front,
    Back,
}