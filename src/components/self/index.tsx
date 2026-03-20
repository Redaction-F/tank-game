import { useEffect, useRef, useState } from "react";
import { controller } from "../controller";
import "./self.css"

// 上下左右の方向
type Direction = "U" | "D" | "L" | "R";
// 方向反転
function revDirection(direction: Direction) {
  if (direction === "U") {
    return "D";
  } else if (direction === "D") {
    return "U";
  } else if (direction === "L") {
    return "R";
  } else {
    return "L";
  }
}

function Self() {
  // x座標(左下原点)
  const [x, setX] = useState<number>(0);
  // y座標(左下原点)
  const [y, setY] = useState<number>(0);
  // 角度
  const [angle, setAngle] = useState<number>(0);
  // コントローラーを読むsetIntervalの返り値
  const readController = useRef<number | null>(null);
  // 角度に応じた動く方向
  const moveAngle = useRef<Direction[]>(["R", "R", "R", "R", "R", "R", "R", "R", "R", "R"]);
  const moveAngleIndex = useRef<number>(0);

  function move(direction: Direction) {
    if (direction === "U") {
      setY((pre) => pre + 1);
    } else if (direction === "D") {
      setY((pre) => pre - 1);
    } else if (direction === "L") {
      setX((pre) => pre - 1);
    } else {
      setX((pre) => pre + 1);
    }
  }

  function moveByController() {
    if (controller.getRightPressed()) {
      setAngle((pre) => (pre + 357) % 360);
    }
    if (controller.getLeftPressed()) {
      setAngle((pre) => (pre + 3) % 360);
    }
    if (controller.getUpPressed()) {
      move(moveAngle.current[moveAngleIndex.current]);
      moveAngleIndex.current += 1;
      moveAngleIndex.current %= moveAngle.current.length;
    }
    if (controller.getDownPressed()) {
      moveAngleIndex.current += moveAngle.current.length - 1;
      moveAngleIndex.current %= moveAngle.current.length;
      move(revDirection(moveAngle.current[moveAngleIndex.current]));
    }
  }

  useEffect(() => {
    if (readController.current !== null) {
      clearInterval(readController.current);
      readController.current = null;
    }
    readController.current = setInterval(moveByController, 20);
  }, []);

  // 角度によって動く方向を決定
  useEffect(() => {
    const [moreDirection, lessDirection, miniAngle]: [Direction, Direction, number] = 
      angle < 45
      ? ["R", "U", angle]
      : angle < 90
      ? ["U", "R", 90 - angle]
      : angle < 135
      ? ["U", "L", 135 - angle]
      : angle < 180
      ? ["L", "U", 180 - angle]
      : angle < 225
      ? ["L", "D", 225 - angle]
      : angle < 270
      ? ["D", "L", 270 - angle]
      : angle < 315
      ? ["D", "R", 315 - angle]
      : ["R", "D", 360 - angle];
    const moreDirectionFullCount = 10;
    const lessDirectionFullCount = Math.ceil(Math.tan(miniAngle * Math.PI / 180) * 10);
    console.log(`[Val]\n\tminiAngke: ${miniAngle}\n\tmoreFull: ${moreDirectionFullCount}\n\tlessFull: ${lessDirectionFullCount}`);
    let moreDirectionCount = 0;
    let lessDirectionCount = 0;
    moveAngle.current = [];
    for (let i = 0; i < moreDirectionFullCount + lessDirectionFullCount; i++) {
      if ((moreDirectionCount / moreDirectionFullCount) <= (lessDirectionCount / lessDirectionFullCount) || lessDirectionCount === lessDirectionFullCount) {
        moreDirectionCount += 1;
        moveAngle.current.push(moreDirection);
      } else {
        lessDirectionCount += 1;
        moveAngle.current.push(lessDirection);
      }
    }
    console.log(`[Val]\n\tmoveAngle: ${moveAngle.current}`);
    moveAngleIndex.current = 0;
  }, [angle])

  return (
    <img className="self" style={{ bottom: y, left: x, transform: `rotate(${360 - angle}deg)` }} src="./src/assets/tank.gif" />
  )
}

export default Self;