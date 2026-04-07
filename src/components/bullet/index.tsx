import { useEffect, useRef, useState } from "react";
import { BulletManeger } from "./logic";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger, IntervalFunction } from "../../logic";
import "./bullet.css"

function Bullet(props: { 
  gameManeger: GameManeger, 
  initBulletManeger: BulletManeger,  
  addIntervalFunction: (intervalFunction: IntervalFunction) => number,
  disappear: () => void,
  id: number
}) {
  const [positionAndAngle, setPositionAndAngle] = useState<{
    x: number,
    y: number,
    angle: number
  }>({
    x: props.initBulletManeger.moveData.position.x,
    y: props.initBulletManeger.moveData.position.y,
    angle: props.initBulletManeger.moveData.angle,
  });
  const bulletManeger = useRef<BulletManeger>({
      moveData: {
      // 位置
      position: {
        x: 0,
        y: 0
      },
      // 角度
      angle: 0,
      size: {
        width: 8,
        height: 8,
      },
      moveType: {
        Bounce: {
          max_count: 0,
          count: 0
        }
      },
      speed: 1.5
    }
  });
  const intervalId = useRef<number | null>(null);
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    if (firstRendering.current) {
      return;
    }
    firstRendering.current = true;
    console.log(`bullet id\n\tid: ${props.id}`);
    bulletManeger.current = props.initBulletManeger;
    intervalId.current = props.addIntervalFunction(async () => {
      const [bulletManegerRes, disappear] = await invoke<[BulletManeger, boolean]>("bullet_move_forward", { 
        bulletManeger: bulletManeger.current, 
        gameManeger: props.gameManeger 
      });
      bulletManeger.current = bulletManegerRes;
      if (disappear) {
        props.disappear();
        if (intervalId.current !== null) {
          clearInterval(intervalId.current);
        }
      }
      setPositionAndAngle({
        x: Math.floor(bulletManeger.current.moveData.position.x),
        y: Math.floor(bulletManeger.current.moveData.position.y),
        angle: Math.floor(bulletManeger.current.moveData.angle)
      })
    });
  }, []);

  return (
    <img 
      className="bullet" 
      // 位置と角度を指定
      style={{ 
        top: positionAndAngle.y, 
        left: positionAndAngle.x, 
        transform: `rotate(${positionAndAngle.angle}deg)` 
      }} 
      src="./src/assets/img/bullet.gif" 
    />
  )
}

export default Bullet;