use serde::{Deserialize, Serialize};

use crate::{deserialize_struct, serialize_struct_camel};

pub struct Controller {
    right: KeyState,
    left: KeyState,
    down: KeyState,
    up: KeyState,
    space: KeyState,
}

impl Controller {
    const FIELDS: [&'static str; 5] = ["right", "left", "down", "up", "space"];
}

serialize_struct_camel!(Controller, 5, right, left, down, up, space);
deserialize_struct!(
    Controller,
    ControllerVisitor,
    right, KeyState, "right" | "_right",
    left, KeyState, "left" | "_left",
    down, KeyState, "down" | "_down",
    up, KeyState, "up" | "_up",
    space, KeyState, "space" | "_space",
);

impl Controller {
    pub fn check_key_down(&mut self, key: String) {
        match key.as_str() {
            "Right" | "ArrowRight" => {
                self.right = KeyState::Pressing;
            },
            "Left" | "ArrowLeft" => {
                self.left = KeyState::Pressing;
            },
            "Down" | "ArrowDown" => {
                self.down = KeyState::Pressing;
            },
            "Up" | "ArrowUp" => {
                self.up = KeyState::Pressing;
            },
            " " => {
                self.space = KeyState::Pressing;
            }
            _ => ()
        }
    }

    pub fn check_key_up(&mut self, key: String) {
        match key.as_str() {
            "Right" | "ArrowRight" => {
                self.right = KeyState::Waiting;
            },
            "Left" | "ArrowLeft" => {
                self.left = KeyState::Waiting;
            },
            "Down" | "ArrowDown" => {
                self.down = KeyState::Waiting;
            },
            "Up" | "ArrowUp" => {
                self.up = KeyState::Waiting;
            },
            " " => {
                self.space = KeyState::Waiting;
            }
            _ => ()
        }
    }

    pub fn pressed(&mut self, key: Key) -> KeyState {
        match key {
            Key::Right => self.right.clone(),
            Key::Left => self.left.clone(),
            Key::Down => self.down.clone(),
            Key::Up => self.up.clone(),
            Key::Space => match &self.space {
                KeyState::Pressing => {
                    self.space = KeyState::Pressed;
                    KeyState::Pressing
                },
                v => v.clone()
            },
        }
    }
}

pub enum Key {
    Right,
    Left,
    Down,
    Up,
    Space
}

#[derive(Clone, Serialize, Deserialize)]
pub enum KeyState {
    Pressing,
    Pressed,
    Waiting
}