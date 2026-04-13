import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GlobalProps } from "../../logic";
import { BulletManeger, HitTank, initBulletManeger } from "./logic";
import { initObjectRenderingData, ObjectRenderingData } from "../player/logic";
import "./style.css";

function Bullet(props: { 
  initBulletManeger: BulletManeger,  
  disappear: () => void,
  globalProps: GlobalProps
}) {
  // 砲弾の位置と角度
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
  // 砲弾管理オブジェクト
  const bulletManeger = useRef<BulletManeger>(initBulletManeger());
  // 定期実行関数の削除用
  const intervalId = useRef<number | null>(null);
  // 初回レンダリング用
  const firstRendered = useRef<boolean>(false);
  const disappear = () => {
    props.disappear();
    // 定期実行を削除
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
    }
  };

  useEffect(() => {
    const first = () => {
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
      intervalId.current = props.globalProps.addIntervalFunction(async () => {
        // 砲弾の更新
        const [disappeared, hitTank, bulletManegerRes] = await invoke<[boolean, HitTank, BulletManeger]>("bullet_move_forward", { 
          bulletManeger: bulletManeger.current, 
          gameManeger: props.globalProps.gameManeger 
        });
        if (hitTank !== "noHit") {
          if (hitTank === "player") {
            console.log(`hitTank: player`);
          } else {
            props.globalProps.gameManeger.collisionManeger.enemyManegers[hitTank.enemy] = null;
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
      });
    };
    if (firstRendered.current) {
      return;
    };
    firstRendered.current = true;
    first();
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