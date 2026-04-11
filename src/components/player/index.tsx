import { useEffect, useRef, useState } from "react";
import { initObjectRenderingData, initPlayerManeger, ObjectRenderingData, PlayerManeger } from "./logic"
import "./player.css"
import { GameManeger, IntervalFunction } from "../../logic";
import { invoke } from "@tauri-apps/api/core";
import { BulletManeger } from "../bullet/logic";
import Bullet from "../bullet";

// プレイヤー
function Player(props: {
  gameManeger: GameManeger, 
  addIntervalFunction: (intervalFunction: IntervalFunction) => number
}) {
  // プレイヤーの位置と角度
  const [positionAndAngle, setPositionAndAngle] = useState<ObjectRenderingData>(initObjectRenderingData());
  // プレイヤー管理オブジェクト
  const playerManeger = useRef<PlayerManeger>(initPlayerManeger());
  // 砲弾管理オブジェクト群
  const [bulletManegers, setBulletManegers] = useState<({
    id: number,
    maneger: BulletManeger,
  } | null)[]>([null]);
  // 次の砲弾id
  const nextBulletId = useRef<number>(0);
  // 次の砲弾id取得、更新
  const getNewBulletId = (): number => {
    nextBulletId.current += 1;
    return nextBulletId.current - 1;
  };
  // 初回のみ実行するためのフラグ
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    const first = async () => {
      // コントローラを定期的に読んで移動させる
      props.addIntervalFunction(async (setGameManeger) => {
        // コントローラを読む
        const [rendering, bulletManegerRes, playerManegerawaitRes, gameManegerRes] = 
          await invoke<[boolean, BulletManeger | null, PlayerManeger, GameManeger]>("player_move_by_controller", {
            playerManeger: playerManeger.current, 
            gameManeger: props.gameManeger
          });
        // 動いていないなら残りを飛ばす
        if (!rendering) {
          return;
        }
        // プレイヤー管理オブジェクトを更新
        playerManeger.current = playerManegerawaitRes;
        // 砲弾が発射されていたら砲弾を作成
        if (bulletManegerRes !== null) {
          setBulletManegers([{
            id: getNewBulletId(),
            maneger: bulletManegerRes
          }]);
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

  return (
    <>
      <img 
        className="player" 
        // 位置と角度を指定
        style={{ 
          top: positionAndAngle.position.y, 
          left: positionAndAngle.position.x, 
          transform: `rotate(${positionAndAngle.angle}deg)` 
        }} 
        src="./src/assets/img/tank.gif" 
      />
      {
        bulletManegers
          .filter((v) => v !== null)
          .map((v) => (<Bullet 
            initBulletManeger={v.maneger} 
            gameManeger={props.gameManeger}
            addIntervalFunction={props.addIntervalFunction}
            disappear={() => {
              console.log("disappear")
              setBulletManegers([null])}
            }
            id={v.id}
            key={v.id}
          />))
      }
    </>
  )
}

export default Player;