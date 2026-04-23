import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { initObjectRenderingData, ObjectRenderingData, PlayerManeger } from "./logic"
import { BulletManeger } from "../bullet/logic";
import { GameManeger, GameProps, GridPosition, Phase } from "../game/logic";
import Bullet from "../bullet";
import "./style.css";

// プレイヤー
function Player(props: {
  startGrid: GridPosition,
  gameProps: GameProps,
}) {
  // プレイヤーの位置と角度
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
  const setPlayerManeger = (value: PlayerManeger) => {
    props.gameProps.gameManeger.collisionManeger.playerManeger.moveData = value.moveData;
    props.gameProps.gameManeger.collisionManeger.playerManeger.isDead = value.isDead;
  };
  // 砲弾最大数
  const maximumBullet: number = 2;
  // 砲弾管理データ群
  const [bulletManegers, setBulletManegers] = useState<({
    id: number,
    maneger: BulletManeger,
  } | null)[]>(new Array(maximumBullet).fill(null));
  // 砲弾が存在するかのフラグ(すぐに更新するためにuseRefで別に持つ)
  const bulletFlag = useRef<boolean[]>(new Array(maximumBullet).fill(false));
  // 砲弾を発射する
  const shootBullet = (index: number, bulletManeger: BulletManeger | null) => {
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
    // 初期位置を決定
    const startPosition = {
      x: props.startGrid.gridX * 32 - props.gameProps.gameManeger.collisionManeger.playerManeger.moveData.size.width / 2,
      y: props.startGrid.gridY * 32 - props.gameProps.gameManeger.collisionManeger.playerManeger.moveData.size.height / 2,
    };
    props.gameProps.gameManeger.collisionManeger.playerManeger.moveData.position = startPosition;
    setObjectRenderingData({
      position: startPosition,
      angle: 0
    });
    // コントローラを定期的に読んで移動させる
    const clearTask = props.gameProps.addTask({
      f: async () => {
        // コントローラを読む
        const [rendering, bulletManegerRes, playerManegerRes, gameManegerRes] = 
          await invoke<[boolean, BulletManeger | null, PlayerManeger, GameManeger]>("player_move_by_controller", {
            playerManeger: props.gameProps.gameManeger.collisionManeger.playerManeger, 
            gameManeger: props.gameProps.gameManeger
          });
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
            shootBullet(nullIndex, bulletManegerRes);
          }
        }
        // 動いていないなら残りを飛ばす
        if (!rendering) {
          return;
        }
        // プレイヤー管理オブジェクトを更新
        setPlayerManeger(playerManegerRes);
        // プレイヤーの位置を更新
        setObjectRenderingData({
          position: {
            x: playerManegerRes.moveData.position.x,
            y: playerManegerRes.moveData.position.y,
          },
          angle: playerManegerRes.moveData.angle,
        });
      }, 
      priority: Phase.Update2, 
      memo: "player move(5)"
    });
    return clearTask;
  }, []);

  return (
    <div>
      {
        bulletManegers
          .map((v, i) => {
            if (v === null) {
              return <div key={100 + i}></div>
            } else {
              return <Bullet 
                initBulletManeger={v.maneger} 
                disappear={() => shootBullet(i, null)}
                gameProps={props.gameProps}
                key={v.id}
              />
            }
          })
      }
      <img 
        className="player" 
        style={{ 
          top: objectRenderingData.position.y, 
          left: objectRenderingData.position.x, 
          transform: `rotate(${objectRenderingData.angle}deg)` 
        }} 
        src="./src/assets/img/tank.gif"
      />
    </div>
  )
}

export default Player;