import { useEffect, useRef, useState } from "react";
import { PlayerManeger } from "./logic"
import { GameManeger } from "../../game_maneger/logic";
import "./self.css"

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
  const playerManeger: PlayerManeger = new PlayerManeger();

  useEffect(() => {
    // コントローラを定期的に読んで移動させる
    if (readController.current !== null) {
      clearInterval(readController.current);
      readController.current = null;
    }
    readController.current = setInterval(() => {
      if (playerManeger.moveByController(props.gameManeger)) {
        setPositionAndAngle({
          x: playerManeger.getX(),
          y: playerManeger.getY(),
          angle: 360 - playerManeger.getAngle(),
        });
      }
    }, 20);
  }, []);

  return (
    <img 
      className="player" 
      // 位置と角度を指定
      style={{ 
        top: Math.floor(positionAndAngle.y), 
        left: Math.floor(positionAndAngle.x), 
        transform: `rotate(${Math.floor(positionAndAngle.angle)}deg)` 
      }} 
      src="./src/assets/img/tank.gif" 
    />
  )
}

export default Player;