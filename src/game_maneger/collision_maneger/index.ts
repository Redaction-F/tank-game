import { invoke } from "@tauri-apps/api/core";

// マップのマス種
type Grid = "floor" | "wall" | "cracked_wall";
// ステージ
type StageMap = {
  map: Grid[][],
  numberOfRow: number,
  numberOfCol: number,
};
// 位置グリットのサイズ
const girdSize: Size = {
  w: 32,
  h: 32
}

// ステージ読み込み
async function readStage(filename: string, collisionManeger: CollisionManeger) {
  const stageMap: StageMap = {
    map: [],
    numberOfRow: 0,
    numberOfCol: 0,
  };
  stageMap.map = await invoke<Grid[][]>("read_stage", { filename });
  stageMap.numberOfRow = stageMap.map.length;
  stageMap.numberOfCol = stageMap.map.length === 0
    ? 0
    : stageMap.map[0].length;
  collisionManeger.updateStageMap(stageMap);
  return stageMap;
}

// 垂直下方向と水平右方向が正
// 位置
type Position = {
  x: number,
  y: number,
};
// 大きさ
type Size = {
  w: number,
  h: number,
};
// 当たり判定
type HitBox = {
  position: Position,
  size: Size,
};

// 当たり判定管理
class CollisionManeger {
  // 壁の当たり判定
  private walls: HitBox[] = [];
  // ステージのサイズ
  private stageSize: Size = {
    w: 0,
    h: 0,
  };

  // 当たり判定から衝突判定
  private static collision(a: HitBox, b: HitBox) {
    // 重なりの上辺、下辺、左辺、右辺
    const stackUp = Math.max(a.position.y, b.position.y);
    const stackDown = Math.min(a.position.y + a.size.h, b.position.y + b.size.h);
    const stackLeft = Math.max(a.position.x, b.position.x);
    const stackRight = Math.min(a.position.x + a.size.w, b.position.x + b.size.w);
    // 重なりの大小関係判定
    return (stackUp < stackDown) && (stackLeft < stackRight);
  }

  // ステージの更新時に呼ぶ
  public updateStageMap(stageMap: StageMap) {
    this.walls = [];
    stageMap.map.forEach((row, rowIndex) => {
      row.forEach((v, colIndex) => {
        if (v === "wall" || v === "cracked_wall") {
          this.walls.push({
            position: {
              x: girdSize.w * colIndex,
              y: girdSize.h * rowIndex
            },
            size: girdSize
          });
        }
      })
    });
    this.stageSize = {
      h: 32 * stageMap.numberOfRow,
      w: 32 * stageMap.numberOfCol,
    };
  }

  // 壁に当たったか判定
  public isHitWall(hitBox: HitBox) {
    const wallsHit = this.walls.some((v) => CollisionManeger.collision(v, hitBox));
    const aroundWallHit = (hitBox.position.x < 0) 
      || (hitBox.position.y < 0) 
      || (hitBox.position.x + hitBox.size.w > this.stageSize.w) 
      || (hitBox.position.y + hitBox.size.h > this.stageSize.h);
    return wallsHit || aroundWallHit;
  }
}

export { type Grid, type StageMap, readStage, type Position, type Size, type HitBox, CollisionManeger };