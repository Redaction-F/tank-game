// コントローラー
class Controller {
  // 各方向キー押しているかどうか
  private _rightPressed: boolean = false;
  private _leftPressed: boolean = false;
  private _downPressed: boolean = false;
  private _upPressed: boolean = false;

  // キーボードを押したタイミングにキーを押しているかどうかを更新
  public checkKeydown(e: KeyboardEvent) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      this._rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      this._leftPressed = true;
    } else if (e.key === "Down" || e.key === "ArrowDown") {
      this._downPressed = true;
    } else if (e.key === "Up" || e.key === "ArrowUp") {
      this._upPressed = true;
    }
  }

  // キーボードを離したタイミングにキーを押しているかどうかを更新
  public checkKeyUp(e: KeyboardEvent) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      this._rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      this._leftPressed = false;
    } else if (e.key === "Down" || e.key === "ArrowDown") {
      this._downPressed = false;
    } else if (e.key === "Up" || e.key === "ArrowUp") {
      this._upPressed = false;
    }
  }

  // 右キー押しているかどうか取得
  public getRightPressed() {
    return this._rightPressed;
  }

  // 左キー押しているかどうか取得
  public getLeftPressed() {
    return this._leftPressed;
  }

  // 下キー押しているかどうか取得
  public getDownPressed() {
    return this._downPressed;
  }

  // 上キー押しているかどうか取得
  public getUpPressed() {
    return this._upPressed;
  }
}

export { Controller };