import { Position } from "../../game_maneger/collision_maneger"

class BulletManeger {
  private _position: Position = {
    x: 0,
    y: 0
  };
  private _angle: number = 0;
  private _speed: number = 4;

  constructor(position: Position, angle: number) {
    this._position = position;
    this._angle = angle;
  }

  public moveRegularly() {
    
  }
}

export { BulletManeger }