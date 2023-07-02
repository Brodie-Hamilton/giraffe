import "./style/main.css";
import { useState } from "react";
import DataTable, { DataSource } from "./DataTable";
import Header from "./Header";
// import athletes20 from "./data/athletes-20.csv";
// import athletes10k from "./data/athletes-10k.csv";
// import athletes250k from "./data/athletes-250k.csv";

// TODO
//  - Summary statistics
//  - Check console for errors + logs
//  - add type support
//  - click / select issues

/**
 * Available data sources for testing. Pick one, or add your own.
 */
const dataSources: Readonly<DataSource[]> = Object.freeze<DataSource[]>([
  // A mini version for testing and small rendering verification.
  { file: "athletes20.csv", name: "athletes20.csv", title: "Athletes (20)" },
  // The default data, as per the task AC.
  { file: "athletes10k.csv", name: "athletes10k.csv", title: "Athletes (10k)" },
  // An amped-up input data source to test the performance of the
  // implementation when dealing with a data set of x10.
  // { file: athletes250k, name: "athletes250k.csv", title: "Athletes (250k)" }
]);

/**
 * App entry point.
 */
export default function App() {
  const [dataSource, setDataSource] = useState<DataSource>(dataSources[1]);
  const selectDataSource = (name: string) => {
    setDataSource(dataSources.find((ds) => ds.name === name) as DataSource);
  };
  return (
    <div className="app">
      <Header
        dataSource={dataSource}
        dataSources={dataSources}
        setDataSource={selectDataSource}
      />
      <DataTable dataSrc={dataSource} />
    </div>
  );
}
