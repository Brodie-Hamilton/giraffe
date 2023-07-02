import "./style/header.css";
import { DataSource } from "./DataTable";
import { Plus } from "react-feather";

export const Header = ({
  dataSource,
  dataSources,
  setDataSource
}: {
  dataSource: DataSource;
  dataSources: Readonly<DataSource[]>;
  setDataSource: (name: string) => void;
}): JSX.Element => (
  <div className="header">
    <span>
      <a href="https://giraffe.build" title="You">
        <img src="giraffe.svg" alt="giraffe" />
      </a>
      <span className="plus">
        <Plus />
      </span>
      <a href="https://brodiehamilton.com" title="The Guy You Should Hire">
        <img src="brodie.svg" alt="brodie" />
      </a>
    </span>
    <span style={{ float: "right" }}>
      <select
        name="files"
        id="file-select"
        onChange={(e) => setDataSource(e.target.value)}
      >
        {dataSources.map((ds) => {
          const isSelected = dataSource.name === ds.name;
          return (
            <option value={ds.name} selected={isSelected}>
              {ds.title}
            </option>
          );
        })}
      </select>
    </span>
  </div>
);

export default Header;
