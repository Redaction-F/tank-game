class Controller {
  private rightPressed: boolean = false;
  private leftPressed: boolean = false;
  private upPressed: boolean = false;
  private downPressed: boolean = false;

  checkKeydown(e: KeyboardEvent) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      this.rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      this.leftPressed = true;
    } else if (e.key === "Up" || e.key === "ArrowUp") {
      this.upPressed = true;
    } else if (e.key === "Down" || e.key === "ArrowDown") {
      this.downPressed = true;
    }
  }

  checkKeyUp(e: KeyboardEvent) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      this.rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      this.leftPressed = false;
    } else if (e.key === "Up" || e.key === "ArrowUp") {
      this.upPressed = false;
    } else if (e.key === "Down" || e.key === "ArrowDown") {
      this.downPressed = false;
    }
  }

  public getRightPressed() {
    return this.rightPressed;
  }

  public getLeftPressed() {
    return this.leftPressed;
  }

  public getUpPressed() {
    return this.upPressed;
  }

  public getDownPressed() {
    return this.downPressed;
  }
}

export { Controller };