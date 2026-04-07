use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Controller {
    #[serde(alias="_right")]
    right: KeyState,
    #[serde(alias="_left")]
    left: KeyState,
    #[serde(alias="_down")]
    down: KeyState,
    #[serde(alias="_up")]
    up: KeyState,
    #[serde(alias="_space")]
    space: KeyState,
}

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
#[serde(rename_all="camelCase")]
pub enum KeyState {
    Pressing,
    Pressed,
    Waiting
}