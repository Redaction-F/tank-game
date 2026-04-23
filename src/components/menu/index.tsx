import "./style.css";

function Menu(props: {
  switchToStage: (stageName: string) => void
}) {
  return (
    <div className="menu-container">
      <div className="selector">
        <button className="menu-select" onClick={() => props.switchToStage("sample")}>
          Sample
        </button>
        <div className="line"></div>
        <button className="menu-select" onClick={() => props.switchToStage("1")}>
          Stage 1
        </button>
        <div className="line"></div>
        <button className="menu-select" onClick={() => props.switchToStage("2")}>
          Stage 2
        </button>
        <div className="line"></div>
        <button className="menu-select" onClick={() => props.switchToStage("3")}>
          Stage 3
        </button>
      </div>
    </div>
  );
}

export default Menu;