import { useEffect, useRef, useState } from "react";
import { PlayerManeger } from "./logic"
import "./self.css"
import { GameManeger } from "../../logic";
import { invoke } from "@tauri-apps/api/core";

// プレイヤー
function Player(props: {gameManeger: GameManeger}) {
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
  const readController = useRef<number | null>(null);
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
      moveType: "Hit",
      speed: 2.0
    }
  });

  useEffect(() => {
    const init = async () => {
      playerManeger.current = await invoke<PlayerManeger>("player_maneger_init");
      // コントローラを定期的に読んで移動させる
      if (readController.current !== null) {
        clearInterval(readController.current);
        readController.current = null;
      }
      readController.current = setInterval(async () => {
        const [playerManegerawaitRes, rendering] = await invoke<[PlayerManeger, boolean]>("move_by_controller", {
          playerManeger: playerManeger.current, 
          gameManeger: props.gameManeger
        });
        if (rendering) {
          playerManeger.current = playerManegerawaitRes;
          setPositionAndAngle({
            x: Math.floor(playerManeger.current.moveData.position.x),
            y: Math.floor(playerManeger.current.moveData.position.y),
            angle: Math.floor(playerManeger.current.moveData.angle),
          });
        }
      }, 20);
    }
    init();
  }, []);

  return (
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
  )
}

export default Player;