use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// Controller system. This manege user input.
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
    /// Check keydown and get datas of necessary key. This function must be run when a key is pressed.
    /// * `key` - a pressed key
    pub fn check_keydown(&mut self, key: String) {
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

    /// Check keyup and get datas of necessary key. This function must be run when a key is released.
    /// * `key` - a released key
    pub fn check_keyup(&mut self, key: String) {
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

    /// Get key state.
    pub fn pressed(&mut self, key: Key) -> KeyState {
        match key {
            Key::Right => self.right.clone(),
            Key::Left => self.left.clone(),
            Key::Down => self.down.clone(),
            Key::Up => self.up.clone(),
            // The information of pressing space key is returned once for a pressing.
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

/// The kind of watched key.
pub enum Key {
    Right,
    Left,
    Down,
    Up,
    Space
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
/// The state of key.
pub enum KeyState {
    /// Pressing now
    Pressing,
    /// Already pressed
    Pressed,
    /// Not pressing
    Waiting
}