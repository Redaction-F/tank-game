import { Position } from "../game/logic";

type PlayerManager = {
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
  },
  isDead: boolean
};
const initPlayerManager = (): PlayerManager => {
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
    },
    isDead: false
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

export { initObjectRenderingData, initPlayerManager, type ObjectRenderingData, type PlayerManager };