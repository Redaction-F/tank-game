type Grid = "floor" | "wall" | "cracked_wall";
type StageMap = {
  map: Grid[][],
  numberOfRow: number,
  numberOfCol: number,
};