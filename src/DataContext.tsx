import { createContext, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { sort } from "fast-sort";
import CellReference from "./CellReference";

export interface DataContextProps {
  searchTerm?: string;
  setSearchTerm: (searchTerm?: string) => void;
  onNext: () => void;
  hasNext: boolean;
  onPrev: () => void;
  hasPrev: boolean;
  sortColumn?: string;
  sortAscending?: boolean;
  setSort: (columnKey: string) => void;
  rowHitCount: number;
  cellHitCount: number;
  activeCellHit?: number;
  activeCell?: CellReference;
}

/**
 * A React context to track and expose the ordering and filtering applied
 * to the underlying data.
 *
 * This isn't used to track the data and any subsequent manipulation itself
 * (that is left up to the component implementing the provider, who
 * conceptually owns the data layer) but rather it is used to share
 * manipulation state conveniently between HOCs.
 *
 * NOTE: This unsafe cast of the default value is acceptbale here as only
 * the Provider makes use use the Context, and it itself always provides
 * the implementation object as the value to any wrapped children.
 */
export const DataContext = createContext<DataContextProps>(
  {} as DataContextProps
);

/**
 * A provider wrapper that acts as a convenience for exposing access to a common
 * instance of our custom state to all nested components.
 */
export const DataProvider = ({
  children,
  data,
  updateData,
  headers
}: {
  children: JSX.Element | JSX.Element[];
  data: string[][];
  updateData: (updateData: string[][]) => void;
  headers: string[];
}) => {
  const [searchTerm, setSearchTerm] = useState<string>();
  const [sortColumn, setSortColumn] = useState<string>();
  const [sortAscending, setSortAscending] = useState<boolean>();
  const [rowHitCount, setRowHitCount] = useState<number>();
  const [cellHits, updateCellHits] = useImmer<CellReference[]>([]);
  const [activeCellHit, setActiveCellHit] = useState<number>();

  useEffect(() => {
    // NOTE: while less safe, we get a noticable performance
    // improvement by avoiding useImmers draft function.
    updateData(
      sortAscending
        ? sort(data).asc((row) => row[sortColumn])
        : sort(data).desc((row) => row[sortColumn])
    );
  }, [sortColumn, sortAscending]);

  useEffect(() => {
    const rowHits = new Set<number>();
    const cellHits: CellReference[] = [];
    if (searchTerm && data) {
      data.forEach((row, rowIndex) => {
        headers.forEach((field, columnIndex) => {
          if (!row[field]) {
            // Skip missing rows.
            return;
          }
          // Case insensitive searching.
          if (row[field].toLowerCase().includes(searchTerm.toLowerCase())) {
            rowHits.add(rowIndex);
            cellHits.push(new CellReference(rowIndex, columnIndex));
          }
        });
      });
    }
    setRowHitCount(rowHits.size);
    updateCellHits(cellHits);
    if (activeCellHit === undefined) {
      setActiveCellHit(cellHits.length ? 0 : undefined);
    }
  }, [searchTerm, data]);

  const setSort = (columnKey: string) => {
    if (sortColumn !== undefined && sortColumn === columnKey) {
      if (sortAscending === undefined) {
        // No sorry currently applied.
        setSortAscending(true);
      } else if (sortAscending === true) {
        // Invert sort direction.
        setSortAscending(false);
      } else {
        // Reset sort on triple click.
        setSortColumn(undefined);
        setSortAscending(undefined);
      }
    } else {
      setSortColumn(columnKey);
      setSortAscending(true);
    }
    setActiveCellHit(undefined);
  };

  const hasNext =
    activeCellHit !== undefined && activeCellHit < cellHits.length - 1;
  const onNext = () => {
    if (hasNext) {
      setActiveCellHit(activeCellHit + 1);
    } else if (cellHits.length > 1) {
      setActiveCellHit(0);
    }
  };
  const hasPrev = activeCellHit !== undefined && activeCellHit > 0;
  const onPrev = () => {
    if (hasPrev) {
      setActiveCellHit(activeCellHit - 1);
    } else if (cellHits.length > 1) {
      setActiveCellHit(cellHits.length - 1);
    }
  };

  let activeCell;
  if (activeCellHit !== undefined) {
    activeCell = cellHits[activeCellHit];
  }

  const value = {
    searchTerm: searchTerm,
    setSearchTerm: setSearchTerm,
    onNext: onNext,
    hasNext: hasNext,
    onPrev: onPrev,
    hasPrev: hasPrev,
    sortColumn: sortColumn,
    sortAscending: sortAscending,
    setSort: setSort,
    rowHitCount: rowHitCount,
    cellHitCount: cellHits.length,
    activeCellHit: activeCellHit,
    activeCell: activeCell
  } as const;
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
