use core::f64;

use serde::{Deserialize, Serialize};

use crate::{
    deserialize_struct, 
    serialize_struct_camel, 
    general::{Position, Size}, 
    stage::{Grid, StageData},
};

pub struct CollisionManeger {
    walls: Vec<HitBox>,
    stage_size: Size
}

impl CollisionManeger {
    const FIELDS: [&'static str; 2] = ["walls", "stage_size"];
}

serialize_struct_camel!(CollisionManeger, 2, walls, stage_size);
deserialize_struct!(
    CollisionManeger,
    CollisionManegerVisitor,
    walls, Vec<HitBox>, "walls" | "_walls",
    stage_size, Size, "stageSize" | "_stageSize"
);

impl CollisionManeger {
    pub fn new() -> Self {
        CollisionManeger { 
            walls: Vec::new(), 
            stage_size: Size { 
                height: 0, 
                width: 0 
            } 
        }
    }

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
        self.stage_size = Size { 
            height: HitBox::WALL_SIZE.height * stage.get_grid_map().len(), 
            width: HitBox::WALL_SIZE.width * stage.get_grid_map().get(0).map(|v| v.len()).unwrap_or_default()
        }
    }

    fn hit(a: &HitBox, b: &HitBox) -> HitDirection {
        let stack_right: f64 = min_f64(a.position.x + a.size.width as f64, b.position.x + b.size.width as f64);
        let stack_left: f64 = max_f64(a.position.x, b.position.x);
        let stack_down: f64 = min_f64(a.position.y + a.size.height as f64, b.position.y + b.size.height as f64);
        let stack_up: f64 = max_f64(a.position.y, b.position.y);
        let stack_width: f64 = stack_right - stack_left;
        let stack_height: f64 = stack_down - stack_up;
        if (stack_height > 0.0) && (stack_width > 0.0) {
            if stack_height >= stack_width {
                let a_center_x: f64 = a.position.x + (a.size.width as f64) / 2.0;
                let b_center_x: f64 = b.position.x + (b.size.width as f64) / 2.0;
                if a_center_x >= b_center_x {
                    HitDirection::Right
                } else {
                    HitDirection::Left
                }
            } else {
                let a_center_y: f64 = a.position.y + (a.size.height as f64) / 2.0;
                let b_center_y: f64 = b.position.y + (b.size.height as f64) / 2.0;
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
        if hit_box.position.x < 0.0 {
            return HitDirection::Right
        } else if hit_box.position.x + hit_box.size.width as f64 > self.stage_size.width as f64 {
            return HitDirection::Left
        } else if hit_box.position.y < 0.0 {
            return HitDirection::Down
        } else if hit_box.position.y + hit_box.size.height as f64 > self.stage_size.height as f64 {
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

#[derive(Debug)]
pub struct HitBox {
    position: Position,
    size: Size
}

serialize_struct_camel!(HitBox, 2, position, size);
deserialize_struct!(
    HitBox,
    HitBoxVisitor,
    position, Position, "position" | "_position",
    size, Size, "size" | "_size"
);

impl HitBox {
    const FIELDS: [&'static str; 2] = ["position", "size"];
    const WALL_SIZE: Size = Size {
        height: 32,
        width: 32
    };

    fn wall(grid_position: (usize, usize)) -> HitBox {
        HitBox {
            position: Position { 
                x: (Self::WALL_SIZE.width * grid_position.0) as f64, 
                y: (Self::WALL_SIZE.height * grid_position.1) as f64 
            },
            size: Self::WALL_SIZE
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

#[derive(Debug, Serialize, Deserialize)]
pub enum HitDirection {
    Right,
    Left,
    Up,
    Down,
    NoHit
}