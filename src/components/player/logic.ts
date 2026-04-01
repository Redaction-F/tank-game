import { GameManeger } from "../../game_maneger/logic";
import { CollisionManeger, Position, Size, type HitBox } from "../../game_maneger/collision_maneger";

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

// 角度変更方向
type Handle = "L" | "R";

// プレイヤー管理
class PlayerManeger {
  // 位置
  private _position: Position = {
    x: 0,
    y: 0,
  };
  // 角度
  private _angle: number = 0;
  // 速さ
  private _speed: number = 2;
  // 角度に応じた動く方向(1周期)
  private _moveAngle: Direction[] = ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R"];
  // 周期のどこにいるか
  private _moveAngleIndex: number = 0;
  private static _size: Size = {
    w: 32,
    h: 32,
  }
  
  // 動く
  private move(direction: Direction, collisionManeger: CollisionManeger) {
    // 前の位置を記録
    const prePosition = {
      x: this._position.x, 
      y: this._position.y
    };
    // 方向によって位置を動かす
    if (direction === "U") {
      this._position.y -= this._speed;
    } else if (direction === "D") {
      this._position.y += this._speed;
    } else if (direction === "L") {
      this._position.x -= this._speed;
    } else {
      this._position.x += this._speed;
    }
    // 壁に当たっていたら、前の位置に戻す
    if (collisionManeger.isHitWall(this.getHitBox())) {
      console.log(`Check:\n\tHit WALL!!!!!!`)
      this._position.x = prePosition.x;
      this._position.y = prePosition.y;
    }
  }

  // 角度を変える
  private handle(handle: Handle) {
    // ハンドルによって角度を動かす
    if (handle === "L") {
      this._angle += 3;
    } else {
      this._angle += 357;
    }
    this._angle %= 360;
    // 角度によって、UDLRから、「より動く方向」、「あまり動かない方向」を決定
    // 周期的に「より動く方向」、「あまり動かない方向」に繰り返し動くことで向いている方向に動く
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
    // 「より動く方向」に1周期で何回動くか
    const moreDirectionFullCount = 10;
    // 「あまり動かない方向」に1周期で何回動くか
    const lessDirectionFullCount = Math.ceil(Math.tan(miniAngle * Math.PI / 180) * moreDirectionFullCount);
    // 1周期でどの順番に動くか
    let moreDirectionCount = 0;
    let lessDirectionCount = 0;
    this._moveAngle = [];
    // 周期の途中で切ってもできるだけその角度を保つようにする
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

  // コントローラーで動かす
  public moveByController(gameManeger: GameManeger) {
    // 右にハンドルを切る
    if (gameManeger.controller.getRightPressed()) {
      this.handle("R");
    }
    // 左にハンドルを切る
    if (gameManeger.controller.getLeftPressed()) {
      this.handle("L");
    }
    // 前に進む
    if (gameManeger.controller.getUpPressed()) {
      // 方向周期から動く方向を決定
      this.move(this._moveAngle[this._moveAngleIndex], gameManeger.collisionManeger);
      // 周期を進める
      this._moveAngleIndex += 1;
      this._moveAngleIndex %= this._moveAngle.length;
    }
    if (gameManeger.controller.getDownPressed()) {
      // 周期を戻す
      this._moveAngleIndex += this._moveAngle.length - 1;
      this._moveAngleIndex %= this._moveAngle.length;
      // 方向周期から動く方向を決定
      this.move(revDirection(this._moveAngle[this._moveAngleIndex]), gameManeger.collisionManeger);
    }
    // キー入力があったか判定して返す
    if (!(gameManeger.controller.getRightPressed() || gameManeger.controller.getLeftPressed() || gameManeger.controller.getUpPressed() || gameManeger.controller.getDownPressed())) {
      return false
    } else {
      return true
    }
  }

  // x座標を取得
  public getX() {
    return this._position.x;
  }

  // y座標を取得
  public getY() {
    return this._position.y;
  }

  // 角度を取得
  public getAngle() {
    return this._angle;
  }

  // 当たり判定を取得
  public getHitBox(): HitBox {
    return {
      position: {
        x: this.getX(),
        y: this.getY()
      },
      size: PlayerManeger._size
    }
  }
}

export { PlayerManeger };