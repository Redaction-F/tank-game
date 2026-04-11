import { useEffect, useRef, useState } from "react";
import { BulletManeger, initBulletManeger } from "./logic";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger, IntervalFunction } from "../../logic";
import "./bullet.css"
import { initObjectRenderingData, ObjectRenderingData } from "../player/logic";

function Bullet(props: { 
  gameManeger: GameManeger, 
  initBulletManeger: BulletManeger,  
  addIntervalFunction: (intervalFunction: IntervalFunction) => number,
  disappear: () => void,
  id: number
}) {
  // 砲弾の位置と角度
  const [positionAndAngle, setPositionAndAngle] = useState<ObjectRenderingData>(initObjectRenderingData());
  // 砲弾管理オブジェクト
  const bulletManeger = useRef<BulletManeger>(initBulletManeger());
  // 定期実行関数の削除用
  const intervalId = useRef<number | null>(null);
  // 初回レンダリング用
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    const first = () => {
      // 砲弾管理オブジェクトを初期化
      bulletManeger.current = props.initBulletManeger;
      // 砲弾の位置を更新
      setPositionAndAngle({
        position: {
          x: Math.floor(bulletManeger.current.moveData.position.x),
          y: Math.floor(bulletManeger.current.moveData.position.y),
        },
        angle: Math.floor(bulletManeger.current.moveData.angle),
      });
      // 砲弾の更新を定期実行
      intervalId.current = props.addIntervalFunction(async () => {
        // 砲弾の更新
        const [disappear, bulletManegerRes] = await invoke<[boolean, BulletManeger]>("bullet_move_forward", { 
          bulletManeger: bulletManeger.current, 
          gameManeger: props.gameManeger 
        });
        // 砲弾管理オブジェクトを更新
        bulletManeger.current = bulletManegerRes;
        // 砲弾が消滅していたら
        if (disappear) {
          props.disappear();
          // 定期実行を削除
          if (intervalId.current !== null) {
            clearInterval(intervalId.current);
          }
        }
        // 砲弾の位置を更新
        setPositionAndAngle({
          position: {
            x: Math.floor(bulletManeger.current.moveData.position.x),
            y: Math.floor(bulletManeger.current.moveData.position.y),
          },
          angle: Math.floor(bulletManeger.current.moveData.angle),
        });
      });
    };
    if (firstRendering.current) {
      return;
    };
    firstRendering.current = true;
    first();
  }, []);

  return (
    <img 
      className="bullet" 
      // 位置と角度を指定
      style={{ 
        top: positionAndAngle.position.y, 
        left: positionAndAngle.position.x, 
        transform: `rotate(${positionAndAngle.angle}deg)` 
      }} 
      src="./src/assets/img/bullet.gif" 
    />
  )
}

export default Bullet;