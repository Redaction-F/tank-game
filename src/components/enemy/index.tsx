import { useEffect, useRef, useState } from "react";
import { initObjectRenderingData, ObjectRenderingData } from "../player/logic";
import { BulletManeger } from "../bullet/logic";
import { EnemyManeger } from "./logic";
import { GlobalProps } from "../../logic";
import { invoke } from "@tauri-apps/api/core";
import "./style.css";
import { GridPosition } from "../stage/logic";
import Bullet from "../bullet";

function Enemy(props: {
  startGrid: GridPosition,
  enemyManegerIndex: number,
  globalProps: GlobalProps,
}) {
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
  const intervalId = useRef<number | null>(null);
  const firstRendered = useRef<boolean>(false);
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
    const first = () => {
      const enemyManegers = props.globalProps.gameManeger.collisionManeger.enemyManegers;
      if (enemyManegers[props.enemyManegerIndex] === null) {
        return;
      }
      enemyManegers[props.enemyManegerIndex]!.moveData.position = {
        x: props.startGrid.gridX * 32 - enemyManegers[props.enemyManegerIndex]!.moveData.size.width / 2,
        y: props.startGrid.gridY * 32 - enemyManegers[props.enemyManegerIndex]!.moveData.size.height / 2,
      };
      intervalId.current = props.globalProps.addIntervalFunction(async () => {
        if (props.globalProps.gameManeger.collisionManeger.playerManeger === null || enemyManegers[props.enemyManegerIndex] === null) {
          if (intervalId.current !== null) {
            clearInterval(intervalId.current);
          }
          return;
        }
        const [bulletManegerRes, enemyRes] = await invoke<[BulletManeger | null, EnemyManeger]>("enemy_move_auto", { 
          enemyManeger: enemyManegers[props.enemyManegerIndex],
          playerManeger: props.globalProps.gameManeger.collisionManeger.playerManeger,
          gameManeger: props.globalProps.gameManeger
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
      });
    };
    if (firstRendered.current) {
      return;
    }
    firstRendered.current = true;
    first();
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
              globalProps={props.globalProps}
              key={v.id}
            />
        ))
      }
      {
        props.globalProps.gameManeger.collisionManeger.enemyManegers[props.enemyManegerIndex] === null
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