use crate::{deserialize_struct, serialize_struct_camel};

pub struct Controller {
    right_pressed: bool,
    left_pressed: bool,
    down_pressed: bool,
    up_pressed: bool,
}

impl Controller {
    const FIELDS: [&'static str; 4] = ["right_pressed", "left_pressed", "down_pressed", "up_pressed"];
}

serialize_struct_camel!(Controller, 4, right_pressed, left_pressed, down_pressed, up_pressed);
deserialize_struct!(
    Controller,
    ControllerVisitor,
    right_pressed, bool, "rightPressed" | "_rightPressed",
    left_pressed, bool, "leftPressed" | "_leftPressed",
    down_pressed, bool, "downPressed" | "_downPressed",
    up_pressed, bool, "upPressed" | "_upPressed"
);

impl Controller {
    pub fn check_key_down(&mut self, key: String) {
        match key.as_str() {
            "Right" | "ArrowRight" => {
                self.right_pressed = true;
            },
            "Left" | "ArrowLeft" => {
                self.left_pressed = true;
            },
            "Down" | "ArrowDown" => {
                self.down_pressed = true;
            },
            "Up" | "ArrowUp" => {
                self.up_pressed = true;
            },
            _ => ()
        }
    }

    pub fn check_key_up(&mut self, key: String) {
        match key.as_str() {
            "Right" | "ArrowRight" => {
                self.right_pressed = false;
            },
            "Left" | "ArrowLeft" => {
                self.left_pressed = false;
            },
            "Down" | "ArrowDown" => {
                self.down_pressed = false;
            },
            "Up" | "ArrowUp" => {
                self.up_pressed = false;
            },
            _ => ()
        }
    }

    pub fn pressed(&self, key: Key) -> bool {
        match key {
            Key::Right => self.right_pressed,
            Key::Left => self.left_pressed,
            Key::Down => self.down_pressed,
            Key::Up => self.up_pressed,
        }
    }
}

pub enum Key {
    Right,
    Left,
    Down,
    Up,
}