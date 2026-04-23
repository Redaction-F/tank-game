use log::warn;
use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::{GameManeger, HitBox}, 
    general::{Position, Size}, 
    move_maneger::{MoveData, MoveManeger, MoveType, TurnDirection, bullet_maneger::BulletManeger, player_maneger::PlayerManeger}, stage::{EnemyData, GridPosition}
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct EnemyManeger {
    #[serde(alias = "_moveData")]
    move_data: MoveData,
    #[serde(alias = "_enemyType")]
    enemy_type: EnemyType, 
    #[serde(alias = "_isDead")]
    is_dead: bool, 
}

impl EnemyManeger {
    const MOVE_TYPE: MoveType = MoveType::Hit;
    const WIDTH: usize = 32;
    const HEIGHT: usize = 24;

    fn size() -> Size {
        Size::new(EnemyManeger::WIDTH, EnemyManeger::HEIGHT)
    }

    pub fn move_auto(&mut self, player_maneger: &PlayerManeger, game_maneger: &GameManeger) -> Option<BulletManeger> {
        match self.enemy_type {
            EnemyType::Orange(_) => {
                OrangeEnemyData::move_auto(self, player_maneger, game_maneger)
            },
            EnemyType::Dummy => None
        }
    }

    pub fn get_hit_box(&self) -> HitBox {
        self.get_move_data().get_hit_box()
    }

    pub fn id_dead(&self) -> bool {
        self.is_dead
    }

    pub fn die(&mut self) {
        self.is_dead = true;
    }
}

impl From<&EnemyData> for EnemyManeger {
    fn from(value: &EnemyData) -> Self {
        let position: Position = <GridPosition as Into<Position>>::into(value.get_start_grid().clone()) 
            - Position::new(EnemyManeger::WIDTH as f64 / 2.0, EnemyManeger::HEIGHT as f64 / 2.0);
        Self { 
            move_data: MoveData { 
                position, 
                angle: 0, 
                size: EnemyManeger::size(), 
                move_type: EnemyManeger::MOVE_TYPE, 
                speed: value.get_enemy_type().speed()
            }, 
            enemy_type: <EnemyTypeVariable as Into<EnemyType>>::into(value.get_enemy_type().clone()),
            is_dead: false
        }
    }
}

impl MoveManeger for EnemyManeger {
    fn get_move_data(&self) -> &MoveData {
        &self.move_data
    }
    fn get_move_data_mut(&mut self) -> &mut MoveData {
        &mut self.move_data
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
enum EnemyType {
    Orange(OrangeEnemyData),
    Dummy
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OrangeEnemyData {
    #[serde(alias = "_shootCooldown")]
    shoot_cooldown: Option<usize>,
    #[serde(alias = "_turnCooldown")]
    turn_cooldown: Option<usize>
}

impl OrangeEnemyData {
    const SHOOT_COOLDOWN: usize = 300;
    const TURN_COOLDOWN: usize = 3;

    fn move_auto(enemy_maneger: &mut EnemyManeger, player_maneger: &PlayerManeger, game_maneger: &GameManeger) -> Option<BulletManeger> {
        let position: Position = enemy_maneger.get_move_data().get_position().clone();
        let angle: usize = enemy_maneger.get_move_data().get_angle();
        let mut res: Option<BulletManeger> = None;
        let mut bullet_flag: bool = false;
        if let EnemyType::Orange(d) = &mut enemy_maneger.enemy_type {
            d.shoot_cooldown = d.shoot_cooldown.and_then(|v| v.checked_sub(1));
            if d.shoot_cooldown.is_none() 
                && player_maneger.get_move_data().get_position().exist_in_direction(&position, angle)
                && !game_maneger.collision_ray_hit_wall(&position, player_maneger.get_move_data().get_position()) {
                d.shoot_cooldown = Some(OrangeEnemyData::SHOOT_COOLDOWN);
                bullet_flag = true;
            }
            d.turn_cooldown = d.turn_cooldown.and_then(|v| v.checked_sub(1));
            if d.turn_cooldown.is_none() {
                d.turn_cooldown = Some(OrangeEnemyData::TURN_COOLDOWN);
                enemy_maneger.turn(TurnDirection::Right);
            }
            if bullet_flag {
                res = Some(BulletManeger::shoot_maneger_bullet(enemy_maneger, 2.0));
            }
        } else {
            warn!("WARN: Wrong enemy function is called.");
        };
        res
    }
}

#[derive(Clone)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub enum EnemyTypeVariable {
    #[serde(alias="_orange")]
    Orange
}

impl EnemyTypeVariable {
    fn speed(&self) -> f64 {
        match self {
            EnemyTypeVariable::Orange => 0.0,
            // EnemyTypeVariable::Dummy => 0.0
        }
    }
}

impl Into<EnemyType> for EnemyTypeVariable {
    fn into(self) -> EnemyType {
        match self {
            EnemyTypeVariable::Orange => EnemyType::Orange(OrangeEnemyData { 
                shoot_cooldown: None, 
                turn_cooldown: None 
            })
        }
    }
}