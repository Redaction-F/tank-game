import { useEffect, useRef, useState } from "react";
import { initObjectRenderingData, ObjectRenderingData } from "../player/logic";
import { BulletManeger } from "../bullet/logic";
import { EnemyManeger } from "./logic";
import { invoke } from "@tauri-apps/api/core";
import "./style.css";
import { GameProps, GridPosition } from "../game/logic";
import Bullet from "../bullet";

function Enemy(props: {
  startGrid: GridPosition,
  enemyManegerIndex: number,
  gameProps: GameProps,
}) {
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
    // 砲弾管理オブジェクト群
  const maximumBullet: number = 2;
  const [bulletManegers, setBulletManegers] = useState<({
    id: number,
    maneger: BulletManeger,
  } | null)[]>(new Array(maximumBullet).fill(null));
  const bulletFlag = useRef<boolean[]>(new Array(maximumBullet).fill(false));
  const setBulletManegersWrapper = (index: number, bulletManeger: BulletManeger | null) => {
    let newObject = null;
    if (bulletManeger !== null) {
      newObject = {
        id: getNextBulletId(),
        maneger: bulletManeger
      }
    };
    setBulletManegers((pre) => {
      const res = [...pre];
      res[index] = newObject;
      return res;
    });
    bulletFlag.current[index] = (bulletManeger !== null);
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
    const enemyManegers = props.gameProps.gameManeger.collisionManeger.enemyManegers;
    if (enemyManegers[props.enemyManegerIndex] === null) {
      return;
    }
    enemyManegers[props.enemyManegerIndex]!.moveData.position = {
      x: props.startGrid.gridX * 32 - enemyManegers[props.enemyManegerIndex]!.moveData.size.width / 2,
      y: props.startGrid.gridY * 32 - enemyManegers[props.enemyManegerIndex]!.moveData.size.height / 2,
    };
    const clearTask = props.gameProps.addTask({
      f: async () => {
        const [bulletManegerRes, enemyRes] = await invoke<[BulletManeger | null, EnemyManeger]>("enemy_move_auto", { 
          enemyManeger: enemyManegers[props.enemyManegerIndex],
          playerManeger: props.gameProps.gameManeger.collisionManeger.playerManeger,
          gameManeger: props.gameProps.gameManeger
        });
        enemyManegers[props.enemyManegerIndex] = enemyRes;
        // 砲弾が発射されていたら砲弾を作成
        if (bulletManegerRes !== null) {
          let nullIndex: number = 0;
          for (const v of bulletFlag.current) {
            if (!v) {
              break;
            }
            nullIndex += 1;
          }
          if (nullIndex < bulletManegers.length) {
            setBulletManegersWrapper(nullIndex, bulletManegerRes);
          }
        }
        setObjectRenderingData({
          position: {
            x: enemyManegers[props.enemyManegerIndex]!.moveData.position.x,
            y: enemyManegers[props.enemyManegerIndex]!.moveData.position.y
          },
          angle: enemyManegers[props.enemyManegerIndex]!.moveData.angle
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
        bulletManegers.map((v, i) => (
          v === null
          ? <div key={100 + i}></div>
          : <Bullet 
              initBulletManeger={v.maneger}
              disappear={() => setBulletManegersWrapper(i, null)}
              gameProps={props.gameProps}
              key={v.id}
            />
        ))
      }
      {
        props.gameProps.gameManeger.collisionManeger.enemyManegers[props.enemyManegerIndex] === null
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