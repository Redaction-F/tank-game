import { StageMap } from "./logic"

function GridAround(props: { stage: StageMap }) {
  return (
    <div className="grid-around">
      <div className="grid-row">
        {
          new Array(props.stage.numberOfCol + 2).fill(true).map((_, colIndex) => {
            return <div className="grid-col grid-wall" key={colIndex}></div>
          })
        }
      </div>
      {
        new Array(props.stage.numberOfRow).fill(true).map((_, rowIndex) => {
          return <div className="grid-row" key={rowIndex}>
            <div className="grid-col grid-wall"></div>
            {
              new Array(props.stage.numberOfCol).fill(true).map((_, colIndex) => {
                return <div className="grid-col" key={colIndex}></div>
              })
            }
            <div className="grid-col grid-wall"></div>
          </div>
        })
      }
      <div className="grid-row">
        {
          new Array(props.stage.numberOfCol + 2).fill(true).map((_, colIndex) => {
            return <div className={"grid-col grid-wall"} key={colIndex}></div>
          })
        }
      </div>
    </div>
  )
}

export default GridAround;