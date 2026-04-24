import { useEffect, useRef, useState } from "react";
import { initObjectRenderingData, ObjectRenderingData } from "../player/logic";
import { BulletManager } from "../bullet/logic";
import { EnemyManager } from "./logic";
import { invoke } from "@tauri-apps/api/core";
import "./style.css";
import { GameProps, GridPosition } from "../game/logic";
import Bullet from "../bullet";

function Enemy(props: {
  startGrid: GridPosition,
  enemyManagerIndex: number,
  gameProps: GameProps,
}) {
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
    // 砲弾管理オブジェクト群
  const maximumBullet: number = 2;
  const [bulletManagers, setBulletManagers] = useState<({
    id: number,
    manager: BulletManager,
  } | null)[]>(new Array(maximumBullet).fill(null));
  const bulletFlag = useRef<boolean[]>(new Array(maximumBullet).fill(false));
  const setBulletManagersWrapper = (index: number, bulletManager: BulletManager | null) => {
    let newObject = null;
    if (bulletManager !== null) {
      newObject = {
        id: getNextBulletId(),
        manager: bulletManager
      }
    };
    setBulletManagers((pre) => {
      const res = [...pre];
      res[index] = newObject;
      return res;
    });
    bulletFlag.current[index] = (bulletManager !== null);
  };
  // 次の砲弾id
  const nextBulletId = useRef<number>(0);
  // 次の砲弾id取得、更新
  const getNextBulletId = (): number => {
    const res = nextBulletId.current;
    nextBulletId.current += 1;
    nextBulletId.current %= 100;
    return res;
  };

  useEffect(() => {
    const enemyManagers = props.gameProps.gameManager.collisionManager.enemyManagers;
    if (enemyManagers[props.enemyManagerIndex] === null) {
      return;
    }
    enemyManagers[props.enemyManagerIndex]!.moveData.position = {
      x: props.startGrid.gridX * 32 - enemyManagers[props.enemyManagerIndex]!.moveData.size.width / 2,
      y: props.startGrid.gridY * 32 - enemyManagers[props.enemyManagerIndex]!.moveData.size.height / 2,
    };
    const clearTask = props.gameProps.addTask({
      f: async () => {
        const [bulletManagerRes, enemyRes] = await invoke<[BulletManager | null, EnemyManager]>("enemy_move_auto", { 
          enemyManager: enemyManagers[props.enemyManagerIndex],
          playerManager: props.gameProps.gameManager.collisionManager.playerManager,
          gameManager: props.gameProps.gameManager
        });
        enemyManagers[props.enemyManagerIndex] = enemyRes;
        // 砲弾が発射されていたら砲弾を作成
        if (bulletManagerRes !== null) {
          let nullIndex: number = 0;
          for (const v of bulletFlag.current) {
            if (!v) {
              break;
            }
            nullIndex += 1;
          }
          if (nullIndex < bulletManagers.length) {
            setBulletManagersWrapper(nullIndex, bulletManagerRes);
          }
        }
        setObjectRenderingData({
          position: {
            x: enemyManagers[props.enemyManagerIndex]!.moveData.position.x,
            y: enemyManagers[props.enemyManagerIndex]!.moveData.position.y
          },
          angle: enemyManagers[props.enemyManagerIndex]!.moveData.angle
        });
      }, 
      priority: 5, 
      memo: "enemy move(5)"
    });
    return clearTask;
  }, []);

  return (
    <div>
      {
        bulletManagers.map((v, i) => (
          v === null
          ? <div key={100 + i}></div>
          : <Bullet 
              initBulletManager={v.manager}
              disappear={() => setBulletManagersWrapper(i, null)}
              gameProps={props.gameProps}
              key={v.id}
            />
        ))
      }
      {
        props.gameProps.gameManager.collisionManager.enemyManagers[props.enemyManagerIndex] === null
        ? <></>
        : <img 
            className="enemy" 
            style={{ 
              top: objectRenderingData.position.y, 
              left: objectRenderingData.position.x, 
              transform: `rotate(${objectRenderingData.angle}deg)` 
            }}
            src="./src/assets/img/enemy.gif"
          />
      }
    </div>
  );
}

export default Enemy;