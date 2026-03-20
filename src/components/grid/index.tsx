import "./gird.css"

type gridBackground = "F" | "W" | "C";

function Grid() {
  const map: gridBackground[][] = [
    ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", ],
    ["W", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "C", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "C", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "W", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "W", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "C", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "C", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "C", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "W", ],
    ["W", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "W", ],
    ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", ],
  ];

  return (
    <div className="grid">
      {
        map.map((row, row_index) => 
          <div className="grid-row" id={String(row_index)} key={row_index}>
            {
              row.map((v, col_index) => {
                return <div className={`grid-col ${
                  v === "F"
                  ? "grid-floor"
                  : v === "C"
                  ? "grid-cracked-wall"
                  : "grid-wall"
                }`} id={String(col_index)} key={col_index}></div>
              })
            }
          </div>
        )
      }
    </div>
  )
}

export default Grid;