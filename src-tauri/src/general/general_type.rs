use serde::{Deserialize, Serialize};

/// 2D position.
/// The y axis points downward adn the x axis points to the right.
/// This has the `x` and `y` as `f64`.
#[derive(Clone, Debug)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Position {
    #[serde(alias="_x")]
    x: f64,
    #[serde(alias="_y")]
    y: f64
}

impl Position {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
    pub fn get_x(&self) -> f64 {
        self.x
    }
    pub fn get_x_mut(&mut self) -> &mut f64 {
        &mut self.x
    }
    pub fn get_y(&self) -> f64 {
        self.y
    }
    pub fn get_y_mut(&mut self) -> &mut f64 {
        &mut self.y
    }
}

/// 2D size.
/// This has the `width` and `height` as `usize`.
#[derive(Clone, Debug)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Size {
    #[serde(alias="_width")]
    width: usize,
    #[serde(alias="_height")]
    height: usize,
}

impl Size {
    pub fn new(width: usize, height: usize) -> Self {
        Self { width, height }
    }
    pub fn get_width(&self) -> usize {
        self.width
    }
    pub fn get_height(&self) -> usize {
        self.height
    }
}

mod test {
    #[test]
    fn test_position() {
        use crate::general::Position;
        
        let mut sample: Position = Position::new(2.0, 3.0);
        assert_eq!(sample.get_x(), 2.0);
        assert_eq!(sample.get_y(), 3.0);
        
        *sample.get_x_mut() = 4.0;
        *sample.get_y_mut() = 5.0;
        assert_eq!(sample.get_x(), 4.0);
        assert_eq!(sample.get_y(), 5.0);
    }

    #[test]
    fn test_size() {
        use crate::general::Size;
        
        let sample: Size = Size::new(5, 10);
        assert_eq!(sample.get_width(), 5);
        assert_eq!(sample.get_height(), 10);
    }
}