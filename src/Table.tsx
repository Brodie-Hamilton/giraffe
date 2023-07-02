import "./style/table.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import { formatColumnTitle } from "./functions";
import { TableVirtuoso } from "react-virtuoso";
import Highlighter from "react-highlight-words";
import { MouseEventProvider, MouseEventContext } from "./MouseEventContext";
import { CellContext, CellProvider } from "./CellContext";
import { DataContext } from "./DataContext";
import CellReference from "./CellReference";
import { ChevronUp, ChevronDown } from "react-feather";

const TableHeader = ({
  headerFields
}: {
  headerFields: string[];
}): JSX.Element => {
  const { setSort, sortColumn, sortAscending } = useContext(DataContext);
  const headerColumns = headerFields.map((field, index) => {
    let chevron;
    if (sortColumn === field) {
      chevron = <span>{sortAscending ? <ChevronUp /> : <ChevronDown />}</span>;
    }
    return (
      <th
        key={`th-${index}`}
        scope="col"
        onClick={() => setSort(field)}
        className="clickable"
      >
        {formatColumnTitle(field)}
        {chevron}
      </th>
    );
  });
  return <tr>{headerColumns}</tr>;
};

const TableCell = ({
  cellRef,
  rowIndex,
  headerKey,
  cellData,
  onDataChange
}: {
  cellRef: CellReference;
  rowIndex: number;
  headerKey: string;
  cellData: any;
  onDataChange: (newValue: string, rowIndex: number, headerKey: string) => void;
}) => {
  const [newValue, setNewValue] = useState<string>(cellData);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {
    reportMouseDown,
    reportMousePosition,
    reportMouseUp,
    reportMouseOver
  } = useContext(MouseEventContext);
  const { searchTerm, activeCell } = useContext(DataContext);
  const { selected, primary, draggedOver, dragSelected } = useContext(
    CellContext
  );

  useEffect(() => {
    if (!isEditing && cellData !== newValue) {
      // Handling for column sorting and reordering.
      // The cellData value is reassigned and we need to update our state ref.
      // This intentionally only hooks into the cellData prop.
      setNewValue(cellData);
    }
  }, [cellData, newValue, isEditing]);

  const isSearchHit = cellRef.equals(activeCell);
  const isPrimary = cellRef.equals(primary);
  const isSelected = selected.some((cell) => cellRef.equals(cell));
  const isDraggedOver = cellRef.equals(draggedOver);
  const isDragSelected = dragSelected.some((cell) => cellRef.equals(cell));

  let content;
  if (isEditing) {
    const onLeave = () => {
      setIsEditing(false);
      setNewValue(cellData);
    };
    const onSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setIsEditing(false);
        onDataChange(newValue, rowIndex, headerKey);
      }
    };
    content = (
      <input
        defaultValue={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        onBlur={onLeave}
        onKeyPress={onSubmit}
        type="text"
        autoFocus
      />
    );
  } else {
    content = (
      <Highlighter
        highlightClassName="highlight"
        searchWords={[searchTerm]}
        textToHighlight={cellData}
      />
    );
  }

  let className;
  if (isSearchHit) {
    className = "search-hit";
  } else if (isPrimary || isSelected) {
    className = "selected";
  } else if (isDragSelected) {
    className = "dragged-to";
  } else if (isDraggedOver) {
    className = "dragged-over";
  }

  return (
    <td
      key={cellRef.id}
      id={cellRef.id}
      className={className}
      title={cellData}
      onDoubleClick={() => setIsEditing(true)}
      onMouseDown={(e) => reportMouseDown(e, cellRef)}
      onMouseMove={(e) => reportMousePosition(e, cellRef)}
      onMouseUp={(e) => reportMouseUp(e, cellRef)}
      onMouseOver={(e) => reportMouseOver(e, cellRef)}
    >
      {content}
    </td>
  );
};

const TableRow = ({
  headerFields,
  rowIndex,
  rowData,
  onDataChange
}: {
  headerFields: string[];
  rowIndex: number;
  rowData: string[];
  onDataChange: (newValue: string, rowIndex: number, headerKey: string) => void;
}): JSX.Element => (
  <>
    {headerFields.map((headerKey: string, columnIndex: number) => {
      const cellRef = new CellReference(rowIndex, columnIndex);
      const cellData = rowData[headerKey];
      return (
        <TableCell
          key={cellRef.id}
          cellRef={cellRef}
          rowIndex={rowIndex}
          headerKey={headerKey}
          cellData={cellData}
          onDataChange={onDataChange}
        />
      );
    })}
  </>
);

export const DataCopyWrapper = ({
  children,
  data,
  headerFields
}: {
  children: JSX.Element | JSX.Element[];
  data: string[][];
  headerFields: string[];
}) => {
  const { selected } = useContext(CellContext);
  const onKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "c" && e.ctrlKey) {
      if (selected.length > 0) {
        const selectedData = selected.map((cell: CellReference) => {
          const headerField = headerFields[cell.columnIndex];
          return data[cell.rowIndex][headerField];
        });
        const clipboard = selectedData.join(",");
        navigator.clipboard.writeText(clipboard);
      }
    }
  };
  return (
    <div className="copy-wrapper" onKeyDown={onKeyDown}>
      {children}
    </div>
  );
};

export const Table = ({
  headerFields,
  data,
  onDataChange
}: {
  headerFields: string[];
  data: string[][];
  onDataChange: (newValue: string, rowIndex: number, headerKey: string) => void;
}): JSX.Element => {
  const virtuoso = useRef(null);

  const { activeCell, sortColumn, sortAscending } = useContext(DataContext);

  useEffect(() => {
    if (virtuoso.current && activeCell) {
      virtuoso.current.scrollToIndex({
        index: activeCell.rowIndex,
        align: "start",
        behaviour: "smooth"
      });
    }
  }, [activeCell]);

  useEffect(() => {
    if (virtuoso.current) {
      virtuoso.current.scrollToIndex({
        index: 0,
        align: "start",
        behaviour: "smooth"
      });
    }
  }, [sortColumn, sortAscending]);

  const renderHeader = () => <TableHeader headerFields={headerFields} />;
  const renderRow = (rowIndex: number, rowData: string[]) => (
    <TableRow
      headerFields={headerFields}
      rowIndex={rowIndex}
      rowData={rowData}
      onDataChange={onDataChange}
    />
  );

  return (
    <MouseEventProvider>
      <CellProvider>
        <DataCopyWrapper data={data} headerFields={headerFields}>
          <TableVirtuoso
            ref={virtuoso}
            className="table"
            style={{ minWidth: headerFields.length * 120 }}
            data={data}
            fixedHeaderContent={renderHeader}
            itemContent={renderRow}
          />
        </DataCopyWrapper>
      </CellProvider>
    </MouseEventProvider>
  );
};

export default Table;
