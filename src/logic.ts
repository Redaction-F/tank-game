import { CollisionManeger } from "./components/collision_maneger";
import { Controller } from "./components/controller";

type GameManeger = {
  controller: Controller,
  collisionManeger: CollisionManeger
};

function initGameManeger(): GameManeger {
  return {
    controller: new Controller(),
    collisionManeger: new CollisionManeger()
  }
}

export { type GameManeger, initGameManeger };