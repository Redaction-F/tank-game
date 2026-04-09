import { useEffect, useRef, useState } from "react";
import { PlayerManeger } from "./logic"
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
  const [positionAndAngle, setPositionAndAngle] = useState<{
    x: number,
    y: number,
    angle: number
  }>({
    x: 0,
    y: 0,
    angle: 360
  });
  // コントローラーを読むsetIntervalの返り値
  const firstRendering = useRef<boolean>(false);
  // プレイヤー管理
  const playerManeger = useRef<PlayerManeger>({
    moveData: {
      position: {
        x: 0, 
        y: 0
      },
      angle: 0,
      size: {
        width: 32,
        height: 32
      },
      moveType: "hit",
      speed: 2.0
    }
  });
  const [bulletManegers, setBulletManegers] = useState<({
    id: number,
    maneger: BulletManeger,
  } | null)[]>([null]);
  const bulletId = useRef<number>(0);
  const getNewBulletId = () => {
    bulletId.current += 1;
    return bulletId.current - 1;
  }

  useEffect(() => {
    const init = async () => {
      playerManeger.current = await invoke<PlayerManeger>("player_maneger_init");
      // コントローラを定期的に読んで移動させる
      props.addIntervalFunction(async (setGameManeger) => {
        const [playerManegerawaitRes, gameManegerRes, bulletManegerRes, rendering] = 
          await invoke<[PlayerManeger, GameManeger, BulletManeger | null, boolean]>("player_move_by_controller", {
            playerManeger: playerManeger.current, 
            gameManeger: props.gameManeger
          });
        if (!rendering) {
          return;
        }
        playerManeger.current = playerManegerawaitRes;
        if (bulletManegerRes !== null) {
          setBulletManegers([{
            id: getNewBulletId(),
            maneger: bulletManegerRes
          }]);
          setGameManeger(gameManegerRes);
        }
        setPositionAndAngle({
          x: Math.floor(playerManeger.current.moveData.position.x),
          y: Math.floor(playerManeger.current.moveData.position.y),
          angle: Math.floor(playerManeger.current.moveData.angle),
        });
      });
    }
    if (firstRendering.current) {
      return;
    }
    firstRendering.current = true;
    init();
  }, []);

  useEffect(() => {
    console.log(bulletManegers[0]);
  }, bulletManegers)

  return (
    <>
      <img 
        className="player" 
        // 位置と角度を指定
        style={{ 
          top: positionAndAngle.y, 
          left: positionAndAngle.x, 
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