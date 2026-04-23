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
    pub fn new() -> Self {
        Self { 
            right: KeyState::Waiting, 
            left: KeyState::Waiting, 
            down: KeyState::Waiting, 
            up: KeyState::Waiting, 
            space: KeyState::Waiting 
        }
    }

    pub fn update(&mut self, keydown: Vec<String>, keyup: Vec<String>) {
        if let KeyState::JustPressing = self.space {
            self.space = KeyState::Pressing;
        }
        keydown.into_iter().for_each(|key| {
            self.check_keydown(key);
        });
        keyup.into_iter().for_each(|key| {
            self.check_keyup(key);
        });
    }

    /// Check keydown and get datas of necessary key. This function should be called when a key is pressed.
    /// * `key` - a pressed key
    fn check_keydown(&mut self, key: String) {
        match key.as_str() {
            "Right" | "ArrowRight" => {
                self.right = KeyState::JustPressing;
            },
            "Left" | "ArrowLeft" => {
                self.left = KeyState::JustPressing;
            },
            "Down" | "ArrowDown" => {
                self.down = KeyState::JustPressing;
            },
            "Up" | "ArrowUp" => {
                self.up = KeyState::JustPressing;
            },
            " " => {
                self.space = KeyState::JustPressing;
            }
            _ => ()
        }
    }

    /// Check keyup and get datas of necessary key. This function should be called when a key is released.
    /// * `key` - a released key
    fn check_keyup(&mut self, key: String) {
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
    /// * `key` - a key wanted to get
    // TODO: remove mutable
    pub fn pressed(&mut self, key: Key) -> KeyState {
        match key {
            Key::Right => self.right.clone(),
            Key::Left => self.left.clone(),
            Key::Down => self.down.clone(),
            Key::Up => self.up.clone(),
            // The information of pressing space key is returned once for a pressing.
            Key::Space => match &self.space {
                KeyState::JustPressing => {
                    self.space = KeyState::Pressing;
                    KeyState::JustPressing
                },
                v => v.clone()
            },
        }
    }
}

/// The kind of key.
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
    JustPressing,
    /// Already pressed
    Pressing,
    /// Not pressing
    Waiting
}