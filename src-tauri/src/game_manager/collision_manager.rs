use core::f64;

use serde::{Deserialize, Serialize};

use crate::{
    general::{Position, Size}, 
    move_manager::{EnemyManager, PlayerManager}, 
    stage::{EnemyData, Grid, StageData}
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Collision system. The manege collision of objects.
pub(super) struct CollisionManager {
    #[serde(alias="_walls")]
    walls: Vec<HitBox>,
    #[serde(alias="_playerManager")]
    player_manager: PlayerManager,
    #[serde(alias="_enemyManagers")]
    enemy_managers: Vec<EnemyManager>,
    #[serde(alias="_stageSize")]
    stage_size: Size,
}

impl CollisionManager {
    pub(super) fn from_stage(stage: &StageData) -> CollisionManager {
        let mut walls = Vec::new();
        for (i, row) in stage.get_grid_map().iter().enumerate() {
            for (j, v) in row.iter().enumerate() {
                match v {
                    Grid::Wall | Grid::CrackedWall => {
                        walls.push(HitBox::wall((j, i)));
                    }, 
                    _ => ()
                }
            }
        }
        let player_manager: PlayerManager = PlayerManager::new(stage.start_grid().clone());
        let enemy_managers: Vec<EnemyManager> = stage
            .enemys()
            .iter()
            .map(|v| <EnemyManager as From<&EnemyData>>::from(v))
            .collect::<Vec<EnemyManager>>();
        let stage_size: Size = Size::new( 
            HitBox::WALL_WIDTH * stage.get_grid_map().get(0).map(|v| v.len()).unwrap_or_default(),
            HitBox::WALL_HEIGHT * stage.get_grid_map().len(), 
        );
        Self { 
            walls, 
            player_manager, 
            enemy_managers, 
            stage_size 
        }
    }

    /// Check which direction `a` hits `b` from.
    /// * `a` - a main target
    /// * `b` - a sub target
    fn hit(a: &HitBox, b: &HitBox) -> HitDirection {
        // stack of two hitboxes
        let stack_right: f64 = map_f64(
            a.position.get_x() + a.size.get_width() as f64, 
            b.position.get_x() + b.size.get_width() as f64,
            |x, y| if x > y { y } else { x },
        );
        let stack_left: f64 = map_f64(
            a.position.get_x(), 
            b.position.get_x(),
            |x, y| if x > y { x } else { y },
        );
        let stack_down: f64 = map_f64(
            a.position.get_y() + a.size.get_height() as f64, 
            b.position.get_y() + b.size.get_height() as f64,
            |x, y| if x > y { y } else { x },
        );
        let stack_up: f64 = map_f64(
            a.position.get_y(), 
            b.position.get_y(),
            |x, y| if x > y { x } else { y },
        );
        let stack_width: f64 = stack_right - stack_left;
        let stack_height: f64 = stack_down - stack_up;
        // hit or not
        if (stack_height > 0.0) && (stack_width > 0.0) {
            if stack_height >= stack_width {
                let a_center_x: f64 = a.position.get_x() + (a.size.get_width() as f64) / 2.0;
                let b_center_x: f64 = b.position.get_x() + (b.size.get_width() as f64) / 2.0;
                if a_center_x >= b_center_x {
                    HitDirection::Right
                } else {
                    HitDirection::Left
                }
            } else {
                let a_center_y: f64 = a.position.get_y() + (a.size.get_height() as f64) / 2.0;
                let b_center_y: f64 = b.position.get_y() + (b.size.get_height() as f64) / 2.0;
                if a_center_y >= b_center_y {
                    HitDirection::Down
                } else {
                    HitDirection::Up
                }
            }
        } else {
            HitDirection::NoHit
        }
    }

    /// Check which direction `hit_box` hits walls or enemys from.
    pub(super) fn object_hit_walls_or_enemys(&self, hit_box: &HitBox) -> HitDirection {
        // enemy
        let hit_enemy = self.enemy_managers
            .iter()
            .find_map(|v| match CollisionManager::hit(hit_box, &v.get_hit_box()) {
                HitDirection::NoHit => None,
                direction => {
                    Some(direction)
                }
            });
        if let Some(v) = hit_enemy {
            return v;
        }
        self.object_hit_walls(hit_box)
    }
    
    /// Check which direction `hit_box` hits walls from.
    pub(super) fn object_hit_walls(&self, hit_box: &HitBox) -> HitDirection {
        // walls in stage
        let hit_stage_wall = self.walls
            .iter()
            .find_map(|v| match CollisionManager::hit(hit_box, v) {
                HitDirection::NoHit => None,
                direction => {
                    Some(direction)
                }
            });
        if let Some(v) = hit_stage_wall {
            return v;
        }
        // around wall
        if hit_box.position.get_x() < 0.0 {
            return HitDirection::Right
        } else if hit_box.position.get_x() + hit_box.size.get_width() as f64 > self.stage_size.get_width() as f64 {
            return HitDirection::Left
        } else if hit_box.position.get_y() < 0.0 {
            return HitDirection::Down
        } else if hit_box.position.get_y() + hit_box.size.get_height() as f64 > self.stage_size.get_height() as f64 {
            return HitDirection::Up
        }
        HitDirection::NoHit
    }

    pub(super) fn ray_hit_walls(&self, ray_start: &Position, ray_end: &Position) -> bool {
        let (start_point, end_point) = if ray_start.get_x() < ray_end.get_x() {
            (ray_start, ray_end)
        } else {
            (ray_end, ray_start)
        };
        for v in self.walls.iter() {
            let points: Vec<Position> = vec![
                v.position.clone(),
                &v.position + &Position::new(v.size.get_width() as f64, 0.0),
                &v.position + &Position::new(v.size.get_width() as f64, v.size.get_height() as f64),
                &v.position + &Position::new(0.0, v.size.get_height() as f64),
            ];
            let each_point_witch_side: Vec<bool> = points
                .into_iter()
                .filter_map(|v| {
                    if (start_point.get_x() <= v.get_x()) && (v.get_x() <= end_point.get_x()) {
                        Some((end_point.get_x() - start_point.get_x()) * (v.get_y() - start_point.get_y()) > (end_point.get_y() - start_point.get_y()) * (v.get_x() - start_point.get_x()))
                    } else {
                        None
                    }
                })
                .collect::<Vec<bool>>();
            if each_point_witch_side.is_empty() {
                continue;
            }
            if each_point_witch_side
                .iter()
                .all(|&v| v == each_point_witch_side[0]) {
                continue;
            }
            return true;
        }
        false
    }

    pub(super) fn object_hit_player(&self, hit_box: &HitBox) -> bool {
        match CollisionManager::hit(hit_box, &self.player_manager.get_hit_box()) {
            HitDirection::NoHit => false,
            _ => true
        }
    }

    pub(super) fn object_hit_enemys(&self, hit_box: &HitBox) -> Option<usize> {
        self.enemy_managers
            .iter()
            .enumerate()
            .find_map(|(i, v)| {
                match CollisionManager::hit(hit_box, &v.get_hit_box()) {
                    HitDirection::NoHit => None,
                    _ => Some(i)
                }
            })
    }

    pub(super) fn player_die(&mut self) {
        self.player_manager.die();
    }

    pub(super) fn enemy_die(&mut self, index: usize) {
        if let Some(enemy) = self.enemy_managers.get_mut(index) {
            enemy.die();
        }
    }
}

fn map_f64<F>(a: f64, b: f64, f: F) -> f64 
where 
    F: Fn(f64, f64) -> f64
{
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else {
        f(a, b)
    }
}

#[derive(Debug, Clone)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Position and size of hit box.
pub struct HitBox {
    #[serde(alias="_position")]
    position: Position,
    #[serde(alias="_size")]
    size: Size
}

impl HitBox {
    const WALL_WIDTH: usize = 32;
    const WALL_HEIGHT: usize = 32;

    fn wall(grid_position: (usize, usize)) -> HitBox {
        HitBox {
            position: Position::new( 
                (Self::WALL_WIDTH * grid_position.0) as f64, 
                (Self::WALL_HEIGHT * grid_position.1) as f64 
            ),
            size: Size::new(Self::WALL_WIDTH, Self::WALL_HEIGHT)
        }
    }
}

impl From<(Position, Size)> for HitBox {
    fn from(value: (Position, Size)) -> Self {
        HitBox { 
            position: value.0, 
            size: value.1 
        }
    }
}

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Which direction a object hits another object from
pub enum HitDirection {
    Right,
    Left,
    Up,
    Down,
    NoHit
}