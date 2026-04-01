import { initGameManeger } from "./logic";
import Grid from "./components/grid";
import "./App.css";

function App() {
  const gameManeger = initGameManeger();

  document.addEventListener("keydown", (e) => { gameManeger.controller.checkKeydown(e); }, false);
  document.addEventListener("keyup", (e) => { gameManeger.controller.checkKeyUp(e); }, false);

  return (
    <main className="container">
      <Grid gameManeger={gameManeger} />
    </main>
  );
}

export default App;
