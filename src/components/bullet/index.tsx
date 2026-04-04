import { useState } from "react";
import { BulletManeger } from "./logic";

function Bullet() {
  const [positionAndAngle, setPositionAndAngle] = useState<{
    x: number,
    y: number,
    angle: number
  }>({
    x: 0,
    y: 0,
    angle: 0,
  });
  // const bulletManeger: BulletManeger = new BulletManeger();

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