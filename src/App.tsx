import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Controller, GameManeger, initGameManeger, IntervalFunction } from "./logic";
import Stage from "./components/stage";
import "./style.css";

function App() {
  // ゲーム管理オブジェクト
  const gameManeger = useRef<GameManeger>(initGameManeger());
  // ゲーム管理オブジェクトの更新
  // ゲーム管理オブジェクトそのものは維持する
  const setGameManeger = (value: GameManeger): void => {
    gameManeger.current.controller = value.controller;
    gameManeger.current.collisionManeger = value.collisionManeger;
  };
  // 定期実行する関数を設定
  // 設定する関数はゲーム管理オブジェクト更新関数を引数に取れる
  const addIntervalFunction = (intervalFunction: IntervalFunction): number => {
    return setInterval(() => {
      intervalFunction(setGameManeger);
    }, 20);
  };
  // 初回のみ実行するためのフラグ
  const firstRendered = useRef<boolean>(false);

  useEffect(() => {
    // 初回のみ実行
    if (firstRendered.current) {
      return;
    }
    firstRendered.current = true;
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
      <Stage setGameManeger={setGameManeger} globalProps={{
        gameManeger: gameManeger.current,
        addIntervalFunction: addIntervalFunction
      }} />
    </main>
  );
}

export default App;
