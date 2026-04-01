import { useEffect, useRef, useState } from "react";
import { PlayerLogic } from "./logic"
import { GameManeger } from "../../logic";
import "./self.css"

function Player(props: {gameManeger: GameManeger}) {
  const [rendering, setRendering] = useState<{
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
  const playerLogic: PlayerLogic = new PlayerLogic();

  useEffect(() => {
    if (readController.current !== null) {
      clearInterval(readController.current);
      readController.current = null;
    }
    readController.current = setInterval(() => {
      if (playerLogic.moveByController(props.gameManeger)) {
        setRendering({
          x: playerLogic.getX(),
          y: playerLogic.getY(),
          angle: 360 - playerLogic.getAngle(),
        });
      }
    }, 20);
  }, []);

  return (
    <img 
      className="player" 
      style={{ 
        top: Math.floor(rendering.y), 
        left: Math.floor(rendering.x), 
        transform: `rotate(${Math.floor(rendering.angle)}deg)` 
      }} 
      src="./src/assets/img/tank.gif" 
    />
  )
}

export default Player;