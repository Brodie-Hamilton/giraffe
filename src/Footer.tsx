import "./style/footer.css";
import { useContext } from "react";
import { DataContext } from "./DataContext";
import { ChevronUp, ChevronDown, Download } from "react-feather";
import { pluralise, formatNumber } from "./functions";

const SearchBar = (): JSX.Element => {
  const {
    searchTerm,
    setSearchTerm,
    onNext,
    hasNext,
    onPrev,
    hasPrev,
    rowHitCount,
    cellHitCount,
    activeCellHit
  } = useContext(DataContext);
  let searchHitInfo, searchResultInfo;
  if (searchTerm) {
    if (activeCellHit !== undefined) {
      searchHitInfo = <span>{`[${activeCellHit + 1}/${cellHitCount}]`}</span>;
    } else {
      searchHitInfo = <span>[0/0]</span>;
    }
    searchResultInfo = (
      <span>
        {`Found ${cellHitCount} ${pluralise(cellHitCount, "hit")} across 
        ${rowHitCount} ${pluralise(rowHitCount, "row")}.`}
      </span>
    );
  }
  const searchInput = (
    <div className="search">
      <span className="search-bar">
        <input
          type="text"
          onChange={(e) => setSearchTerm(e.target.value)}
          defaultValue={searchTerm}
          placeholder="Search Data..."
        />
      </span>
      <span className="actions">
        <span title="Jump To Previous">
          <ChevronUp
            className={cellHitCount > 1 && hasPrev ? "clickable" : "disabled"}
            onClick={onPrev}
          />
        </span>
        <span title="Jump To Next">
          <ChevronDown
            className={cellHitCount > 1 && hasNext ? "clickable" : "disabled"}
            onClick={onNext}
          />
        </span>
      </span>
      <span className="results">
        {searchHitInfo}
        {searchResultInfo}
      </span>
    </div>
  );
  return searchInput;
};

export const Footer = ({
  totalColumns,
  totalRows,
  onDownload
}: {
  totalColumns: number;
  totalRows: number;
  onDownload: () => void;
}) => {
  let totalCells = 0;
  if (totalColumns > 0 && totalRows > 0) {
    totalCells = totalColumns * totalRows;
  }
  const cells = formatNumber(totalCells);
  const columns = formatNumber(totalColumns);
  const rows = formatNumber(totalRows);
  return (
    <div className="footer">
      <div className="search">
        <SearchBar />
      </div>
      <div className="stats">
        <span>
          {`Rendering ${cells} ${pluralise(totalCells, "cell")} 
          across ${columns} ${pluralise(totalColumns, "column")} 
          and ${rows} ${pluralise(totalRows, "row")}.`}
        </span>
        <span
          className="download clickable"
          title="Download as CSV"
          onClick={onDownload}
        >
          <span onClick={onDownload}>
            <Download />
          </span>
        </span>
      </div>
    </div>
  );
};

export default Footer;
