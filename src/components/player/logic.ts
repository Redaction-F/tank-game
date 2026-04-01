import { GameManeger } from "../../logic";
import { CollisionManeger, type HitBox } from "../collision_maneger";

// 上下左右の方向
type Direction = "U" | "D" | "L" | "R";
// 方向反転
function revDirection(direction: Direction) {
  if (direction === "U") {
    return "D";
  } else if (direction === "D") {
    return "U";
  } else if (direction === "L") {
    return "R";
  } else {
    return "L";
  }
}

type Handle = "L" | "R";

class PlayerLogic {
  private _x: number = 0;
  private _y: number = 0;
  private _angle: number = 0;
  private _speed: number = 2;
  // 角度に応じた動く方向
  private _moveAngle: Direction[] = ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R"];
  private _moveAngleIndex: number = 0;
  
  move(direction: Direction, collisionManeger: CollisionManeger) {
    const prePosition = {
      x: this._x, 
      y: this._y
    };
    if (direction === "U") {
      this._y -= this._speed;
    } else if (direction === "D") {
      this._y += this._speed;
    } else if (direction === "L") {
      this._x -= this._speed;
    } else {
      this._x += this._speed;
    }
    if (collisionManeger.isHitWall(this.getHitBox())) {
      console.log(`Check:\n\tHit WALL!!!!!!`)
      this._x = prePosition.x;
      this._y = prePosition.y;
    }
  }

  handle(handle: Handle) {
    if (handle === "L") {
      this._angle += 3;
    } else {
      this._angle += 357;
    }
    this._angle %= 360;
    // 角度によって動く方向を決定
    const [moreDirection, lessDirection, miniAngle]: [Direction, Direction, number] = 
      this._angle < 45
      ? ["R", "U", this._angle]
      : this._angle < 90
      ? ["U", "R", 90 - this._angle]
      : this._angle < 135
      ? ["U", "L", 135 - this._angle]
      : this._angle < 180
      ? ["L", "U", 180 - this._angle]
      : this._angle < 225
      ? ["L", "D", 225 - this._angle]
      : this._angle < 270
      ? ["D", "L", 270 - this._angle]
      : this._angle < 315
      ? ["D", "R", 315 - this._angle]
      : ["R", "D", 360 - this._angle];
    const moreDirectionFullCount = 10;
    const lessDirectionFullCount = Math.ceil(Math.tan(miniAngle * Math.PI / 180) * 10);
    let moreDirectionCount = 0;
    let lessDirectionCount = 0;
    this._moveAngle = [];
    for (let i = 0; i < moreDirectionFullCount + lessDirectionFullCount; i++) {
      if ((moreDirectionCount / moreDirectionFullCount) <= (lessDirectionCount / lessDirectionFullCount) || lessDirectionCount === lessDirectionFullCount) {
        moreDirectionCount += 1;
        this._moveAngle.push(moreDirection);
      } else {
        lessDirectionCount += 1;
        this._moveAngle.push(lessDirection);
      }
    }
    this._moveAngleIndex = 0;
  }

  public moveByController(gameManeger: GameManeger) {
    if (gameManeger.controller.getRightPressed()) {
      this.handle("R");
    }
    if (gameManeger.controller.getLeftPressed()) {
      this.handle("L");
    }
    if (gameManeger.controller.getUpPressed()) {
      this.move(this._moveAngle[this._moveAngleIndex], gameManeger.collisionManeger);
      this._moveAngleIndex += 1;
      this._moveAngleIndex %= this._moveAngle.length;
    }
    if (gameManeger.controller.getDownPressed()) {
      this._moveAngleIndex += this._moveAngle.length - 1;
      this._moveAngleIndex %= this._moveAngle.length;
      this.move(revDirection(this._moveAngle[this._moveAngleIndex]), gameManeger.collisionManeger);
    }
    if (!(gameManeger.controller.getRightPressed() || gameManeger.controller.getLeftPressed() || gameManeger.controller.getUpPressed() || gameManeger.controller.getDownPressed())) {
      return false
    } else {
      return true
    }
  }

  public getX() {
    return this._x;
  }

  public getY() {
    return this._y;
  }

  public getAngle() {
    return this._angle;
  }

  public getHitBox(): HitBox {
    return {
      position: {
        x: this._x,
        y: this._y
      },
      size: {
        h: 32,
        w: 32
      }
    }
  }
}

export { PlayerLogic };