use std::f64::consts::PI;

use serde::{Deserialize, Serialize};

use crate::{
    game_manager::{GameManager, HitBox, HitDirection}, 
    general::{Position, Size}
};

mod player_manager;
mod bullet_manager;
mod enemy_manager;

pub use player_manager::PlayerManager;
pub use enemy_manager::{EnemyManager, EnemyTypeVariable};

pub mod tauri_command {
    use crate::{
        game_manager::GameManager, 
        move_manager::{bullet_manager::BulletManager, enemy_manager::EnemyManager, player_manager::PlayerManager}
    };

    /// [[tauri command]]
    /// Read the controller and move player. This function should be called constantly.
    /// * `player_manager` - the player manager
    /// * `game_manager` - the game manager
    /// ## Return
    /// Whether player moved or not, shot `BulletManager`(if exist), and updated `PlayerManager`
    #[tauri::command]
    pub fn player_move_by_controller(mut player_manager: PlayerManager, game_manager: GameManager) -> (bool, Option<BulletManager>, PlayerManager) {
        let res: (bool, Option<BulletManager>) = player_manager.move_by_controller(&game_manager);
        (res.0, res.1, player_manager)
    }

    /// [[tauri command]]
    /// Move enemy automatically. This function should be called constantly.
    /// * `enemy_manager` - the enemy manager
    /// * `game_manager` - the game manager
    /// ## Return
    /// Whether player moved or not, shot `BulletManager`(if exist), and updated `PlayerManager`
    #[tauri::command]
    pub fn enemy_move_auto(mut enemy_manager: EnemyManager, player_manager: PlayerManager, game_manager: GameManager) -> (Option<BulletManager>, EnemyManager) {
        let res = enemy_manager.move_auto(&player_manager, &game_manager);
        (res, enemy_manager)
    }

    /// [[tauri command]]
    /// Move bullet. This function should be called constantly.
    /// * `bullet_manager` - the bullet manager
    /// * `game_manager` - the game manager
    /// ## Return
    /// Whether bullet disappeared or not, updated `BulletManager` and updated `GameManager`.
    #[tauri::command]
    pub fn bullet_move_forward(mut bullet_manager: BulletManager, mut game_manager: GameManager) -> (bool, BulletManager, GameManager) {
        let res: bool = bullet_manager.move_forward(&mut game_manager);
        (res, bullet_manager, game_manager)
    }
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
    #[allow(dead_code)]
    fn get_move_type(&self) -> &MoveType {
        &self.move_type
    }
    fn get_move_type_mut(&mut self) -> &mut MoveType {
        &mut self.move_type
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

trait MoveManager {
    /// Get a imutable reference of `MoveData` of the object.
    fn get_move_data(&self) -> &MoveData;
    /// Get a mutablereference　of `MoveData` of the object.
    fn get_move_data_mut(&mut self) -> &mut MoveData;

    fn hit_object_in_stage(&self, game_manager: &GameManager) -> HitDirection {
        game_manager.collision_object_hit_walls_or_enemys(&self.get_move_data().get_hit_box())
    }

    fn move_diff(&mut self, d: Position, game_manager: &GameManager) -> bool {
        let pre_position: Position = self.get_move_data().get_position().clone();
        self.get_move_data_mut().move_diff(d);
        let hit: HitDirection = self.hit_object_in_stage(game_manager);
        let move_data: &mut MoveData = self.get_move_data_mut();
        match (hit, move_data.get_move_type_mut()) {
            (HitDirection::NoHit, _) => (),
            (_, MoveType::Hit) => *move_data.get_position_mut() = pre_position,
            (HitDirection::Right | HitDirection::Left, MoveType::Bounce(b)) => {
                if b.count >= b.max_count {
                    return true;
                } else {
                    b.count += 1;
                    *move_data.get_position_mut() = pre_position;
                    move_data.turn_map(|v| 540 - v);
                }
            },
            (HitDirection::Down | HitDirection::Up, MoveType::Bounce(b)) => {
                if b.count >= b.max_count {
                    return true;
                } else {
                    b.count += 1;
                    *move_data.get_position_mut() = pre_position;
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

    fn move_naturally(&mut self, gear: Gear, game_manager: &GameManager) -> bool {
        let speed: f64 = self.get_move_data().get_speed();
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
        self.move_diff(d, game_manager)
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