import "./style.css";

function Menu(props: {
  stageStart: (stageName: string) => void
}) {
  return (
    <div className="menu-container">
      <div className="selector">
        <button className="menu-select" onClick={() => props.stageStart("sample")}>
          Sample
        </button>
        <div className="line"></div>
        <button className="menu-select" onClick={() => props.stageStart("1")}>
          Stage 1
        </button>
        <div className="line"></div>
        <button className="menu-select" onClick={() => props.stageStart("2")}>
          Stage 2
        </button>
        <div className="line"></div>
        <button className="menu-select" onClick={() => props.stageStart("3")}>
          Stage 3
        </button>
      </div>
    </div>
  );
}

export default Menu;