function GridAround(props: { stage: StageMap }) {
  return (
    <div className="grid-around">
      <div className="grid-row">
        {
          new Array(props.stage.numberOfCol + 2).fill(true).map((_, col_index) => {
            return <div className="grid-col grid-wall" key={col_index}></div>
          })
        }
      </div>
      {
        new Array(props.stage.numberOfRow).fill(true).map(() => {
          return <div className="grid-row">
            <div className="grid-col grid-wall"></div>
            {
              new Array(props.stage.numberOfCol).fill(true).map((_, col_index) => {
                return <div className="grid-col" key={col_index}></div>
              })
            }
            <div className="grid-col grid-wall"></div>
          </div>
        })
      }
      <div className="grid-row">
        {
          new Array(props.stage.numberOfCol + 2).fill(true).map((_, col_index) => {
            return <div className={"grid-col grid-wall"} key={col_index}></div>
          })
        }
      </div>
    </div>
  )
}

export default GridAround;