import { createContext, useContext, useEffect, useState } from "react";
import { MouseEventContext } from "./MouseEventContext";
import CellReference from "./CellReference";
import { pushColumns } from "./functions";
import { useImmer } from "use-immer";

interface CellContextProps {
  selected: CellReference[];
  primary?: CellReference;
  draggedOver?: CellReference;
  dragSelected: CellReference[];
}

export const CellContext = createContext<CellContextProps>(
  {} as CellContextProps
);

export const CellProvider = ({ children }: { children: JSX.Element }) => {
  const [primary, setPrimary] = useState<CellReference>();
  const [selected, updateSelected] = useImmer<CellReference[]>([]);
  const [dragSelected, updateDragSelected] = useImmer<CellReference[]>([]);
  const [draggedOver, setDraggedOver] = useState<CellReference>();

  const { dragStartCell, dragCurrentCell, dragEndCell, clickCell } = useContext(
    MouseEventContext
  );

  useEffect(() => {
    if (clickCell === undefined && primary === undefined) {
      // First load, nothing to do.
      return;
    }
    if (selected.length > 1) {
      // We have other selections, wipe them and only select this.
      setPrimary(clickCell);
      const selected = clickCell !== undefined ? [clickCell] : [];
      updateSelected(selected);
      return;
    }
    if (!clickCell || clickCell.equals(primary)) {
      setPrimary(undefined);
      updateSelected([]);
    } else {
      setPrimary(clickCell);
      updateSelected([clickCell]);
    }
  }, [clickCell]);

  useEffect(() => {
    setPrimary(dragStartCell);
    updateSelected([]);
    const selected = dragStartCell !== undefined ? [dragStartCell] : [];
    updateDragSelected(selected);
  }, [dragStartCell]);

  useEffect(() => {
    updateSelected(dragSelected);
    setDraggedOver(undefined);
    setPrimary(undefined);
  }, [dragEndCell]);

  useEffect(() => {
    setDraggedOver(dragCurrentCell);
    if (dragCurrentCell && primary) {
      const selected: CellReference[] = [];
      pushColumns(
        selected,
        primary.columnIndex,
        primary.rowIndex,
        primary.columnIndex - dragCurrentCell.columnIndex,
        primary.rowIndex - dragCurrentCell.rowIndex
      );
      updateDragSelected(selected);
    }
  }, [dragCurrentCell]);

  const value = {
    selected: selected,
    primary: primary,
    draggedOver: draggedOver,
    dragSelected: dragSelected
  };
  return <CellContext.Provider value={value}>{children}</CellContext.Provider>;
};
