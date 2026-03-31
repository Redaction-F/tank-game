import Self from "../self";

function GridMain(props: { stage: StageMap }) {
  return (
    <div className="grid-main">
      {
        props.stage.map.map((row, row_index) => 
          <div className="grid-row" id={String(row_index)} key={row_index}>
            {
              row.map((v, col_index) => {
                return <div className={`grid-col ${
                  v === "floor"
                  ? "grid-floor"
                  : v === "wall"
                  ? "grid-wall"
                  : "grid-cracked-wall"
                }`} id={String(col_index)} key={col_index}></div>
              })
            }
          </div>
        )
      }
      <Self />
    </div>
  )
}

export default GridMain;