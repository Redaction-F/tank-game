// 垂直下方向と水平右方向が正

import { ResultKind } from "./components/result/logic";

type Mode = "menu" | {
  mode: "game",
  stageName: string
} | {
  mode: "result",
  resultKind: ResultKind
};

export { type Mode }