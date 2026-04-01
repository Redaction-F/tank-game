import { StageMap } from "../../game_maneger/collision_maneger"

// ステージの外側
function StageAround(props: { stage: StageMap }) {
  return (
    <div className="grid-around">
      {/* ステージの外側(上) */}
      <div className="grid-row">
        {
          new Array(props.stage.numberOfCol + 2).fill(true).map((_, colIndex) => {
            return <div className="grid grid-wall" key={colIndex}></div>
          })
        }
      </div>
      {/* ステージの外側(左右) */}
      {
        new Array(props.stage.numberOfRow).fill(true).map((_, rowIndex) => {
          return <div className="grid-row" key={rowIndex}>
            <div className="grid grid-wall"></div>
            {
              new Array(props.stage.numberOfCol).fill(true).map((_, colIndex) => {
                return <div className="grid" key={colIndex}></div>
              })
            }
            <div className="grid grid-wall"></div>
          </div>
        })
      }
      {/* ステージの外側(下) */}
      <div className="grid-row">
        {
          new Array(props.stage.numberOfCol + 2).fill(true).map((_, colIndex) => {
            return <div className={"grid grid-wall"} key={colIndex}></div>
          })
        }
      </div>
    </div>
  )
}

export default StageAround;