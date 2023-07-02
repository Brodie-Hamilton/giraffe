import { idForCell } from "./functions";

export class CellReference {
  rowIndex: number;
  columnIndex: number;
  id: string;

  constructor(rowIndex: number, columnIndex: number) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.id = idForCell(rowIndex, columnIndex);
  }

  public equals(obj?: CellReference): boolean {
    return obj !== undefined && obj !== null && obj.id === this.id;
  }
}

export default CellReference;
