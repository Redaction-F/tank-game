import { gridMapCol, gridMapRow, StageData } from "./logic"

// ステージの外側
function StageAround(props: { stageData: StageData }) {
  return (
    <div className="grid-around">
      {/* ステージの外側(上) */}
      <div className="grid-row">
        {
          new Array(gridMapCol(props.stageData) + 2).fill(true).map((_, colIndex) => {
            return <div className="grid grid-wall" key={colIndex}></div>
          })
        }
      </div>
      {/* ステージの外側(左右) */}
      {
        new Array(gridMapRow(props.stageData)).fill(true).map((_, rowIndex) => {
          return <div className="grid-row" key={rowIndex}>
            <div className="grid grid-wall"></div>
            {
              new Array(gridMapCol(props.stageData)).fill(true).map((_, colIndex) => {
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
          new Array(gridMapCol(props.stageData) + 2).fill(true).map((_, colIndex) => {
            return <div className={"grid grid-wall"} key={colIndex}></div>
          })
        }
      </div>
    </div>
  )
}

export default StageAround;