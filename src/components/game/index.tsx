import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emptyGameManager, GameManager, GameProps, gridMapCol, gridMapRow, initStageData, Task, StageData, TasksByPriority, runTasks, addTask, Phase, InputKey, initInputKey } from "./logic";
import { ResultKind } from "../result/logic";
import StageAround from "./StageAround";
import StageMain from "./StageMain";
import "./style.css"

// ステージ
function Game(props: {
  stageName: string,
  switchToGame: (resultKind: ResultKind) => void
}) {
  // ゲーム管理データ
  const gameManager = useRef<GameManager>(emptyGameManager());
  // ゲーム管理データの更新(object自体を更新しない)
  const setGameManager = (value: GameManager) => {
    gameManager.current.collisionManager = value.collisionManager;
    gameManager.current.controller = value.controller;
  };
  const setGameManagerMap = (value: (value: GameManager) => void) => {
    value(gameManager.current);
  };
  const inputKey = useRef<InputKey>(initInputKey());
  const addInputKey = (key: string, upDown: "up" | "down") => {
    if (upDown === "down") {
      inputKey.current.keydown.add(key);
    } else {
      inputKey.current.keyup.add(key);
    }
  };

  // ステージのデータ
  const [stageData, setStageData] = useState<StageData>(initStageData());
  const loadStageCache = useRef<[StageData, GameManager] | null>(null);
  const loadStage = async () => {
    if (loadStageCache.current !== null) {
      return loadStageCache.current;
    }
    // ステージを読み込み
    return await invoke<[StageData, GameManager]>(
      "load_stage", 
      { 
        fileName: props.stageName
      }
    );
  };

  // ゲームの終了
  const finishGame = (result: ResultKind) => {
    props.switchToGame(result);
  };

  // 定期実行する関数群
  const tasks = useRef<TasksByPriority>(new Map());
  // 定期実行する関数群を定期実行するsetIntervalの返り値
  const intervalId = useRef<number | null>(null);

  // このコンポーネントの子に渡されるprops群
  const gameProps: GameProps = {
    gameManager: gameManager.current,
    setGameManager,
    setGameManagerMap,
    addTask: (newTask: Task) => (addTask(tasks.current, newTask))
  };

  useEffect(() => {
    (async () => {
      const [stageRes, gameManagerRes] = await loadStage();
      // ゲーム管理データを更新
      setGameManager(gameManagerRes);
      // ステージデータを更新
      setStageData(stageRes)
    })();

    const keydownEvent = (e: KeyboardEvent) => {
      console.log(`keydown: ${e.key}`);
      addInputKey(e.key, "down");
    };
    const keyupEvent = (e: KeyboardEvent) => {
      console.log(`keyup: ${e.key}`);
      addInputKey(e.key, "up");
    };
    // キー入力に対するイベントを設定
    document.addEventListener("keydown", keydownEvent, false);
    document.addEventListener("keyup", keyupEvent, false);
    const clearTask1 = gameProps.addTask({
      f: async () => {
        const keydownArray = Array.from(inputKey.current.keydown);
        inputKey.current.keydown.clear();
        const keyupArray = Array.from(inputKey.current.keyup);
        inputKey.current.keyup.clear();
        const gameManagerRes = await invoke<GameManager>(
          "controller_update",
          {
            gameManager: gameManager.current,
            keydown: keydownArray,
            keyup: keyupArray
          }
        );
        setGameManager(gameManagerRes);
      },
      priority: Phase.Input,
      memo: "read controller(Input)"
    });
    
    // ゲーム終了を監視する定期実行関数
    const clearTask2 = gameProps.addTask({
      f: () => {
        // 敵が全ていなくなったら
        if (gameManager.current.collisionManager.enemyManagers.every((v) => v.isDead)) {
          finishGame("clear");
        }
        // 自分がいなくなったら
        if (gameManager.current.collisionManager.playerManager.isDead) {
          finishGame("gameover");
        }
      }, 
      priority: Phase.RunFinally, 
      memo: "check end(RunFinally)"
    });

    // 定期実行する関数群を実行開始
    intervalId.current = setInterval(() => {runTasks(tasks.current)}, 20);

    return () => {
      clearTask1();
      clearTask2();
      if (intervalId.current !== null) {
        clearInterval(intervalId.current);
      }
      document.removeEventListener("keydown", keydownEvent, false);
      document.removeEventListener("keyup", keyupEvent, false);
    };
  }, []);

  return (
    <div 
      className="stage"
      style={{
        width: `${(gridMapCol(stageData) + 2) * 32}px`,
        height: `${(gridMapRow(stageData) + 2) * 32}px`
      }}
    >
      <StageAround 
        stageData={stageData} 
        key={stageData.stageId + 2000}
      />
      <StageMain 
        stage={stageData}
        gameProps={gameProps}
        key={stageData.stageId}
      />
    </div>
  )
}

export default Game;