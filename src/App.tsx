import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Controller, GameManeger, IntervalFunction } from "./logic";
import Stage from "./components/stage";
import "./App.css";

function App() {
  // ゲーム管理
  const gameManeger = useRef<GameManeger>({
    controller: {
      right: "waiting",
      left: "waiting",
      down: "waiting",
      up: "waiting",
      space: "waiting"
    },
    collisionManeger: {
      walls: [],
      stageSize: {
        width: 0,
        height: 0
      }
    }
  });
  const setGameManeger = (value: GameManeger) => {
    gameManeger.current.controller = value.controller;
    gameManeger.current.collisionManeger = value.collisionManeger;
  };
  const addIntervalFunction = (intervalFunction: IntervalFunction) => {
    return setInterval(() => {
      intervalFunction(setGameManeger);
    }, 20);
  };
  // 初回のみ実行するためのフラグ
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    // 初回のみ実行
    if (firstRendering.current) {
      return;
    }
    firstRendering.current = true;
    // キー入力に対するイベントを設定
    document.addEventListener("keydown", async (e: KeyboardEvent) => {
      const controllerRes = await invoke<Controller>("check_keydown", { controller: gameManeger.current.controller, key: e.key });
      setGameManeger({
        controller: controllerRes,
        collisionManeger: gameManeger.current.collisionManeger
      });
    }, false);
    document.addEventListener("keyup", async (e: KeyboardEvent) => {
      const controllerRes = await invoke<Controller>("check_keyup", { controller: gameManeger.current.controller, key: e.key });
      setGameManeger({
        controller: controllerRes,
        collisionManeger: gameManeger.current.collisionManeger
      });
    }, false);
  }, []);

  return (
    <main className="container">
      <Stage gameManeger={gameManeger.current} setGameManeger={setGameManeger} addIntervalFunction={addIntervalFunction} />
    </main>
  );
}

export default App;
