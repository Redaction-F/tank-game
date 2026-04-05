import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Controller, GameManeger } from "./logic";
import Stage from "./components/stage";
import "./App.css";

function App() {
  // ゲーム管理
  const gameManeger = useRef<GameManeger>({
    controller: {
      rightPressed: false,
      leftPressed: false,
      downPressed: false,
      upPressed: false,
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
  // 初回のみ実行するためのフラグ
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    // 初回のみ実行
    if (!firstRendering.current) {
      // キー入力に対するイベントを設定
      document.addEventListener("keydown", async (e: KeyboardEvent) => {
        gameManeger.current.controller = await invoke<Controller>("check_key_down", { controller: gameManeger.current.controller, key: e.key });
      }, false);
      document.addEventListener("keyup", async (e: KeyboardEvent) => {
        gameManeger.current.controller = await invoke<Controller>("check_key_up", { controller: gameManeger.current.controller, key: e.key });
      }, false);
      firstRendering.current = true;
    }
  }, []);

  return (
    <main className="container">
      <Stage gameManeger={gameManeger.current} setGameManeger={setGameManeger} />
    </main>
  );
}

export default App;
