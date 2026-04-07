use core::f64;

use serde::{Deserialize, Serialize};

use crate::{
    general::{Position, Size}, 
    stage::{Grid, StageData}
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct CollisionManeger {
    #[serde(alias="_walls")]
    walls: Vec<HitBox>,
    #[serde(alias="_stageSize")]
    stage_size: Size
}

impl CollisionManeger {
    pub fn update_stage(&mut self, stage: &StageData) {
        self.walls = Vec::new();
        stage
            .get_grid_map()
            .iter()
            .enumerate()
            .map(|(i, row)| 
                row
                    .iter()
                    .enumerate()
                    .filter_map(move |(j, v)| match v {
                        Grid::Wall | Grid::CrackedWall => Some((j, i)),
                        _ => None
                    }))
            .flatten()
            .for_each(|grid_position| self.walls.push(HitBox::wall(grid_position)));
        self.stage_size = Size::new( 
            HitBox::WALL_WIDTH * stage.get_grid_map().get(0).map(|v| v.len()).unwrap_or_default(),
            HitBox::WALL_HEIGHT * stage.get_grid_map().len(), 
        );
    }

    fn hit(a: &HitBox, b: &HitBox) -> HitDirection {
        let stack_right: f64 = min_f64(a.position.get_x() + a.size.get_width() as f64, b.position.get_x() + b.size.get_width() as f64);
        let stack_left: f64 = max_f64(a.position.get_x(), b.position.get_x());
        let stack_down: f64 = min_f64(a.position.get_y() + a.size.get_height() as f64, b.position.get_y() + b.size.get_height() as f64);
        let stack_up: f64 = max_f64(a.position.get_y(), b.position.get_y());
        let stack_width: f64 = stack_right - stack_left;
        let stack_height: f64 = stack_down - stack_up;
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

    pub fn hit_wall(&self, hit_box: &HitBox) -> HitDirection {
        let hit_stage_wall = self.walls
            .iter()
            .find_map(|v| match CollisionManeger::hit(hit_box, v) {
                HitDirection::NoHit => None,
                direction => {
                    Some(direction)
                }
            });
        if let Some(v) = hit_stage_wall {
            return v;
        }
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
}

fn max_f64(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else if a > b {
        a
    } else {
        b
    }
}

fn min_f64(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else if a > b {
        b
    } else {
        a
    }
}

#[derive(Debug, Clone)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
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
pub enum HitDirection {
    Right,
    Left,
    Up,
    Down,
    NoHit
}