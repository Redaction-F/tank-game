import { CollisionManeger } from "./collision_maneger";
import { Controller } from "./controller";

// ゲーム管理
type GameManeger = {
  controller: Controller,
  collisionManeger: CollisionManeger
};

// GameManegerの初期化
function initGameManeger(): GameManeger {
  return {
    controller: new Controller(),
    collisionManeger: new CollisionManeger()
  }
}

export { type GameManeger, initGameManeger };