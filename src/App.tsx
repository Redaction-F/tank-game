import { useState } from "react";
import { Mode } from "./logic";
import Menu from "./components/menu";
import Game from "./components/game";
import Result from "./components/result";
import "./style.css";

function App() {
  // アプリのモード
  const [mode, setMode] = useState<Mode>("menu");

  return (
    <main className="container">
      {
        mode === "menu"
        ? <Menu 
            switchToStage={(stageName) => {
              setMode({
                mode: "game",
                stageName
              });
            }}
          />
        : mode.mode === "game"
        ? <Game 
            stageName={mode.stageName}
            switchToGame={(resultKind) => {
              setMode({
                mode: "result",
                resultKind
              })
            }}
          />
        : <Result 
            result={mode.resultKind}
            switchToMenu={() => {
              setMode("menu")
            }}
          />
      }
    </main>
  );
}

export default App;
