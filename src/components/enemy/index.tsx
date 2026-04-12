import { useEffect, useRef, useState } from "react";
import { initObjectRenderingData, ObjectRenderingData, PlayerManeger } from "../player/logic";
import { EnemyManeger, initEnemyManeger } from "./logic";
import { GlobalProps } from "../../logic";
import { invoke } from "@tauri-apps/api/core";
import "./style.css";
import { GridPosition } from "../stage/logic";

function Enemy(props: {
  startGrid: GridPosition,
  playerManeger: PlayerManeger | null,
  globalProps: GlobalProps,
}) {
  const [objectRenderingData, setObjectRenderingData] = useState<ObjectRenderingData>(initObjectRenderingData());
  const enemyManeger = useRef<EnemyManeger>(initEnemyManeger());
  const intervalId = useRef<number | null>(null);
  const firstRendered = useRef<boolean>(false);

  useEffect(() => {
    const first = () => {
      enemyManeger.current.moveData.position = {
        x: props.startGrid.gridX * 32 - enemyManeger.current.moveData.size.width / 2,
        y: props.startGrid.gridY * 32 - enemyManeger.current.moveData.size.height / 2,
      };
      intervalId.current = props.globalProps.addIntervalFunction(async () => {
        if (props.playerManeger === null) {
          return;
        }
        const enemyTmp = await invoke<EnemyManeger>("enemy_move_auto", { 
          enemyManeger: enemyManeger.current,
          playerManeger: props.playerManeger,
          gameManeger: props.globalProps.gameManeger
        });
        enemyManeger.current = enemyTmp;
        setObjectRenderingData({
          position: {
            x: enemyManeger.current.moveData.position.x,
            y: enemyManeger.current.moveData.position.y
          },
          angle: enemyManeger.current.moveData.angle
        });
      });
    };
    if (firstRendered.current) {
      return;
    }
    firstRendered.current = true;
    first();
  }, []);

  return (
    <img 
      className="enemy" 
      style={{ 
        top: objectRenderingData.position.y, 
        left: objectRenderingData.position.x, 
        transform: `rotate(${objectRenderingData.angle}deg)` 
      }}
      src="./src/assets/img/enemy.gif"
    />
  );
}

export default Enemy;