import { initGameManeger } from "./game_maneger/logic";
import Stage from "./components/stage";
import "./App.css";
import { useEffect, useRef } from "react";

function App() {
  // ゲーム管理
  const gameManeger = initGameManeger();
  // 初回のみ実行するためのフラグ
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    // 初回のみ実行
    if (!firstRendering.current) {
      // キー入力に対するイベントを設定
      document.addEventListener("keydown", (e) => { gameManeger.controller.checkKeydown(e); }, false);
      document.addEventListener("keyup", (e) => { gameManeger.controller.checkKeyUp(e); }, false);
      firstRendering.current = true;
    }
  }, [])

  return (
    <main className="container">
      <Stage gameManeger={gameManeger} />
    </main>
  );
}

export default App;
