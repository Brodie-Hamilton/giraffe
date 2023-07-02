import { createContext, useState } from "react";
import CellReference from "./CellReference";

export interface MouseEventContextProps {
  reportMouseDown: (
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ) => void;
  reportMousePosition: (
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ) => void;
  reportMouseUp: (
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ) => void;
  reportMouseOver: (
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ) => void;
  dragStartCell?: CellReference;
  dragCurrentCell?: CellReference;
  dragEndCell?: CellReference;
  clickCell?: CellReference;
}

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Custom hook to coordinate the logic around mouse events within our table.
 *
 * This exposes values and functions that allow:
 * - Cells to report actions being performed on them.
 * - The table to determine the state of the underlying cells.
 * - The business logic to determine which cells are selected and highlighted.
 */
export function useMouseEvent(): MouseEventContextProps {
  // Stores the active mouse position BEFORE we detect a drag state.
  // Cleared upon drag state detection.
  const [mousePosition, setMousePosition] = useState<MousePosition>();

  // If in a drag state state, stores the cell that was selected at drag start.
  const [dragStartCell, setDragStartCell] = useState<CellReference>();

  // If in a drag state, tracks the current cell which the user is dragging over.
  const [dragCurrentCell, setDragCurrentCell] = useState<CellReference>();

  // After a drag state, tracks the cell which the user dragged to.
  const [dragEndCell, setDragEndCell] = useState<CellReference>();

  // Outside of a drag state, tracks the cell clicked (and selected).
  const [clickCell, setClickCell] = useState<CellReference>();

  function clearDrag(): void {
    setDragStartCell(undefined);
    setDragCurrentCell(undefined);
  }

  function isDragInProgress(): boolean {
    return dragStartCell !== undefined;
  }

  function reportMouseDown(
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ): void {
    setMousePosition({ x: e.screenX, y: e.screenY });
    if (isDragInProgress()) {
      clearDrag();
    } else {
      if (cell.equals(clickCell)) {
        setClickCell(undefined);
      } else {
        setClickCell(cell);
      }
      setDragStartCell(cell);
    }
  }

  function reportMousePosition(
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ): void {
    if (mousePosition !== undefined && !isDragInProgress()) {
      // Check to see if the mouse has moved (while down) more than 5 pixels.
      const { x, y } = mousePosition;
      if (Math.abs(x - e.screenX) > 5 || Math.abs(y - e.screenY) > 5) {
        // Delete the mouse position to remove drag check ref.
        setMousePosition(undefined);
      }
    }
  }

  function reportMouseUp(
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ) {
    if (isDragInProgress()) {
      setDragEndCell(dragStartCell);
      clearDrag();
    }
    setMousePosition(undefined);
    setDragStartCell(undefined);
  }

  function reportMouseOver(
    e: React.MouseEvent<Element, MouseEvent>,
    cell: CellReference
  ) {
    if (isDragInProgress() && !cell.equals(dragCurrentCell)) {
      setDragCurrentCell(cell);
    }
  }

  return {
    reportMouseDown,
    reportMousePosition,
    reportMouseUp,
    reportMouseOver,
    dragStartCell,
    dragCurrentCell,
    dragEndCell,
    clickCell
  } as const;
}

/**
 * A React context to capture mouse events across the various nested components.
 *
 * This allows us to consolodate all of our logic into a single custom hook (above),
 * create a common provider instance (below), and avoid passing individual values
 * and functions up and down our component heirarchy via props.
 *
 * NOTE: This unsafe cast of the default value is acceptbale here as only the
 * Provider makes use use the Context, and it itself always provides the custom
 * hook as the value to any wrapped children.
 */
export const MouseEventContext = createContext<MouseEventContextProps>(
  {} as MouseEventContextProps
);

/**
 * A provider wrapper that acts as a convenience for exposing access to a common
 * instance of our custom useMouseEvent custom hook to all nested components.
 *
 * It's this convenience that allows all table cells to communicate with a
 * single instance of the custom hook, rather than individual separate instances.
 */
export const MouseEventProvider = ({ children }: { children: JSX.Element }) => (
  <MouseEventContext.Provider value={useMouseEvent()}>
    {children}
  </MouseEventContext.Provider>
);
