import { StageMap } from "../grid/logic"

type Position = {
  x: number,
  y: number
}

type Size = {
  h: number,
  w: number
}

type HitBox = {
  position: Position,
  size: Size
}

function collision(a: HitBox, b: HitBox) {
  const stackUp = Math.max(a.position.y, b.position.y);
  const stackDown = Math.min(a.position.y + a.size.h, b.position.y + b.size.h);
  const stackLeft = Math.max(a.position.x, b.position.x);
  const stackRight = Math.min(a.position.x + a.size.w, b.position.x + b.size.w);
  return (stackUp < stackDown) && (stackLeft < stackRight);
}

class CollisionManeger {
  private walls: HitBox[] = [];
  private fieldSize: {
    h: number,
    w: number
  } = {
    h: 0,
    w: 0
  }

  public updateStageMap(stageMap: StageMap) {
    this.walls = [];
    stageMap.map.forEach((row, i) => {
      row.forEach((v, j) => {
        if (v === "wall" || v === "cracked_wall") {
          console.log(`Check:\n\ti: ${i}\n\tj: ${j}`)
          this.walls.push({
            position: {
              x: 32 * j,
              y: 32 * i
            },
            size: {
              h: 32,
              w: 32
            }
          })
        }
      })
    })
    this.fieldSize = {
      h: 32 * stageMap.numberOfRow,
      w: 32 * stageMap.numberOfCol,
    };
  }

  isHitWall(hitBox: HitBox) {
    const wallsHit = this.walls.some((v, i) => {
      const tmp = collision(v, hitBox);
      if (tmp) {
        console.log(`i: ${i}\n\t\tx, y: ${v.position.x}, ${v.position.y}\n\t\th, w: ${v.size.h}, ${v.size.w}`);
      }
      return tmp;
    });
    const aroundWallHit = (hitBox.position.x < 0) 
      || (hitBox.position.y < 0) 
      || (hitBox.position.x + hitBox.size.w > this.fieldSize.w) 
      || (hitBox.position.y + hitBox.size.h > this.fieldSize.h);
    return wallsHit || aroundWallHit;
  }
}

export { CollisionManeger, type HitBox, type Position, type Size };