import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { BulletManager, initBulletManager } from "./logic";
import { initObjectRenderingData, ObjectRenderingData } from "../player/logic";
import "./style.css";
import { GameManager, GameProps } from "../game/logic";

function Bullet(props: { 
  initBulletManager: BulletManager,  
  disappear: () => void,
  gameProps: GameProps
}) {
  // 砲弾の位置と角度
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
  // 砲弾管理オブジェクト
  const bulletManager = useRef<BulletManager>(initBulletManager());
  const disappear = () => {
    props.disappear();
  };

  useEffect(() => {
    // 砲弾管理オブジェクトを初期化
    bulletManager.current = props.initBulletManager;
    // 砲弾の位置を更新
    setObjectRenderingData({
      position: {
        x: Math.floor(bulletManager.current.moveData.position.x),
        y: Math.floor(bulletManager.current.moveData.position.y),
      },
      angle: Math.floor(bulletManager.current.moveData.angle),
    });
    // 砲弾の更新を定期実行
    const clearTask = props.gameProps.addTask({
      f: async () => {
        // 砲弾の更新
        const [disappeared, bulletManagerRes, gameManagerRes] = await invoke<[boolean, BulletManager, GameManager]>("bullet_move_forward", { 
          bulletManager: bulletManager.current, 
          gameManager: props.gameProps.gameManager 
        });
        props.gameProps.setGameManager(gameManagerRes);
        // 砲弾管理オブジェクトを更新
        bulletManager.current = bulletManagerRes;
        // 砲弾が消滅していたら
        if (disappeared) {
          disappear();
        }
        // 砲弾の位置を更新
        setObjectRenderingData({
          position: {
            x: Math.floor(bulletManager.current.moveData.position.x),
            y: Math.floor(bulletManager.current.moveData.position.y),
          },
          angle: Math.floor(bulletManager.current.moveData.angle),
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