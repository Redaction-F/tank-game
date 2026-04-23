import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { BulletManeger, HitTank, initBulletManeger } from "./logic";
import { initObjectRenderingData, ObjectRenderingData } from "../player/logic";
import "./style.css";
import { GameProps } from "../game/logic";

function Bullet(props: { 
  initBulletManeger: BulletManeger,  
  disappear: () => void,
  gameProps: GameProps
}) {
  // 砲弾の位置と角度
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
  // 砲弾管理オブジェクト
  const bulletManeger = useRef<BulletManeger>(initBulletManeger());
  const disappear = () => {
    props.disappear();
  };

  useEffect(() => {
    // 砲弾管理オブジェクトを初期化
    bulletManeger.current = props.initBulletManeger;
    // 砲弾の位置を更新
    setObjectRenderingData({
      position: {
        x: Math.floor(bulletManeger.current.moveData.position.x),
        y: Math.floor(bulletManeger.current.moveData.position.y),
      },
      angle: Math.floor(bulletManeger.current.moveData.angle),
    });
    // 砲弾の更新を定期実行
    const clearTask = props.gameProps.addTask({
      f: async () => {
        // 砲弾の更新
        const [disappeared, hitTank, bulletManegerRes] = await invoke<[boolean, HitTank, BulletManeger]>("bullet_move_forward", { 
          bulletManeger: bulletManeger.current, 
          gameManeger: props.gameProps.gameManeger 
        });
        if (hitTank !== "noHit") {
          if (hitTank === "player") {
            props.gameProps.gameManeger.collisionManeger.playerManeger.isDead = true;
          } else {
            props.gameProps.gameManeger.collisionManeger.enemyManegers[hitTank.enemy].isDead = true;
            disappear();
          }
        }
        // 砲弾管理オブジェクトを更新
        bulletManeger.current = bulletManegerRes;
        // 砲弾が消滅していたら
        if (disappeared) {
          disappear();
        }
        // 砲弾の位置を更新
        setObjectRenderingData({
          position: {
            x: Math.floor(bulletManeger.current.moveData.position.x),
            y: Math.floor(bulletManeger.current.moveData.position.y),
          },
          angle: Math.floor(bulletManeger.current.moveData.angle),
        });
      }, 
      priority: 5, 
      memo: "bullet move(5)"
    });
    return clearTask;
  }, []);

  return (
    <img 
      className="bullet" 
      // 位置と角度を指定
      style={{ 
        top: objectRenderingData.position.y, 
        left: objectRenderingData.position.x, 
        transform: `rotate(${objectRenderingData.angle}deg)` 
      }} 
      src="./src/assets/img/bullet.gif" 
    />
  )
}

export default Bullet;