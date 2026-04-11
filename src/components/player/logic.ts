import { Position } from "../../logic";

type PlayerManeger = {
  moveData: {
    // 位置
    position: Position,
    // 角度
    angle: number,
    size: {
      width: 32,
      height: 24,
    },
    moveType: "hit",
    speed: 2.0
  }
};
const initPlayerManeger = (): PlayerManeger => {
  return {
    moveData: {
      position: {
        x: 0,
        y: 0
      },
      angle: 0,
      size: {
        width: 32,
        height: 24,
      },
      moveType: "hit",
      speed: 2.0
    }
  };
};

type ObjectRenderingData = {
  position: Position,
  angle: number
};
const initObjectRenderingData = (): ObjectRenderingData => {
  return {
    position: {
      x: 0,
      y: 0,
    },
    angle: 0,
  };
};

export { initObjectRenderingData, initPlayerManeger, type ObjectRenderingData, type PlayerManeger };