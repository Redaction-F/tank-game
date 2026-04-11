import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger, GlobalProps } from "../../logic";
import { initObjectRenderingData, initPlayerManeger, ObjectRenderingData, PlayerManeger } from "./logic"
import { BulletManeger } from "../bullet/logic";
import { GridPosition } from "../stage/logic";
import Bullet from "../bullet";
import "./player.css"

// プレイヤー
function Player(props: {
  startGrid: GridPosition,
  globalProps: GlobalProps,
}) {
  // プレイヤーの位置と角度
  const [positionAndAngle, setPositionAndAngle] = useState<ObjectRenderingData>(initObjectRenderingData());
  // プレイヤー管理オブジェクト
  const playerManeger = useRef<PlayerManeger>(initPlayerManeger());
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
  // 初回のみ実行するためのフラグ
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    const first = async () => {
      const startPosition = {
        x: props.startGrid.gridX * 32 - playerManeger.current.moveData.size.width / 2,
        y: props.startGrid.gridY * 32 - playerManeger.current.moveData.size.height / 2,
      };
      playerManeger.current.moveData.position = startPosition;
      setPositionAndAngle({
        position: startPosition,
        angle: 0
      });
      // コントローラを定期的に読んで移動させる
      props.globalProps.addIntervalFunction(async (setGameManeger) => {
        // コントローラを読む
        const [rendering, bulletManegerRes, playerManegerawaitRes, gameManegerRes] = 
          await invoke<[boolean, BulletManeger | null, PlayerManeger, GameManeger]>("player_move_by_controller", {
            playerManeger: playerManeger.current, 
            gameManeger: props.globalProps.gameManeger
          });
        // 動いていないなら残りを飛ばす
        if (!rendering) {
          return;
        }
        // プレイヤー管理オブジェクトを更新
        playerManeger.current = playerManegerawaitRes;
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
          // スペースキーを押したときだけ更新される
          setGameManeger(gameManegerRes);
        }
        // プレイヤーの位置を更新
        setPositionAndAngle({
          position: {
            x: Math.floor(playerManeger.current.moveData.position.x),
            y: Math.floor(playerManeger.current.moveData.position.y),
          },
          angle: Math.floor(playerManeger.current.moveData.angle),
        });
      });
    }
    if (firstRendering.current) {
      return;
    }
    firstRendering.current = true;
    first();
  }, []);

  useEffect(() => {

  }, [])

  return (
    <>
      {
        bulletManegers
          .map((v, i) => {
            if (v === null) {
              return <div key={100 + i}></div>
            } else {
              return <Bullet 
                initBulletManeger={v.maneger} 
                disappear={() => setBulletManegersWrapper(i, null)}
                globalProps={props.globalProps}
                id={v.id}
                key={v.id}
              />
            }
          })
      }
      <img 
        className="player" 
        style={{ 
          top: positionAndAngle.position.y, 
          left: positionAndAngle.position.x, 
          transform: `rotate(${positionAndAngle.angle}deg)` 
        }} 
        src="./src/assets/img/tank.gif"
      />
    </>
  )
}

export default Player;