use log::{info, warn};
use serde::{Deserialize, Serialize};

use crate::{
    game_maneger::GameManeger, 
    general::Position, 
    move_maneger::{MoveData, MoveManeger, TurnDirection, player_maneger::PlayerManeger}
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct EnemyManeger {
    #[serde(alias = "_moveData")]
    move_data: MoveData,
    #[serde(alias = "_enemyType")]
    enemy_type: EnemyType
}

impl EnemyManeger {
    #[allow(unused_variables)]
    pub fn move_auto(&mut self, player_maneger: &PlayerManeger, game_maneger: &GameManeger) {
        match self.enemy_type {
            EnemyType::Orange(_) => {
                OrangeEnemyData::move_auto(self, player_maneger);
            },
            EnemyType::Dummy => ()
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

    fn move_auto(enemy_maneger: &mut EnemyManeger, player_maneger: &PlayerManeger) {
        let position: Position = enemy_maneger.get_move_data().get_position().clone();
        let angle: usize = enemy_maneger.get_move_data().get_angle();
        if let EnemyType::Orange(d) = &mut enemy_maneger.enemy_type {
            d.shoot_cooldown = d.shoot_cooldown.and_then(|v| v.checked_sub(1));
            if d.shoot_cooldown.is_none() 
                && player_maneger.get_move_data().get_position().exist_in_direction(
                    &position, 
                    angle
                ) {
                info!("shot!!");
                d.shoot_cooldown = Some(OrangeEnemyData::SHOOT_COOLDOWN);
            }

            d.turn_cooldown = d.turn_cooldown.and_then(|v| v.checked_sub(1));
            if d.turn_cooldown.is_none() {
                d.turn_cooldown = Some(OrangeEnemyData::TURN_COOLDOWN);
                enemy_maneger.turn(TurnDirection::Right);
            }
        } else {
            warn!("WARN: Wrong enemy function is called.");
        };
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub enum EnemyTypeVariable {
    #[serde(alias="_orange")]
    Orange
}