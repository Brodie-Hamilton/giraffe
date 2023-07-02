import Papa from "papaparse";
import { CellReference } from "./CellReference";

export function idForCell(rowIndex: number, headerIndex: number) {
  return `cell-${rowIndex}-${headerIndex}`;
}

export function formatColumnTitle(columnTitle: string) {
  return columnTitle.replace(/_/g, " ");
}

export function pluralise(count: number, word: string, plural?: string) {
  if (count > 1) {
    return plural ? plural : word + "s";
  }
  return word;
}

export function formatNumber(number: number) {
  return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

export function dataToCSV(data: string[][]): string {
  return Papa.unparse(data);
}

export function pushCellsForColumn(
  selected: CellReference[],
  columnIndex: number,
  rowIndex: number,
  yDelta: number
) {
  let yLocal = yDelta;
  if (yLocal >= 0) {
    while (yLocal >= 0) {
      selected.push(new CellReference(rowIndex - yLocal, columnIndex));
      yLocal--;
    }
  } else if (yLocal <= 0) {
    while (yLocal <= 0) {
      selected.push(new CellReference(rowIndex - yLocal, columnIndex));
      yLocal++;
    }
  }
}

export function pushColumns(
  selected: CellReference[],
  columnIndex: number,
  rowIndex: number,
  xDelta: number,
  yDelta: number
) {
  let xLocal = xDelta;
  pushCellsForColumn(selected, columnIndex, rowIndex, yDelta);
  if (xLocal > 0) {
    while (xLocal > 0) {
      pushCellsForColumn(selected, columnIndex - xLocal, rowIndex, yDelta);
      xLocal--;
    }
  } else if (xLocal < 0) {
    while (xLocal < 0) {
      pushCellsForColumn(selected, columnIndex - xLocal, rowIndex, yDelta);
      xLocal++;
    }
  }
}
