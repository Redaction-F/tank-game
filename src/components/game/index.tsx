import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emptyGameManeger, GameManeger, GameProps, gridMapCol, gridMapRow, initStageData, Task, StageData, TasksByPriority, runTasks, addTask, Phase, InputKey, initInputKey } from "./logic";
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
  const gameManeger = useRef<GameManeger>(emptyGameManeger());
  // ゲーム管理データの更新(object自体を更新しない)
  const setGameManeger = (value: GameManeger) => {
    gameManeger.current.collisionManeger = value.collisionManeger;
    gameManeger.current.controller = value.controller;
  };
  const inputKey = useRef<InputKey>(initInputKey());

  // ステージのデータ
  const [stageData, setStageData] = useState<StageData>(initStageData());
  const loadStageCache = useRef<[StageData, GameManeger] | null>(null);
  const loadStage = async () => {
    if (loadStageCache.current !== null) {
      return loadStageCache.current;
    }
    // ステージを読み込み
    return await invoke<[StageData, GameManeger]>(
      "load_stage", 
      { 
        fileName: props.stageName
      }
    );
  };

  // ゲームの終了
  const finishGame = (result: ResultKind) => {
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
    }
    props.switchToGame(result);
  };

  // 定期実行する関数群
  const tasks = useRef<TasksByPriority>(new Map());
  // 定期実行する関数群を定期実行するsetIntervalの返り値
  const intervalId = useRef<number | null>(null);

  // このコンポーネントの子に渡されるprops群
  const gameProps: GameProps = {
    gameManeger: gameManeger.current,
    addTask: (newTask: Task) => (addTask(tasks.current, newTask))
  };

  useEffect(() => {
    // 定期実行する関数群を実行開始
    intervalId.current = setInterval(() => {runTasks(tasks.current)}, 20);

    (async () => {
      const [stageRes, gameManegerRes] = await loadStage();
      // ゲーム管理データを更新
      setGameManeger(gameManegerRes);
      // ステージデータを更新
      setStageData(stageRes)
    })();

    const keydownEvent = (e: KeyboardEvent) => {
      inputKey.current.keydown.add(e.key);
    };
    const keyupEvent = (e: KeyboardEvent) => {
      inputKey.current.keyup.add(e.key);
    };
    // キー入力に対するイベントを設定
    document.addEventListener("keydown", keydownEvent, false);
    document.addEventListener("keyup", keyupEvent, false);
    const cleanTask1 = gameProps.addTask({
      f: async () => {
        const gameManegerRes = await invoke<GameManeger>(
          "controller_update",
          {
            gameManeger: gameManeger.current,
            keydown: Array.from(inputKey.current.keydown),
            keyup: Array.from(inputKey.current.keyup)
          }
        );
        setGameManeger(gameManegerRes);
        inputKey.current.keydown.clear();
        inputKey.current.keyup.clear();
      },
      priority: Phase.Input,
      memo: "read controller(Input)"
    });
    
    // ゲーム終了を監視する定期実行関数
    const cleanTask2 = gameProps.addTask({
      f: () => {
        // 敵が全ていなくなったら
        if (gameManeger.current.collisionManeger.enemyManegers.every((v) => v.isDead)) {
          finishGame("clear");
        }
        // 自分がいなくなったら
        if (gameManeger.current.collisionManeger.playerManeger.isDead) {
          finishGame("gameover");
        }
      }, 
      priority: Phase.RunFinally, 
      memo: "check end(RunFinally)"
    });

    return () => {
      cleanTask1();
      cleanTask2();
      document.removeEventListener("keydown", keydownEvent);
      document.removeEventListener("keyup", keyupEvent);
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