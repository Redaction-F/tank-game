use std::f64::consts::PI;

use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::{GameManeger, HitBox, HitDirection}, 
    general::{Position, Size}, 
    move_maneger::{bullet_maneger::BulletManeger, player_maneger::PlayerManeger}, 
};

mod player_maneger;
mod bullet_maneger;

/// [[tauri command]]
/// Read the controller and move player. This function should be called constantly.
/// * `player_maneger` - the player maneger
/// * `game_maneger` - the game maneger
/// ## Return
/// Whether player moved or not, shot `BulletManeger`(if exist), updated `PlayerManeger`, and updated `GameManeger`.
#[tauri::command]
pub fn player_move_by_controller(mut player_maneger: PlayerManeger, mut game_maneger: GameManeger) -> (bool, Option<BulletManeger>, PlayerManeger, GameManeger) {
    let res: (bool, Option<BulletManeger>) = player_maneger.move_by_controller(&mut game_maneger);
    (res.0, res.1, player_maneger, game_maneger)
}

/// [[tauri command]]
/// Move bullet. This function should be called constantly.
/// * `bullet_maneger` - the bullet maneger
/// * `game_maneger` - the game maneger
/// ## Return
/// Whether bullet disappeared or not, updated `BulletManeger`.
#[tauri::command]
pub fn bullet_move_forward(mut bullet_maneger: BulletManeger, game_maneger: GameManeger) -> (bool, BulletManeger) {
    let res: bool = bullet_maneger.move_forward(&game_maneger);
    (res, bullet_maneger)
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// A set of data required when a object move.
struct MoveData {
    #[serde(alias="_position")]
    /// Position of the object
    position: Position,
    #[serde(alias="_angle")]
    /// Angle of the object
    angle: usize,
    #[serde(alias="_size")]
    /// Size of the object
    size: Size,
    #[serde(alias="_moveType")]
    /// How to move the object when it hit to a wall
    move_type: MoveType,
    #[serde(alias="_speed")]
    /// Speed of the object
    speed: f64,
}

impl MoveData {
    fn get_position(&self) -> &Position {
        &self.position
    }
    fn get_position_mut(&mut self) -> &mut Position {
        &mut self.position
    }
    fn get_angle(&self) -> usize {
        self.angle
    }
    fn get_angle_mut(&mut self) -> &mut usize {
        &mut self.angle
    }
    fn get_size(&self) -> &Size {
        &self.size
    }
    fn get_move_type(&self) -> &MoveType {
        &self.move_type
    }
    fn get_speed(&self) -> f64 {
        self.speed
    }

    fn get_hit_box(&self) -> HitBox {
        HitBox::from((
            self.get_position().clone(),
            self.size.clone()
        ))
    }

    fn get_angle_rad(&self) -> f64 {
        (self.get_angle() as f64) / 180.0 * PI
    }

    fn move_diff(&mut self, d: Position) {
        *self.get_position_mut().get_x_mut() += d.get_x();
        *self.get_position_mut().get_y_mut() += d.get_y();
    }

    fn turn(&mut self, a: usize) {
        *self.get_angle_mut() += a;
        *self.get_angle_mut() %= 360;
    }

    fn turn_map<F>(&mut self, f: F) 
    where 
        F: Fn(usize) -> usize
    {
        let angle: usize = self.get_angle();
        *self.get_angle_mut() = f(angle);
        *self.get_angle_mut() %= 360;
    }
}

trait MoveManeger {
    /// Get a imutable reference of `MoveData` of the object.
    fn get_move_data(&self) -> &MoveData;
    /// Get a mutablereference　of `MoveData` of the object.
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
                    move_data.turn_map(|v| 540 - v);
                }
            },
            (HitDirection::Down | HitDirection::Up, MoveType::Bounce(b)) => {
                if b.count >= b.max_count {
                    return true;
                } else {
                    b.count += 1;
                    move_data.position = pre_position;
                    move_data.turn_map(|v| 360 - v);
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
/// How to move the object when it hit to a wall.
enum MoveType {
    /// Stop there
    Hit,
    /// Bounce off a wall
    Bounce(BounceData)
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// A set of data required by `MoveType::Bounce`.
struct BounceData {
    #[serde(alias="_maxCount")]
    /// Maximum number of times the object bounces off a wall
    max_count: usize,
    #[serde(alias="_count")]
    /// A number of times the object bounced off a wall
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

/// whtch direction the object moves naturay
enum Gear {
    Front,
    Back,
}